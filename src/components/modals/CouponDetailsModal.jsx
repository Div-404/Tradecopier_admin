import React, { useState, useEffect } from 'react';
import { apiGetBilCoupanInfo, COUPON_STATUS_MAP } from '../../services/api';

/**
 * CouponDetailsModal
 * Displays live coupon details via GET_BIL_COUPAN_INFO (Reserve1: coupanId).
 * Enforces Rule 1 (Contrast: text-black badges) & Rule 2 (Minimum 2 spacing).
 */
export default function CouponDetailsModal({ coupanId, initialData, isOpen, onClose }) {
  const [details, setDetails] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !coupanId) return;

    let isMounted = true;
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetBilCoupanInfo(coupanId);
        if (isMounted) {
          if (res?.Coupan) {
            setDetails(res);
          } else if (res) {
            setDetails({ Coupan: res, CoupanID: coupanId });
          } else {
            setDetails(initialData || null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setDetails(initialData || null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [isOpen, coupanId, initialData]);

  if (!isOpen) return null;

  const c = details?.Coupan || initialData?.Coupan || initialData || {};
  const statusInfo = COUPON_STATUS_MAP[c.Status] || COUPON_STATUS_MAP[5] || { label: 'Active', bg: '#dcfce7', color: '#000000', border: '#86efac' };
  const isPercent = Number(c.Type) === 1;
  const isMulti = Number(c.Entry) === 2;

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div 
        className="custom-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: '540px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom border-light">
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', backgroundColor: '#e6f4ea', color: '#166534' }}
            >
              <i className="bi bi-tag-fill fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
                Coupon Specification
              </h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Live policy, redemption bounds, and status from billing engine
              </span>
            </div>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={onClose} aria-label="Close"></button>
        </div>

        {/* Modal Body */}
        <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm me-2 text-dark"></span>
              <span className="text-dark fw-medium">Loading coupon details...</span>
            </div>
          ) : error && !details ? (
            <div className="text-center py-4 text-danger">
              <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
              <span>{error}</span>
            </div>
          ) : (
            <div>
              {/* Highlight Card */}
              <div 
                className="p-3.5 rounded-3 border mb-3 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
              >
                <div>
                  <div className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>COUPON CODE</div>
                  <span className="font-monospace fw-bold text-dark fs-5 letter-spacing-1">
                    {c.Coupan || `ID #${coupanId}`}
                  </span>
                </div>
                <div className="text-end">
                  <span 
                    className="badge rounded-pill px-3 py-1 fw-bold text-black border"
                    style={{ 
                      backgroundColor: statusInfo.bg, 
                      color: '#000000',
                      borderColor: statusInfo.border || '#cbd5e1',
                      fontSize: '0.76rem' 
                    }}
                  >
                    {statusInfo.label}
                  </span>
                  <div className="text-secondary mt-1 font-tabular" style={{ fontSize: '0.72rem' }}>
                    Coupon ID: #{coupanId || details?.CoupanID || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="border rounded-3 p-3 mb-3 bg-white" style={{ borderColor: '#e2e8f0' }}>
                <div className="row g-3" style={{ fontSize: '0.86rem' }}>
                  
                  <div className="col-6">
                    <div className="text-secondary fw-medium mb-1" style={{ fontSize: '0.76rem' }}>Discount Offer</div>
                    <div className="fw-bolder text-dark fs-6 font-tabular">
                      {isPercent ? `${c.Value}% OFF` : `$${c.Value} OFF`}
                    </div>
                    <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      {isPercent ? 'Percentage Discount' : 'Fixed USD Rebate'}
                    </span>
                  </div>

                  <div className="col-6">
                    <div className="text-secondary fw-medium mb-1" style={{ fontSize: '0.76rem' }}>Usage Allowance</div>
                    <div className="fw-bold text-dark">
                      {isMulti ? 'Multiple Uses (Reusable)' : 'Single Use (One-Time)'}
                    </div>
                    <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      Entry Type Code: {c.Entry ?? 2}
                    </span>
                  </div>

                  <div className="col-6 border-top pt-2">
                    <div className="text-secondary fw-medium mb-1" style={{ fontSize: '0.76rem' }}>Minimum Order Cap</div>
                    <div className="fw-bold text-dark font-tabular">
                      ${Number(c.Min ?? c.MinValue ?? 0).toLocaleString()} USD
                    </div>
                  </div>

                  <div className="col-6 border-top pt-2">
                    <div className="text-secondary fw-medium mb-1" style={{ fontSize: '0.76rem' }}>Maximum Profit Cap</div>
                    <div className="fw-bold text-dark font-tabular">
                      {c.Max || c.MaxProfit ? `$${Number(c.Max || c.MaxProfit).toLocaleString()} USD` : 'No Cap'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Description / Comment */}
              {c.Comment && (
                <div className="p-3 rounded-3 bg-light border mb-2" style={{ borderColor: '#e2e8f0' }}>
                  <div className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>INTERNAL COMMENT / NOTE</div>
                  <div className="text-dark" style={{ fontSize: '0.85rem' }}>{c.Comment}</div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-top border-light d-flex justify-content-end bg-light bg-opacity-40">
          <button
            type="button"
            className="btn btn-secondary rounded-3 px-4 py-1.5 fw-semibold"
            style={{ fontSize: '0.86rem' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
