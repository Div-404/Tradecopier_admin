import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';
import CreateCouponModal from '../../../components/modals/CreateCouponModal';
import { apiGetAdmCoupons, apiValidateCoupon } from '../../../services/api';

export default function FinanceCouponsTab() {
  const { showToast } = useSuperAdmin();

  const [coupons, setCoupons] = useState([
    {
      CoupanID: 1,
      Timestamp: '2026-10-15 10:30:00',
      Coupan: {
        Coupan: 'WELCOME20',
        Value: 20,
        Type: 1, // 1 = %
        Entry: 2, // Multiple
        MinValue: 100,
        MaxProfit: 200,
        Status: 2, // Active
        Comment: '20% off for newly registered broker managers'
      }
    },
    {
      CoupanID: 2,
      Timestamp: '2026-10-18 14:15:00',
      Coupan: {
        Coupan: 'VIP500',
        Value: 500,
        Type: 2, // 2 = $ Fixed
        Entry: 1, // Single use
        MinValue: 1500,
        MaxProfit: 500,
        Status: 2, // Active
        Comment: 'Fixed $500 rebate on enterprise bridge annual packages'
      }
    },
    {
      CoupanID: 3,
      Timestamp: '2026-09-01 09:00:00',
      Coupan: {
        Coupan: 'SUMMEREXPIRED',
        Value: 15,
        Type: 1,
        Entry: 2,
        MinValue: 200,
        MaxProfit: 100,
        Status: 3, // Inactive
        Comment: 'End of summer promotional campaign (Expired)'
      }
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Live Coupon Validator State
  const [testCode, setTestCode] = useState('WELCOME20');
  const [testAmount, setTestAmount] = useState('1000');
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  // Load coupons from server
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const list = await apiGetAdmCoupons();
      if (Array.isArray(list) && list.length > 0) {
        setCoupons(list);
      }
    } catch (err) {
      console.warn("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCouponCreated = (newCouponData) => {
    setCoupons(prev => [
      {
        CoupanID: prev.length + 1,
        Timestamp: new Date().toISOString(),
        Coupan: {
          Coupan: newCouponData.coupan,
          Value: newCouponData.Value,
          Type: newCouponData.Type,
          Entry: newCouponData.Entry,
          MinValue: newCouponData.MinValue,
          MaxProfit: newCouponData.MaxProfit,
          Status: newCouponData.Status,
          Comment: newCouponData.Comment
        }
      },
      ...prev
    ]);
  };

  // Test validate coupon (COUPANx_VALIDATE)
  const handleTestValidate = async (e) => {
    e.preventDefault();
    if (!testCode.trim() || !testAmount) return;

    setValidating(true);
    try {
      const res = await apiValidateCoupon(testCode.trim(), Number(testAmount));
      if (res && res.DisAmt !== undefined) {
        setValidationResult(res);
      } else {
        // Fallback calculation matching COUPANx logic
        const found = coupons.find(c => (c.Coupan?.Coupan || '').toUpperCase() === testCode.trim().toUpperCase());
        if (!found) {
          setValidationResult({ error: 'Coupon code not found' });
        } else if (found.Coupan?.Status !== 2) {
          setValidationResult({ error: 'This coupon is currently inactive or expired' });
        } else if (Number(testAmount) < (found.Coupan?.MinValue || 0)) {
          setValidationResult({ error: `Minimum order amount of $${found.Coupan.MinValue} required` });
        } else {
          let discountAmt = 0;
          let disPercent = 0;
          if (found.Coupan.Type === 1) { // %
            disPercent = found.Coupan.Value;
            discountAmt = (Number(testAmount) * disPercent) / 100;
            if (found.Coupan.MaxProfit && discountAmt > found.Coupan.MaxProfit) {
              discountAmt = found.Coupan.MaxProfit;
            }
          } else { // Fixed
            discountAmt = found.Coupan.Value;
            disPercent = ((discountAmt / Number(testAmount)) * 100).toFixed(1);
          }
          setValidationResult({
            DisAmt: discountAmt,
            Dis: disPercent,
            ID: found.CoupanID || 1,
            FinalAmt: Math.max(0, Number(testAmount) - discountAmt)
          });
        }
      }
    } catch (err) {
      setValidationResult({ error: err.message });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div>
      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCouponCreated={handleCouponCreated}
      />

      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
              Promotional Coupons Directory
            </h5>
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              <i className="bi bi-tag-fill me-2"></i> {coupons.length} Coupons
            </span>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.84rem' }}>
            Manage discount codes, redemption policies, single/multiple entry allowances, and caps.
          </span>
        </div>

        <button
          type="button"
          className="btn btn-neon-primary rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
          style={{ fontSize: '0.88rem' }}
          onClick={() => setIsCreateOpen(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Coupon List Table */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="p-3 border-bottom border-light bg-light bg-opacity-30 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>Active & Registered Coupons</span>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary rounded-2 px-2 py-1"
                onClick={fetchCoupons}
                title="Refresh Coupons"
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                <thead className="table-light text-secondary fw-semibold border-bottom" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    <th className="ps-4 py-3">Code & Comment</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3">Policy / Usage</th>
                    <th className="py-3">Min / Max Cap</th>
                    <th className="pe-4 py-3 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((item, idx) => {
                    const c = item.Coupan || {};
                    const isPercent = Number(c.Type) === 1;
                    const isActive = Number(c.Status) === 2;
                    const isMulti = Number(c.Entry) === 2;

                    return (
                      <tr key={idx} className="transition-all">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge font-tabular px-3 py-1 text-dark border bg-light" style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                              {c.Coupan}
                            </span>
                          </div>
                          {c.Comment && (
                            <span className="text-secondary d-block mt-1" style={{ fontSize: '0.76rem', maxWidth: '280px' }}>
                              {c.Comment}
                            </span>
                          )}
                        </td>

                        <td className="py-3">
                          <div className="fw-bolder text-success fs-6 font-tabular">
                            {isPercent ? `${c.Value}% OFF` : `$${c.Value} OFF`}
                          </div>
                          <span className="text-secondary" style={{ fontSize: '0.74rem' }}>
                            {isPercent ? 'Percentage Discount' : 'Fixed Rebate'}
                          </span>
                        </td>

                        <td className="py-3">
                          <span className="badge rounded-pill bg-light text-dark border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                            {isMulti ? 'Multiple Uses' : 'Single Use'}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="d-flex flex-column font-tabular" style={{ fontSize: '0.78rem' }}>
                            <span className="text-dark">Min: ${c.MinValue || 0}</span>
                            <span className="text-secondary">Cap: ${c.MaxProfit || 'None'}</span>
                          </div>
                        </td>

                        <td className="pe-4 py-3 text-end">
                          <span className={`badge rounded-pill px-3 py-1 fw-bold ${isActive ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`} style={{ fontSize: '0.75rem' }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column: Interactive Coupon Validator Test Tool (COUPANx_VALIDATE) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-shield-check fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bolder text-dark m-0" style={{ fontSize: '0.95rem' }}>
                  Live Coupon Validator
                </h6>
                <span className="text-secondary" style={{ fontSize: '0.76rem' }}>
                  Test calculate discounts before distribution
                </span>
              </div>
            </div>

            <form onSubmit={handleTestValidate}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.82rem' }}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  className="form-control rounded-3 px-3 text-uppercase font-tabular fw-bold"
                  style={{ height: '40px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="e.g. WELCOME20"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.82rem' }}>
                  Order Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control rounded-3 px-3 font-tabular"
                  style={{ height: '40px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-primary w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: '0.86rem' }}
                disabled={validating}
              >
                {validating ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="bi bi-calculator me-2"></i>
                    <span>Validate Coupon</span>
                  </>
                )}
              </button>
            </form>

            {/* Validation Output Card */}
            {validationResult && (
              <div className="mt-3 p-3 rounded-3 border bg-light">
                {validationResult.error ? (
                  <div className="d-flex align-items-center gap-2 text-danger" style={{ fontSize: '0.84rem' }}>
                    <i className="bi bi-x-circle-fill"></i>
                    <span>{validationResult.error}</span>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center gap-1 text-success fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Coupon Valid & Applicable!</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                      <span className="text-secondary">Original Amount:</span>
                      <strong className="text-dark">${Number(testAmount).toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                      <span className="text-secondary">Discount ({validationResult.Dis}%):</span>
                      <strong className="text-success">-${Number(validationResult.DisAmt).toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between pt-1 border-top" style={{ fontSize: '0.9rem' }}>
                      <span className="fw-bold text-dark">Payable Amount:</span>
                      <strong className="fw-bolder text-primary">
                        ${validationResult.FinalAmt !== undefined ? validationResult.FinalAmt.toFixed(2) : (Number(testAmount) - Number(validationResult.DisAmt)).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
