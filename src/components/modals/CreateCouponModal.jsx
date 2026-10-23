import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { apiAddBilCoupan } from '../../services/api';

/**
 * CreateCouponModal
 * Implements Postman ADD_BIL_COUPAN:
 * { Key: "", Coupan: { Value, Coupan, Status, Entry, Type, Min, Max, Comment } }
 * Zero prefilled values & zero placeholders.
 */
export default function CreateCouponModal({ isOpen, onClose, onCouponCreated }) {
  const { showToast } = useSuperAdmin();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    coupan: '',
    value: '',
    type: 1, // 1 = Percentage (%), 2 = Fixed Value ($)
    entry: 2, // 1 = Single Use, 2 = Multiple Use
    minValue: '',
    maxProfit: '',
    status: 5, // 5 = Active/Success (Postman: 1=PENDING, 2=CANCELLED, 3=REJECTED, 4=IN_PROCESS, 5=SUCCESS, 6=FREEZE)
    comment: ''
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coupan.trim()) {
      showToast?.('Please enter a coupon code', 'error');
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      showToast?.('Please enter a valid discount value', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiAddBilCoupan({
        coupan: form.coupan.toUpperCase().trim(),
        value: Number(form.value),
        type: Number(form.type),
        entry: Number(form.entry),
        min: Number(form.minValue || 0),
        max: Number(form.maxProfit || 0),
        status: Number(form.status),
        comment: form.comment.trim(),
      });

      showToast?.(res.MSG_USER || `Coupon ${form.coupan.toUpperCase()} created successfully!`, 'success');
      if (onCouponCreated) {
        onCouponCreated({
          ...form,
          Coupan: form.coupan.toUpperCase().trim(),
          Value: Number(form.value),
          Type: Number(form.type),
          Entry: Number(form.entry),
          Min: Number(form.minValue || 0),
          Max: Number(form.maxProfit || 0),
          Status: Number(form.status),
          Comment: form.comment.trim(),
          Timestamp: new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      console.error('ADD_BIL_COUPAN Error:', err);
      showToast?.('Error creating coupon: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div 
        className="custom-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: '560px',
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
                Create Promotional Coupon
              </h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Setup coupon discount rates, restrictions, and redemption criteria
              </span>
            </div>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="row g-3">
              
              {/* Coupon Code */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Coupon Code
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0 rounded-start-3" style={{ borderColor: '#e2e8f0' }}>
                    <i className="bi bi-upc-scan"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control rounded-end-3 px-3 text-uppercase fw-bold"
                    style={{ height: '44px', fontSize: '0.95rem', letterSpacing: '0.5px', borderColor: '#e2e8f0' }}
                    value={form.coupan}
                    onChange={(e) => handleChange('coupan', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Discount Type
                </label>
                <select
                  className="form-select rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.type}
                  onChange={(e) => handleChange('type', Number(e.target.value))}
                >
                  <option value={1}>Percentage (%)</option>
                  <option value={2}>Fixed Amount ($)</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Discount Value {form.type === 1 ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  required
                />
              </div>

              {/* Usage Entry (Single vs Multiple) */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Usage Limit (Entry)
                </label>
                <select
                  className="form-select rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.entry}
                  onChange={(e) => handleChange('entry', Number(e.target.value))}
                >
                  <option value={2}>Multiple Uses (Reusable)</option>
                  <option value={1}>Single Use (One-Time)</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Status
                </label>
                <select
                  className="form-select rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.status}
                  onChange={(e) => handleChange('status', Number(e.target.value))}
                >
                  <option value={5}>Active</option>
                  <option value={1}>Pending</option>
                  <option value={6}>Frozen</option>
                  <option value={2}>Cancelled</option>
                </select>
              </div>

              {/* Min Order Value */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Min Order Value ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.minValue}
                  onChange={(e) => handleChange('minValue', e.target.value)}
                />
              </div>

              {/* Max Discount (Max Profit Cap) */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Max Discount Cap ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.maxProfit}
                  onChange={(e) => handleChange('maxProfit', e.target.value)}
                />
              </div>

              {/* Comment / Description */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Description / Comment
                </label>
                <textarea
                  className="form-control rounded-3 px-3 py-2"
                  rows="2"
                  style={{ fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={form.comment}
                  onChange={(e) => handleChange('comment', e.target.value)}
                ></textarea>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-3 border-top border-light d-flex justify-content-between align-items-center bg-light bg-opacity-40">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-4 py-2 fw-semibold"
              style={{ fontSize: '0.88rem' }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-neon-primary rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
              style={{ fontSize: '0.9rem' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  <span>Saving Coupon...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  <span>Save Coupon</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
