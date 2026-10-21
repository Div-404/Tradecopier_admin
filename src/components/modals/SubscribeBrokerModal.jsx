import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SubscribeBrokerModal({ pkg, isOpen, onClose }) {
  const { brokers, updateBrokerPlan, showToast } = useSuperAdmin();
  const [selectedBrokerId, setSelectedBrokerId] = useState(brokers[0]?.id || '');
  const [billingCycle, setBillingCycle] = useState('Monthly');

  if (!isOpen || !pkg) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBrokerId) return;

    const broker = brokers.find(b => b.id === selectedBrokerId);
    if (broker) {
      updateBrokerPlan(broker.id, pkg.id, pkg.name);
      showToast(`Successfully subscribed "${broker.name}" to ${pkg.name}!`);
    }
    onClose();
  };

  const selectedBroker = brokers.find(b => b.id === selectedBrokerId);

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div 
        className="custom-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-light bg-light bg-opacity-50">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '42px', height: '42px', backgroundColor: '#22c55e', fontSize: '1.1rem' }}
            >
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>Subscribe Broker</h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Assign <strong>{pkg.name}</strong> to a connected brokerage
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close shadow-none" 
            onClick={onClose}
          ></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            
            {/* Selected Plan Summary Banner */}
            <div className="p-3 rounded-3 mb-3 border bg-light">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark fs-6">{pkg.name}</span>
                <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1" style={{ fontSize: '0.72rem' }}>
                  {pkg.subtitle}
                </span>
              </div>
              <div className="text-secondary small mb-2">{pkg.description}</div>
              <div className="d-flex align-items-baseline gap-2 pt-2 border-top">
                <span className="financial-value fw-bold text-dark fs-5">${pkg.monthlyPrice}</span>
                <span className="text-secondary small">/ month</span>
                <span className="text-muted small ms-2 font-tabular">(${pkg.annualPrice}/yr annual)</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Select Connected Broker <span className="text-danger">*</span></label>
              <select 
                className="form-select"
                value={selectedBrokerId}
                onChange={(e) => setSelectedBrokerId(e.target.value)}
                required
              >
                {brokers.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} [{b.status}] — Currently on: {b.planName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Billing Cycle</label>
              <select 
                className="form-select"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
              >
                <option value="Monthly">Monthly Billing (${pkg.monthlyPrice}/mo)</option>
                <option value="Annual">Annual Billing (${pkg.annualPrice}/yr - Save 17%)</option>
              </select>
            </div>

            {selectedBroker && (
              <div className="p-3 rounded-3 bg-light border text-secondary" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-info-circle text-primary me-2"></i>
                Activating this subscription will route trade permissions and quotas on <strong>{selectedBroker.serverName}</strong> for <strong>{pkg.name}</strong> immediately.
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 px-4 border-top border-light bg-light bg-opacity-30 d-flex align-items-center justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-light-custom" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success text-white fw-bold px-4 d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
            >
              <span>Activate Subscription</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
