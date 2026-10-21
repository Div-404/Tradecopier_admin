import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function EditBrokerModal({ broker, isOpen, onClose }) {
  const { updateBroker } = useSuperAdmin();

  const [formData, setFormData] = useState({
    managerId: '',
    name: '',
    serverName: '',
    serverIp: '',
    type: 'LIVE',
    accounts: 0,
    status: 'Connected',
    connectedOn: '',
    lastSync: 'Just now',
    platform: 'MetaTrader 5',
    contactPerson: '',
    email: '',
    phone: '',
    license: ''
  });

  useEffect(() => {
    if (broker) {
      setFormData({
        managerId: broker.managerId || broker.id || '',
        name: broker.name || '',
        serverName: broker.serverName || '',
        serverIp: broker.serverIp || '198.51.100.10:443',
        type: broker.type || 'LIVE',
        accounts: broker.accounts ?? 0,
        status: broker.status || 'Connected',
        connectedOn: broker.connectedOn || '10/01/2026 10:30 AM',
        lastSync: broker.lastSync || 'Just now',
        platform: broker.platform || 'MetaTrader 5',
        contactPerson: broker.contactPerson || '',
        email: broker.email || '',
        phone: broker.phone || '',
        license: broker.license || ''
      });
    }
  }, [broker]);

  if (!isOpen || !broker) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'accounts' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    updateBroker(broker.id, formData);
    onClose();
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
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '42px', height: '42px', backgroundColor: '#3B82F6', fontSize: '1.1rem' }}
            >
              <i className="bi bi-pencil-square"></i>
            </div>
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>Edit Broker Registration</h5>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Update connection details, server name, type, and active accounts
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
              
              {/* Manager ID & Broker Name */}
              <div className="col-md-5">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>MANAGER ID</label>
                <input 
                  type="text" 
                  className="form-control font-monospace fw-bold" 
                  name="managerId" 
                  value={formData.managerId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-7">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>BROKER NAME</label>
                <input 
                  type="text" 
                  className="form-control fw-bold" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Server Name & Server IP */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>SERVER NAME</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="serverName" 
                  value={formData.serverName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>SERVER IP & PORT</label>
                <input 
                  type="text" 
                  className="form-control font-tabular" 
                  name="serverIp" 
                  value={formData.serverIp}
                  onChange={handleChange}
                />
              </div>

              {/* Type, Accounts, Status */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>TYPE</label>
                <select 
                  className="form-select fw-semibold" 
                  name="type" 
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="LIVE">LIVE</option>
                  <option value="DEMO">DEMO</option>
                </select>
              </div>

              <div className="col-md-4">
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

              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>STATUS</label>
                <select 
                  className="form-select fw-semibold" 
                  name="status" 
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Connected">Connected</option>
                  <option value="Disconnected">Disconnected</option>
                </select>
              </div>

              {/* Connected On & Last Sync */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>CONNECTED ON</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="connectedOn" 
                  value={formData.connectedOn}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>LAST SYNC</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="lastSync" 
                  value={formData.lastSync}
                  onChange={handleChange}
                />
              </div>

              {/* Contact Person & Email */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>CONTACT PERSON</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="contactPerson" 
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>EMAIL</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="d-flex align-items-center justify-content-end gap-2 p-3 border-top border-light bg-light bg-opacity-50">
            <button 
              type="button" 
              className="btn btn-light-custom px-4" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-4 fw-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
