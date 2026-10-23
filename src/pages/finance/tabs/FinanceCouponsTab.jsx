import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';
import CreateCouponModal from '../../../components/modals/CreateCouponModal';
import { apiGetBilCoupan, apiDelBilCoupan, COUPON_STATUS_MAP } from '../../../services/api';

export default function FinanceCouponsTab() {
  const { showToast } = useSuperAdmin();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load coupons from server
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const list = await apiGetBilCoupan();
      if (Array.isArray(list)) {
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
          Coupan: newCouponData.Coupan || newCouponData.coupan,
          Value: newCouponData.Value,
          Type: newCouponData.Type,
          Entry: newCouponData.Entry,
          Min: newCouponData.Min ?? newCouponData.MinValue,
          Max: newCouponData.Max ?? newCouponData.MaxProfit,
          Status: newCouponData.Status,
          Comment: newCouponData.Comment
        }
      },
      ...prev
    ]);
  };

  const handleDeleteCoupon = async (item, idx) => {
    const cId = item.CoupanID || item.ID || item.Reserve1 || idx + 1;
    const code = item.Coupan?.Coupan || item.Coupan || `Coupon #${cId}`;
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const res = await apiDelBilCoupan(cId);
      showToast?.(res?.MSG_USER || `Coupon ${code} deleted`, 'success');
      setCoupons(prev => prev.filter((_, i) => i !== idx));
    } catch (err) {
      showToast?.('Failed to delete coupon: ' + err.message, 'error');
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
            <span className="badge rounded-pill bg-success bg-opacity-10 text-black border border-success border-opacity-25 px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
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

      {/* Coupons Directory Table (Full Width) */}
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
                <th className="py-3">Status</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-tag fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <h6 className="fw-bold text-dark">No Promotional Coupons Found</h6>
                    <span className="text-secondary" style={{ fontSize: '0.82rem' }}>
                      Click "Create Coupon" to add promotional discount codes.
                    </span>
                  </td>
                </tr>
              ) : (
                coupons.map((item, idx) => {
                  const c = item.Coupan || item;
                  const isPercent = Number(c.Type) === 1;
                  const statusInfo = COUPON_STATUS_MAP[c.Status] || (Number(c.Status) === 2 ? COUPON_STATUS_MAP[5] : COUPON_STATUS_MAP[1]);
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
                          <span className="text-dark">Min: ${c.Min ?? c.MinValue ?? 0}</span>
                          <span className="text-secondary">Cap: ${(c.Max ?? c.MaxProfit) || 'None'}</span>
                        </div>
                      </td>

                      <td className="py-3">
                        <span 
                          className="badge rounded-pill px-3 py-1 fw-bold"
                          style={{ 
                            backgroundColor: statusInfo.bg, 
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}30`,
                            fontSize: '0.75rem' 
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="pe-4 py-3 text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger border rounded-2 px-2 py-1"
                          onClick={() => handleDeleteCoupon(item, idx)}
                          title="Delete Coupon"
                        >
                          <i className="bi bi-trash3"></i>
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
