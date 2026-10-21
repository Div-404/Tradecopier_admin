import React from 'react';

export default function ViewInvoiceModal({ transaction, isOpen, onClose }) {
  if (!isOpen || !transaction) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div 
        className="custom-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-light bg-light bg-opacity-50">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '42px', height: '42px', backgroundColor: '#EDFAE6', color: '#166534' }}
            >
              <i className="bi bi-receipt-cutoff fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>Subscription Receipt</h5>
              <span className="text-secondary font-tabular" style={{ fontSize: '0.8rem' }}>
                {transaction.invoiceNumber} • {transaction.id}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close shadow-none" 
            onClick={onClose}
          ></button>
        </div>

        {/* Invoice Body */}
        <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          
          <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
            <div>
              <span className="badge-custom badge-success-glow mb-2">
                <i className="bi bi-check-circle-fill"></i>
                {transaction.status.toUpperCase()}
              </span>
              <h4 className="fw-bold text-dark mt-1 financial-value">{formatCurrency(transaction.amount)}</h4>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Paid on {transaction.date}
              </span>
            </div>
            <div className="text-end">
              <span className="text-secondary d-block" style={{ fontSize: '0.74rem' }}>BILLED TO:</span>
              <span className="fw-bold text-dark d-block">{transaction.brokerName}</span>
              <span className="text-secondary font-tabular" style={{ fontSize: '0.78rem' }}>{transaction.serverName}</span>
            </div>
          </div>

          <div className="bg-light rounded-3 p-3 mb-4">
            <div className="row g-3" style={{ fontSize: '0.85rem' }}>
              <div className="col-6">
                <span className="text-secondary d-block" style={{ fontSize: '0.74rem' }}>PACKAGE TIER:</span>
                <span className="fw-bold text-dark">{transaction.planName}</span>
              </div>
              <div className="col-6">
                <span className="text-secondary d-block" style={{ fontSize: '0.74rem' }}>BILLING CYCLE:</span>
                <span className="fw-semibold text-dark">{transaction.billingCycle}</span>
              </div>
              <div className="col-6">
                <span className="text-secondary d-block" style={{ fontSize: '0.74rem' }}>PAYMENT METHOD:</span>
                <span className="fw-semibold text-dark">{transaction.paymentMethod}</span>
              </div>
              <div className="col-6">
                <span className="text-secondary d-block" style={{ fontSize: '0.74rem' }}>REFERENCE / DETAILS:</span>
                <span className="fw-semibold text-dark font-tabular">{transaction.paymentDetails}</span>
              </div>
            </div>
          </div>

          <div className="border-top pt-3 text-secondary text-center" style={{ fontSize: '0.76rem' }}>
            TradeCopier Multi-Broker Financial Gateway • Automated SaaS Billing Engine
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-top border-light bg-light bg-opacity-30 d-flex align-items-center justify-content-end gap-2">
          <button 
            type="button" 
            className="btn btn-light-custom" 
            onClick={onClose}
          >
            Close
          </button>
          <button 
            type="button" 
            className="btn btn-neon-primary px-3"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer"></i>
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
