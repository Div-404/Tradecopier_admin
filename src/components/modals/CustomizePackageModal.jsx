import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { apiAddUserCustomizePkg } from '../../services/api';

/**
 * CustomizePackageModal
 * Matches Image 2 & StructNxLib BIL_PKG_CUSTOMIZE_ADD:
 * - User: Select broker / profile
 * - Package: Select package
 * - Amount: Custom amount ($)
 * - Validity (Days): Custom validity days
 * - Apply Coupan: ENABLE | DISABLE
 * - Status: ENABLE | DISABLE
 * - Button: Create Package
 */
export default function CustomizePackageModal({ isOpen, onClose, onPackageCustomized }) {
  const { brokers, packages, showToast } = useSuperAdmin();
  const [submitting, setSubmitting] = useState(false);

  // Form state matching Image 2 & BIL_PKG_CUSTOMIZE (Zero prefill)
  const [userId, setUserId] = useState('');
  const [pkgId, setPkgId] = useState('');
  const [amount, setAmount] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [applyCoupan, setApplyCoupan] = useState('ENABLE'); // 'ENABLE' (1) | 'DISABLE' (2)
  const [status, setStatus] = useState('ENABLE'); // 'ENABLE' (1 - Active) | 'DISABLE' (2 - Inactive)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserId('');
      setPkgId('');
      setAmount('');
      setValidityDays('');
      setApplyCoupan('ENABLE');
      setStatus('ENABLE');
    }
  }, [isOpen]);

  // When package selection changes, pre-fill amount and validity from selected package
  const handlePackageChange = (selectedId) => {
    setPkgId(selectedId);
    const found = packages.find(p => String(p.pkgId || p.id) === String(selectedId));
    if (found) {
      setAmount(found.monthlyPrice ?? '');
      setValidityDays(found.durationDays || '');
    } else {
      setAmount('');
      setValidityDays('');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      showToast?.('Please select a user / broker', 'error');
      return;
    }
    if (!pkgId) {
      showToast?.('Please select a package', 'error');
      return;
    }
    if (amount === '' || Number(amount) < 0) {
      showToast?.('Please enter a valid amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const selectedPkg = packages.find(p => String(p.pkgId || p.id) === String(pkgId));
      const res = await apiAddUserCustomizePkg({
        profileId: Number(userId),
        pkgId: Number(pkgId),
        amt: Number(amount),
        pkgCode: selectedPkg?.name || `PKG-${pkgId}`,
        coupanApply: applyCoupan === 'ENABLE' ? 1 : 2,
        validityDays: Number(validityDays || 30),
        status: status === 'ENABLE' ? 1 : 2, // 1 = Active, 2 = Inactive
      });

      showToast?.(res.MSG_USER || 'Customized package created successfully!', 'success');
      if (onPackageCustomized) {
        onPackageCustomized({
          profileId: Number(userId),
          pkgId: Number(pkgId),
          amount: Number(amount),
          validityDays: Number(validityDays),
          coupanApply: applyCoupan,
          status: status,
        });
      }
      onClose();
    } catch (err) {
      console.error('ADD_ADM_PKG_CUSTOMIZE Error:', err);
      showToast?.('Error creating customized package: ' + err.message, 'error');
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
        {/* Header - Matching Image 2 top bar */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom border-light">
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', backgroundColor: '#e6f4ea', color: '#166534' }}
            >
              <i className="bi bi-sliders fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
                Customize Package
              </h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Assign tailored quotas, pricing, and coupon rules for a specific broker
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close shadow-none" 
            onClick={onClose}
          ></button>
        </div>

        {/* Form Body - Exactly matching Image 2 fields */}
        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="d-flex flex-column gap-3">
              
              {/* Field 1: User */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  User
                </label>
                <select
                  className="form-select rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">Select Broker / User...</option>
                  {brokers.map((b) => (
                    <option key={b.id || b.profileId} value={b.profileId || b.managerId}>
                      {b.name} ({b.email || b.serverName}) — ID: {b.profileId || b.managerId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Package */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  Package
                </label>
                <select
                  className="form-select rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={pkgId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  required
                >
                  <option value="">Select Package...</option>
                  {packages.map((p) => (
                    <option key={p.id || p.pkgId} value={p.pkgId || p.id}>
                      {p.name} — ${p.monthlyPrice} USD ({p.durationDays || 30} Days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Amount */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  Amount ($ USD)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0 rounded-start-3" style={{ borderColor: '#e2e8f0' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control rounded-end-3 px-3"
                    style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field 4: Validity (Days) */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  Validity (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control rounded-3 px-3"
                  style={{ height: '44px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  required
                />
              </div>

              {/* Field 5: Apply Coupan (ENABLE | DISABLE) */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  Apply Coupan
                </label>
                <div className="d-flex rounded-3 overflow-hidden border" style={{ borderColor: '#e2e8f0', maxWidth: '320px' }}>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-uppercase d-inline-flex align-items-center justify-content-center transition-all ${
                      applyCoupan === 'ENABLE'
                        ? 'text-white'
                        : 'text-secondary bg-white'
                    }`}
                    style={{
                      fontSize: '0.82rem',
                      backgroundColor: applyCoupan === 'ENABLE' ? '#166534' : 'transparent',
                      border: 'none',
                      borderRadius: 0,
                    }}
                    onClick={() => setApplyCoupan('ENABLE')}
                  >
                    <i className={`bi bi-${applyCoupan === 'ENABLE' ? 'check2-circle' : 'circle'} me-2 fs-6`}></i>
                    <span>ENABLE</span>
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-uppercase d-inline-flex align-items-center justify-content-center transition-all ${
                      applyCoupan === 'DISABLE'
                        ? 'text-white'
                        : 'text-secondary bg-white'
                    }`}
                    style={{
                      fontSize: '0.82rem',
                      backgroundColor: applyCoupan === 'DISABLE' ? '#64748b' : 'transparent',
                      border: 'none',
                      borderRadius: 0,
                    }}
                    onClick={() => setApplyCoupan('DISABLE')}
                  >
                    <i className={`bi bi-${applyCoupan === 'DISABLE' ? 'x-circle' : 'circle'} me-2 fs-6`}></i>
                    <span>DISABLE</span>
                  </button>
                </div>
              </div>

              {/* Field 6: Status (ENABLE | DISABLE) */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  Status
                </label>
                <div className="d-flex rounded-3 overflow-hidden border" style={{ borderColor: '#e2e8f0', maxWidth: '320px' }}>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-uppercase d-inline-flex align-items-center justify-content-center transition-all ${
                      status === 'ENABLE'
                        ? 'text-white'
                        : 'text-secondary bg-white'
                    }`}
                    style={{
                      fontSize: '0.82rem',
                      backgroundColor: status === 'ENABLE' ? '#059669' : 'transparent',
                      border: 'none',
                      borderRadius: 0,
                    }}
                    onClick={() => setStatus('ENABLE')}
                  >
                    <i className={`bi bi-${status === 'ENABLE' ? 'check2-circle' : 'circle'} me-2 fs-6`}></i>
                    <span>ENABLE</span>
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2 fw-bold text-uppercase d-inline-flex align-items-center justify-content-center transition-all ${
                      status === 'DISABLE'
                        ? 'text-white'
                        : 'text-secondary bg-white'
                    }`}
                    style={{
                      fontSize: '0.82rem',
                      backgroundColor: status === 'DISABLE' ? '#64748b' : 'transparent',
                      border: 'none',
                      borderRadius: 0,
                    }}
                    onClick={() => setStatus('DISABLE')}
                  >
                    <i className={`bi bi-${status === 'DISABLE' ? 'x-circle' : 'circle'} me-2 fs-6`}></i>
                    <span>DISABLE</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer - Button "Create Package" matching Image 2 */}
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
                  <span>Creating Package...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle-fill"></i>
                  <span>Create Package</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
