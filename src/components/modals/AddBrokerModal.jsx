import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function AddBrokerModal({ isOpen, onClose }) {
  const { addBroker, packages, brokers } = useSuperAdmin();

  const [formData, setFormData] = useState({
    managerId: '',
    name: '',
    type: 'LIVE',
    accounts: 100,
    status: 'Connected',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    license: '',
    serverName: '',
    serverIp: '198.51.100.22:443',
    platform: 'MetaTrader 5',
    planId: packages[0]?.id || 'plan-cross',
    notes: 'Registered via SuperAdmin console.'
  });

  // Auto assign next sequential Manager ID when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const nextId = (100000 + (brokers?.length || 0) + 1).toString();
      setFormData(prev => ({
        ...prev,
        managerId: prev.managerId || nextId
      }));
    }
  }, [isOpen, brokers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && value) {
        if (!prev.serverName) {
          next.serverName = `${value.replace(/[^a-zA-Z0-9]/g, '')}-Live01`;
        }
        if (!prev.email) {
          next.email = `compliance@${value.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const selectedPkg = packages.find(p => p.id === formData.planId) || packages[0];

    addBroker({
      ...formData,
      planName: selectedPkg?.name || 'Cross-Broker Trade Copier'
    });

    onClose();
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div 
        className="custom-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-light bg-light bg-opacity-50">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '42px', height: '42px', backgroundColor: '#EDFAE6', color: '#166534' }}
            >
              <i className="bi bi-buildings-fill fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>Register Broker Platform</h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Simulate a broker registering their trading platform (Defaults to <strong>Pending Approval</strong>)
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
          <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="row g-3">
              
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>MANAGER ID <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control font-monospace fw-bold" 
                  name="managerId" 
                  value={formData.managerId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>TYPE</label>
                <select 
                  className="form-select fw-semibold" 
                  name="type" 
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="LIVE">LIVE (Live Trading Server)</option>
                  <option value="DEMO">DEMO (Demo Testing Server)</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>ACCOUNTS</label>
                <input 
                  type="number" 
                  className="form-control fw-bold" 
                  name="accounts" 
                  value={formData.accounts}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-7">
                <label className="form-label">Brokerage Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="name" 
                  placeholder="e.g. FP Markets Global"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Jurisdiction / Country</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="country" 
                  placeholder="e.g. Australia, UK, Cyprus"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Regulatory License #</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="license" 
                  placeholder="e.g. ASIC #373387 / FCA #684312"
                  value={formData.license}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contact Person Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="contactPerson" 
                  placeholder="e.g. Arthur Pendelton"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contact Email <span className="text-danger">*</span></label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  placeholder="e.g. compliance@broker.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contact Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="phone" 
                  placeholder="e.g. +44 20 7946 0192"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Trading Platform</label>
                <select 
                  className="form-select" 
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  <option value="MetaTrader 5">MetaTrader 5 (MT5 Manager)</option>
                  <option value="MetaTrader 4">MetaTrader 4 (MT4)</option>
                  <option value="MT4 & MT5 Hybrid">MT4 & MT5 Hybrid Bridge</option>
                  <option value="cTrader">cTrader API</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Server Identifier <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control font-tabular" 
                  name="serverName" 
                  placeholder="e.g. FPMarkets-Live02"
                  value={formData.serverName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Server IP & API Port</label>
                <input 
                  type="text" 
                  className="form-control font-tabular" 
                  name="serverIp" 
                  placeholder="e.g. 198.51.100.22:443"
                  value={formData.serverIp}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">Requested Subscription Package</label>
                <select 
                  className="form-select" 
                  name="planId" 
                  value={formData.planId} 
                  onChange={handleChange}
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.subtitle || 'Module'}) — ${p.monthlyPrice}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <div className="p-3 rounded-3 bg-light border text-secondary" style={{ fontSize: '0.8rem' }}>
                  <i className="bi bi-info-circle text-warning me-1"></i>
                  By default, newly registered broker platforms are saved with status <strong>Pending</strong>. You will be able to review, approve, or cancel them from the Broker Registrations table.
                </div>
              </div>

            </div>
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
              className="btn btn-neon-primary px-4"
            >
              <i className="bi bi-hdd-network"></i>
              <span>Connect Broker Bridge</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
