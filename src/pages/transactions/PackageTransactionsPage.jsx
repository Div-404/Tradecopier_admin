import React, { useState, useMemo } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import ViewInvoiceModal from '../../components/modals/ViewInvoiceModal';

export default function PackageTransactionsPage() {
  const { packages, transactions, brokers } = useSuperAdmin();

  // Modal states
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Transactions filters & search
  const [txnSearch, setTxnSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Currency formatters
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Financial metrics
  const metrics = useMemo(() => {
    const totalTransactionsCount = transactions.length;
    const completedTxns = transactions.filter(t => t.status === 'Completed');
    const totalCollected = completedTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingTxns = transactions.filter(t => t.status === 'Pending');
    const pendingAmount = pendingTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

    const failedTxns = transactions.filter(t => t.status === 'Failed');

    return {
      totalTransactionsCount,
      totalCollected,
      pendingAmount,
      pendingCount: pendingTxns.length,
      completedCount: completedTxns.length,
      failedCount: failedTxns.length
    };
  }, [transactions]);

  // Filtered transactions (with search, statusFilter, paymentFilter, planFilter)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = 
        txn.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
        txn.invoiceNumber.toLowerCase().includes(txnSearch.toLowerCase()) ||
        txn.brokerName.toLowerCase().includes(txnSearch.toLowerCase()) ||
        txn.planName.toLowerCase().includes(txnSearch.toLowerCase()) ||
        (txn.paymentDetails && txn.paymentDetails.toLowerCase().includes(txnSearch.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || txn.paymentMethod.includes(paymentFilter);
      const matchesPlan = planFilter === 'ALL' || txn.planName.toLowerCase() === planFilter.toLowerCase() || txn.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesPlan;
    });
  }, [transactions, txnSearch, statusFilter, paymentFilter, planFilter]);

  const handleOpenInvoice = (txn) => {
    setSelectedTxn(txn);
    setIsInvoiceOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Invoice #", "Broker Name", "Package", "Cycle", "Amount", "Payment Method", "Status", "Date"];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.invoiceNumber,
      `"${t.brokerName}"`,
      `"${t.planName}"`,
      t.billingCycle,
      t.amount,
      `"${t.paymentMethod}"`,
      t.status,
      `"${t.date}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `package_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Invoice Modal */}
      <ViewInvoiceModal 
        transaction={selectedTxn} 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
      />

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.4px' }}>
              Transaction History
            </h4>
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              <i className="bi bi-shield-check me-2"></i> Audited Financial Ledger
            </span>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Comprehensive records of all subscription packages purchased, recurring billing, and settlements.
          </span>
        </div>

        {/* Total Ledger Records Badge */}
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-white text-dark border px-3 py-2 rounded-3 shadow-2xs fw-bold" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-receipt me-2 text-success"></i>
            {transactions.length} Total Transactions
          </span>
        </div>
      </div>

      {/* Financial Overview Stats Cards */}
      <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4 mb-4">
        
        {/* Metric 1: Total Revenue Collected */}
        <div className="col">
          <div className="custom-card p-4 mb-0 h-100 hover-lift">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Total Revenue Collected
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' }}
              >
                <i className="bi bi-bank fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-4">
              {formatCurrency(metrics.totalCollected)}
            </div>
            <div className="text-success d-flex align-items-center gap-1 mt-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-check2-all"></i>
              <span>{metrics.completedCount} settled payments</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Invoices in Review */}
        <div className="col">
          <div className="custom-card p-4 mb-0 h-100 hover-lift">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Invoices in Review
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}
              >
                <i className="bi bi-hourglass-split fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-4">
              {formatCurrency(metrics.pendingAmount)}
            </div>
            <div className="text-warning d-flex align-items-center gap-1 mt-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-clock"></i>
              <span>{metrics.pendingCount} wire transfer pending</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Settled Success Rate */}
        <div className="col">
          <div className="custom-card p-4 mb-0 h-100 hover-lift">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Settlement Rate
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: '#EDFAE6', color: '#166534' }}
              >
                <i className="bi bi-percent fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-4">
              {metrics.totalTransactionsCount > 0 
                ? `${Math.round((metrics.completedCount / metrics.totalTransactionsCount) * 100)}%` 
                : '100%'}
            </div>
            <div className="text-secondary d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-arrow-up-right text-success"></i>
              <span>{metrics.completedCount} of {metrics.totalTransactionsCount} completed</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Failed / Flagged */}
        <div className="col">
          <div className="custom-card p-4 mb-0 h-100 hover-lift">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Failed / Cancelled
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' }}
              >
                <i className="bi bi-x-circle fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-4">
              {metrics.failedCount} <span className="fs-6 fw-normal text-secondary">Invoices</span>
            </div>
            <div className="text-secondary d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-shield-exclamation text-danger"></i>
              <span>Requires payment retry</span>
            </div>
          </div>
        </div>

      </div>

      {/* Subscription Transactions Ledger Card */}
      <div className="custom-card p-0 overflow-hidden shadow-sm">
        
        {/* Header & Filter Toolbar */}
        <div className="p-3 p-xl-4 border-bottom border-light bg-white">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div>
              <h5 className="fw-bolder text-dark m-0 d-flex align-items-center gap-2" style={{ letterSpacing: '-0.3px' }}>
                <span>Subscription Transactions Ledger</span>
                <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                  {filteredTransactions.length} of {transactions.length} records
                </span>
              </h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Audited financial ledger of all subscription payments, wire transfers, cards, and crypto invoices.
              </span>

              {/* Quick Status Filter Pills */}
             

              {/* Plan Name Filter Pills */}
           

            </div>

            {/* Search and Secondary Actions */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="position-relative" style={{ minWidth: '240px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '0.8rem' }}></i>
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-5 pe-3" 
                  placeholder="Search txn ID, broker, invoice..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                />
              </div>

              {/* Plan Filter Dropdown */}
              <select 
                className="form-select form-select-sm"
                style={{ width: '160px', fontSize: '0.78rem' }}
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="ALL">All Packages / Plans</option>
                {packages.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* Payment Method Filter */}
              <select 
                className="form-select form-select-sm"
                style={{ width: '150px', fontSize: '0.78rem' }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Stripe">Stripe (Credit Card)</option>
                <option value="Crypto">Crypto (USDT-TRC20)</option>
                <option value="Wire">Bank Wire Transfer</option>
              </select>

              {/* Export CSV Button */}
              <button 
                type="button" 
                className="btn btn-sm btn-light border d-flex align-items-center gap-2 shadow-2xs"
                style={{ fontSize: '0.78rem' }}
                onClick={handleExportCSV}
              >
                <i className="bi bi-file-earmark-arrow-down text-secondary"></i>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>TRANSACTION & INVOICE</th>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>BROKER ENTITY</th>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>SUBSCRIPTION PACKAGE</th>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>BILLING FREQUENCY</th>
                <th className="text-end" style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>AMOUNT PAID</th>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>PAYMENT METHOD</th>
                <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>TIMESTAMP</th>
                <th className="text-center" style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>STATUS</th>
                <th className="text-end" style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-secondary">
                    <i className="bi bi-receipt fs-1 d-block mb-2 text-muted"></i>
                    <div className="fw-semibold text-dark">No transaction records found</div>
                    <span className="small text-muted">Try adjusting your status or search query.</span>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isCompleted = txn.status === 'Completed';
                  const isPending = txn.status === 'Pending';
                  const isFailed = txn.status === 'Failed';

                  return (
                    <tr key={txn.id}>
                      {/* Txn ID & Invoice */}
                      <td>
                        <div className="fw-bold font-monospace text-dark" style={{ fontSize: '0.85rem' }}>
                          {txn.id}
                        </div>
                        <div className="text-secondary font-tabular" style={{ fontSize: '0.74rem' }}>
                          {txn.invoiceNumber}
                        </div>
                      </td>

                      {/* Broker Entity */}
                      <td>
                        <div className="fw-bold text-dark">{txn.brokerName}</div>
                        <div className="text-secondary font-tabular" style={{ fontSize: '0.74rem' }}>
                          {txn.serverName}
                        </div>
                      </td>

                      {/* Package */}
                      <td>
                        <span className="badge-custom badge-primary-glow" style={{ fontSize: '0.72rem' }}>
                          {txn.planName}
                        </span>
                      </td>

                      {/* Cycle */}
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                          {txn.billingCycle}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="text-end">
                        <div className="financial-value fw-bold text-dark fs-6">
                          {formatCurrency(txn.amount)}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                          USD
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td>
                        <div className="d-flex align-items-center gap-2 text-dark fw-semibold" style={{ fontSize: '0.82rem' }}>
                          {txn.paymentMethod.includes('Stripe') && <i className="bi bi-credit-card-2-front-fill text-primary"></i>}
                          {txn.paymentMethod.includes('Crypto') && <i className="bi bi-currency-bitcoin text-warning"></i>}
                          {txn.paymentMethod.includes('Wire') && <i className="bi bi-bank text-secondary"></i>}
                          <span>{txn.paymentMethod}</span>
                        </div>
                        <div className="text-secondary font-tabular text-truncate" style={{ fontSize: '0.72rem', maxWidth: '170px' }}>
                          {txn.paymentDetails}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="text-secondary font-tabular" style={{ fontSize: '0.78rem' }}>
                        {txn.date}
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        <span className={`badge-custom ${
                          isCompleted ? 'badge-success-glow' :
                          isPending ? 'badge-warning-glow' :
                          isFailed ? 'badge-danger-glow' : 'badge-purple-glow'
                        }`}>
                          <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i>
                          {txn.status}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td className="text-end">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-light border px-3 py-1 shadow-2xs text-secondary"
                          onClick={() => handleOpenInvoice(txn)}
                          title="View Invoice Receipt"
                        >
                          <i className="bi bi-receipt-cutoff me-2"></i>
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
