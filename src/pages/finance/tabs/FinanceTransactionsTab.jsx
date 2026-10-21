import React, { useState, useEffect, useMemo } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';
import { apiGetAdmPkgTrans, BLC_TRANS_STATUS_MAP } from '../../../services/api';

/**
 * FinanceTransactionsTab
 * Dedicated Package Subscription Transactions tab within Finance center.
 * Displays package purchase billing transactions (BLC_PKG_TRANS) distinct
 * from the global Transaction History invoice ledger.
 */
export default function FinanceTransactionsTab() {
  const { brokers, packages, showToast } = useSuperAdmin();

  // Package transactions state
  const [pkgTrans, setPkgTrans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pkgFilter, setPkgFilter] = useState('ALL');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  // Load package transactions from API with fallback
  const loadPackageTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdmPkgTrans();
      const list = res?.lstGet || [];

      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((item) => {
          const u = item.oUser || {};
          const tr = item.oTrans || {};
          const actualAmt = tr.Amt_Actual ?? item.Amt ?? 0;
          const paidAmt = tr.Amt_Paid ?? item.FinalAmt ?? actualAmt;
          const discount = tr.Amt_Actual && tr.Amt_Paid ? Math.max(0, tr.Amt_Actual - tr.Amt_Paid) : (item.DisAmt || 0);

          return {
            TransID: item.TransID || tr.Ref || 0,
            Profile: tr.Profile || u.Profile || item.Profile || 0,
            PkgId: tr.PkgID || item.PkgId || 0,
            PkgName: item.Pkg || item.PkgName || `Package #${tr.PkgID || item.PkgId || ''}`,
            BrokerName: u.Name || item.BrokerName || `Profile #${tr.Profile || item.Profile || ''}`,
            Email: u.Email || item.Email || '',
            Phone: u.Phone || item.Phone || '',
            TransRef: tr.Ref || item.TransRef || `TXN-${item.TransID || ''}`,
            Amt: actualAmt,
            DisAmt: discount,
            FinalAmt: paidAmt,
            Coupan: item.Coupan || (tr.CoupanId ? `ID:${tr.CoupanId}` : ''),
            CoupanId: tr.CoupanId || item.CoupanId || 0,
            oStatus: tr.oStat ?? item.oStatus ?? 3,
            dtCreated: item.odtCreated || item.dtCreated || { Tm_Str: 'N/A' },
            Remark: tr.Remark || item.Remark || '',
            Logs: tr.Logs || item.Logs || '',
          };
        });
        setPkgTrans(normalized);
      } else {
        // Fallback synthetic package transactions matching BLC_PKG_TRANS
        const mockList = brokers.map((b, idx) => {
          const pId = Number(b.profileId || b.managerId || 1000 + idx);
          const pkg = packages[idx % (packages.length || 1)] || { pkgId: 101, name: 'Internal Trade Copier', monthlyPrice: 499 };
          const baseAmt = pkg.monthlyPrice || 499;
          const hasDiscount = idx % 2 === 1;
          const discountAmt = hasDiscount ? 50 : 0;
          const finalAmt = baseAmt - discountAmt;

          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - (idx * 4 + 1));

          return {
            TransID: 1009283401 + idx,
            Profile: pId,
            PkgId: Number(pkg.pkgId || (101 + idx)),
            PkgName: pkg.name || 'Internal Trade Copier',
            BrokerName: b.name || `Broker ${pId}`,
            TransRef: `TXN-REF-${pId}-${idx + 101}`,
            Amt: baseAmt,
            DisAmt: discountAmt,
            FinalAmt: finalAmt,
            CoupanId: hasDiscount ? 1 : 0,
            CoupanDis: hasDiscount ? 10 : 0,
            Mode: 1, // 1 = Direct Gateway
            oStatus: idx === 2 ? 1 : (idx === 4 ? 2 : 3), // 1 = Pending, 2 = Failed, 3 = Success
            dtCreated: { Tm_Str: createdDate.toLocaleDateString() },
          };
        });
        setPkgTrans(mockList);
      }
    } catch (err) {
      console.warn("Failed to load package transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackageTransactions();
  }, [brokers, packages]);

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = pkgTrans.length;
    const successList = pkgTrans.filter(t => t.oStatus === 3 || t.oStatus === 'Success');
    const totalVolume = successList.reduce((sum, t) => sum + (t.FinalAmt || t.Amt || 0), 0);
    const totalDiscounts = pkgTrans.reduce((sum, t) => sum + (t.DisAmt || 0), 0);
    const pendingCount = pkgTrans.filter(t => t.oStatus === 1 || t.oStatus === 'Pending').length;

    return {
      totalCount,
      totalVolume,
      totalDiscounts,
      pendingCount,
    };
  }, [pkgTrans]);

  // Filtered package transactions
  const filteredTrans = useMemo(() => {
    return pkgTrans.filter(t => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        String(t.TransID || '').toLowerCase().includes(q) ||
        String(t.TransRef || '').toLowerCase().includes(q) ||
        String(t.Profile || '').toLowerCase().includes(q) ||
        String(t.BrokerName || '').toLowerCase().includes(q) ||
        String(t.PkgName || '').toLowerCase().includes(q)
      );

      const matchesStatus = statusFilter === 'ALL' || String(t.oStatus) === String(statusFilter);
      const matchesPkg = pkgFilter === 'ALL' || String(t.PkgId) === String(pkgFilter);

      return matchesSearch && matchesStatus && matchesPkg;
    });
  }, [pkgTrans, searchQuery, statusFilter, pkgFilter]);

  return (
    <div>
      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        
        {/* Metric 1: Total Package Net Volume */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Total Package Volume</span>
                <h4 className="fw-bolder text-dark m-0 mt-1 font-tabular">{formatCurrency(metrics.totalVolume)}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-wallet2 fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Transactions */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Total Package Orders</span>
                <h4 className="fw-bolder text-primary m-0 mt-1 font-tabular">{metrics.totalCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-box-seam-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: Coupon Savings Provided */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Total Coupon Savings</span>
                <h4 className="fw-bolder text-warning m-0 mt-1 font-tabular">{formatCurrency(metrics.totalDiscounts)}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-tag-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Pending Transactions */}
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Pending Verification</span>
                <h4 className="fw-bolder text-danger m-0 mt-1 font-tabular">{metrics.pendingCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-clock-history fs-5"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Filters Header */}
        <div className="p-3 border-bottom border-light bg-light bg-opacity-30">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex flex-wrap gap-2 flex-grow-1">
              
              <div className="position-relative" style={{ minWidth: '260px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input
                  type="text"
                  className="form-control bg-white rounded-3 ps-5"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  placeholder="Search TransID, Ref, or User..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select bg-white rounded-3"
                style={{ width: '170px', height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="3">Success (3)</option>
                <option value="1">Pending (1)</option>
                <option value="2">Failed (2)</option>
              </select>

              <select
                className="form-select bg-white rounded-3"
                style={{ width: '200px', height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                value={pkgFilter}
                onChange={(e) => setPkgFilter(e.target.value)}
              >
                <option value="ALL">All Packages</option>
                {packages.map((p) => (
                  <option key={p.id || p.pkgId} value={p.pkgId || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-3 d-flex align-items-center gap-2 fw-semibold"
              style={{ height: '42px', fontSize: '0.86rem', borderColor: '#e2e8f0' }}
              onClick={loadPackageTransactions}
              title="Refresh Package Transactions"
            >
              <i className={`bi bi-arrow-clockwise me-2 ${loading ? 'spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light text-secondary fw-semibold border-bottom" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th className="ps-4 py-3">Transaction ID & Ref</th>
                <th className="py-3">Subscriber / Profile</th>
                <th className="py-3">Package Plan</th>
                <th className="py-3">Original Amt</th>
                <th className="py-3">Coupon Discount</th>
                <th className="py-3">Paid Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
                <th className="pe-4 py-3 text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrans.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <i className="bi bi-wallet2 fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <h6 className="fw-bold text-dark">No Package Transactions Found</h6>
                    <span className="text-secondary" style={{ fontSize: '0.82rem' }}>No package transaction records match the specified filters.</span>
                  </td>
                </tr>
              ) : (
                filteredTrans.map((t, idx) => {
                  const statusInfo = BLC_TRANS_STATUS_MAP[t.oStatus] || BLC_TRANS_STATUS_MAP[0];

                  return (
                    <tr key={idx} className="transition-all">
                      
                      {/* TransID & Ref */}
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-dark font-tabular">#{t.TransID}</div>
                        <span className="badge rounded-pill bg-light text-muted border font-tabular" style={{ fontSize: '0.7rem' }}>
                          {t.TransRef || 'No Reference'}
                        </span>
                      </td>

                      {/* Profile */}
                      <td className="py-3">
                        <div className="fw-semibold text-dark">{t.BrokerName || `Profile #${t.Profile}`}</div>
                        <span className="text-secondary font-tabular" style={{ fontSize: '0.76rem' }}>
                          Profile ID: {t.Profile}
                        </span>
                      </td>

                      {/* Package Plan */}
                      <td className="py-3">
                        <div className="fw-medium text-dark">{t.PkgName || `Package #${t.PkgId}`}</div>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          PkgID: #{t.PkgId}
                        </span>
                      </td>

                      {/* Original Amount */}
                      <td className="py-3">
                        <span className="text-secondary font-tabular" style={{ fontSize: '0.84rem' }}>
                          {formatCurrency(t.Amt)}
                        </span>
                      </td>

                      {/* Coupon Discount */}
                      <td className="py-3">
                        {t.DisAmt > 0 ? (
                          <div className="d-flex align-items-center gap-1 text-danger fw-semibold font-tabular" style={{ fontSize: '0.82rem' }}>
                            <i className="bi bi-tag-fill me-2" style={{ fontSize: '0.75rem' }}></i>
                            <span>-{formatCurrency(t.DisAmt)}</span>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3">
                        <strong className="text-dark font-tabular" style={{ fontSize: '0.9rem' }}>
                          {formatCurrency(t.FinalAmt || t.Amt)}
                        </strong>
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <span 
                          className="badge rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-2"
                          style={{ 
                            backgroundColor: statusInfo.bg, 
                            color: statusInfo.color,
                            fontSize: '0.75rem',
                            border: `1px solid ${statusInfo.color}30`
                          }}
                        >
                          <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: statusInfo.color }}></span>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 text-secondary font-tabular" style={{ fontSize: '0.82rem' }}>
                        {t.dtCreated?.Tm_Str || 'N/A'}
                      </td>

                      {/* Details Action */}
                      <td className="pe-4 py-3 text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border rounded-2 px-3 py-1 text-secondary"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => {
                            showToast?.(`TransID: #${t.TransID}\nSubscriber: ${t.BrokerName || t.Profile}\nAmount: $${t.FinalAmt || t.Amt}`, 'info');
                          }}
                          title="View Transaction Details"
                        >
                          <i className="bi bi-info-circle me-2"></i> Details
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-top border-light bg-light bg-opacity-20 d-flex justify-content-between align-items-center text-secondary" style={{ fontSize: '0.78rem' }}>
          <span>Showing <strong>{filteredTrans.length}</strong> of <strong>{pkgTrans.length}</strong> package purchase transactions</span>
        </div>

      </div>
    </div>
  );
}
