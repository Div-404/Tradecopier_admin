import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { apiAddAdmUserPackage } from '../../services/api';

// The 8 official copier types mapped cleanly for the select dropdown
const PACKAGE_TYPES = [
  { id: 1, code: "MTM_ACC_TO_ACC", label: "Internal Trade Copier" },
  { id: 2, code: "ANY_ACC_TO_ACC", label: "Cross-Broker Trade Copier" },
  { id: 3, code: "FUND_TO_MT_GRP", label: "Fund to MT Group" },
  { id: 4, code: "ACCOUNT_TO_MT_GRP", label: "Account to MT Group" },
  { id: 5, code: "DATA_MT_TO_MT", label: "Broker Data Shifter" },
  { id: 6, code: "MT_ACC_TO_ANY_ACC", label: "LP Bridge" },
  { id: 7, code: "MAMM", label: "MAMM" },
  { id: 8, code: "PAMM", label: "PAMM" },
];

export default function CreatePackageModal({ isOpen, onClose, onPackageCreated, initialData = null, initialType = 1 }) {
  const { addSubscriptionPackage, showToast } = useSuperAdmin();
  const [submitting, setSubmitting] = useState(false);

  // Form state precisely matching design & API structure
  const [formState, setFormState] = useState({
    Key: "",
    Pkg: "ITC Starter",
    Master: 2,
    Slave: 50,
    Type: initialType || 1,
    TradeProp: 2, // 1 - Disabled, 2 - Enabled
    RiskManager: 2, // 1 - Disabled, 2 - Enabled
    Amount: 100,
    Duration_Days: 30,
    Information: "Recommended",
    Admin_Msg: "Add Package"
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const oPkg = initialData.oPkg || initialData;
        setFormState({
          Key: initialData.Key || "",
          Pkg: oPkg.Pkg || initialData.name || "ITC Package",
          Master: oPkg.Master ?? initialData.maxMasters ?? 2,
          Slave: oPkg.Slave ?? initialData.maxFollowers ?? 50,
          Type: Number(oPkg.Type || initialType || 1),
          TradeProp: Number(oPkg.TradeProp ?? 2),
          RiskManager: Number(oPkg.RiskManager ?? 2),
          Amount: Number(oPkg.Amount ?? initialData.monthlyPrice ?? 100),
          Duration_Days: Number(oPkg.Duration_Days ?? initialData.durationDays ?? 30),
          Information: oPkg.Information || initialData.badge || "",
          Admin_Msg: oPkg.Admin_Msg || initialData.description || ""
        });
      } else {
        setFormState({
          Key: "",
          Pkg: "ITC Pro Package",
          Master: 5,
          Slave: 20,
          Type: Number(initialType || 1),
          TradeProp: 2,
          RiskManager: 2,
          Amount: 150,
          Duration_Days: 30,
          Information: "Recommended",
          Admin_Msg: "Add Package"
        });
      }
    }
  }, [isOpen, initialData, initialType]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.Pkg.trim()) {
      showToast?.("Please enter a package name", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Call API POST /ADD_ADM_USER_PACKAGE
      const res = await apiAddAdmUserPackage({
        pkg: formState.Pkg,
        master: formState.Master,
        slave: formState.Slave,
        type: formState.Type,
        tradeProp: formState.TradeProp,
        riskManager: formState.RiskManager,
        amount: formState.Amount,
        durationDays: formState.Duration_Days,
        information: formState.Information,
        adminMsg: formState.Admin_Msg,
        key: formState.Key,
      });

      showToast?.(res.MSG_USER || (isEditing ? "Package updated successfully!" : "Package created successfully!"), "success");

      // Also update local state for immediate UI feedback
      addSubscriptionPackage?.({
        Key: formState.Key,
        oPkg: {
          Pkg: formState.Pkg,
          Master: Number(formState.Master),
          Slave: Number(formState.Slave),
          Type: Number(formState.Type),
          TradeProp: Number(formState.TradeProp),
          RiskManager: Number(formState.RiskManager),
          Amount: Number(formState.Amount),
          Duration_Days: Number(formState.Duration_Days),
          Information: formState.Information,
          Admin_Msg: formState.Admin_Msg
        }
      });

      if (onPackageCreated) onPackageCreated();
      onClose();
    } catch (err) {
      console.error("ADD_ADM_USER_PACKAGE Error:", err);
      showToast?.("API Error: " + err.message, "error");
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
          maxWidth: '680px',
          borderRadius: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header - Matching Design */}
        <div className="d-flex align-items-start justify-content-between p-4 pb-3 border-0">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '44px', height: '44px', backgroundColor: '#e6f4ea', color: '#166534' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0" style={{ fontSize: '1.2rem', letterSpacing: '-0.2px' }}>
                {isEditing ? 'Edit Subscription Package' : 'Create Subscription Package'}
              </h5>
              {/* <div className="text-secondary mt-0.5" style={{ fontSize: '0.82rem' }}>
                Configure subscription parameters, broker account quotas, and copy routing type.
              </div> */}
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close shadow-none ms-2" 
            onClick={onClose}
          ></button>
        </div>

        {/* Form Body - Image 2 exact styling */}
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-2" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="row g-3">

              {/* Package Name & Package Type */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Package Name
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-lg rounded-3 fs-6 px-3" 
                  style={{ borderColor: '#e2e8f0', height: '44px', fontSize: '0.9rem' }}
                  placeholder="ITC Starter"
                  value={formState.Pkg}
                  onChange={(e) => handleInputChange('Pkg', e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Package Type
                </label>
                <select 
                  className="form-select form-select-lg rounded-3 fs-6 px-3"
                  style={{ borderColor: '#e2e8f0', height: '44px', fontSize: '0.9rem' }}
                  value={formState.Type}
                  onChange={(e) => handleInputChange('Type', Number(e.target.value))}
                >
                  {PACKAGE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Master Accounts & Investor Accounts (Slave) */}
              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-white" style={{ borderColor: '#e2e8f0' }}>
                  <label className="form-label fw-bold text-dark mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-person-fill text-primary" style={{ fontSize: '0.95rem' }}></i>
                    Master Accounts
                  </label>
                  <input 
                    type="number" 
                    className="form-control rounded-3 px-3" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    min="1"
                    placeholder="2"
                    value={formState.Master}
                    onChange={(e) => handleInputChange('Master', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-white" style={{ borderColor: '#e2e8f0' }}>
                  <label className="form-label fw-bold text-dark mb-2 d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-people-fill text-success" style={{ fontSize: '0.95rem' }}></i>
                    Investor Accounts <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>(Slave)</span>
                  </label>
                  <input 
                    type="number" 
                    className="form-control rounded-3 px-3" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    placeholder="50"
                    value={formState.Slave}
                    onChange={(e) => handleInputChange('Slave', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Trade Proportion & Risk Manager Toggle Switches */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1.5" style={{ fontSize: '0.85rem' }}>
                  Trade Proportion
                </label>
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="form-check form-switch custom-toggle d-flex align-items-center gap-2 m-0 cursor-pointer"
                    onClick={() => handleInputChange('TradeProp', Number(formState.TradeProp) === 2 ? 1 : 2)}
                  >
                    <input 
                      className="form-check-input cursor-pointer" 
                      type="checkbox" 
                      role="switch" 
                      checked={Number(formState.TradeProp) === 2}
                      onChange={() => {}}
                      style={{ 
                        width: '44px', 
                        height: '24px', 
                        backgroundColor: Number(formState.TradeProp) === 2 ? '#16a34a' : '#cbd5e1',
                        borderColor: 'transparent'
                      }}
                    />
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
                      {Number(formState.TradeProp) === 2 ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1.5" style={{ fontSize: '0.85rem' }}>
                  Risk Manager
                </label>
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="form-check form-switch custom-toggle d-flex align-items-center gap-2 m-0 cursor-pointer"
                    onClick={() => handleInputChange('RiskManager', Number(formState.RiskManager) === 2 ? 1 : 2)}
                  >
                    <input 
                      className="form-check-input cursor-pointer" 
                      type="checkbox" 
                      role="switch" 
                      checked={Number(formState.RiskManager) === 2}
                      onChange={() => {}}
                      style={{ 
                        width: '44px', 
                        height: '24px', 
                        backgroundColor: Number(formState.RiskManager) === 2 ? '#16a34a' : '#cbd5e1',
                        borderColor: 'transparent'
                      }}
                    />
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
                      {Number(formState.RiskManager) === 2 ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Fee & Duration */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Subscription Fee
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-secondary border-end-0 rounded-start-3" style={{ fontSize: '0.9rem', borderColor: '#e2e8f0' }}>$</span>
                  <input 
                    type="number" 
                    className="form-control border-start-0 border-end-0 fw-bold text-dark px-2" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    min="0"
                    placeholder="100"
                    value={formState.Amount}
                    onChange={(e) => handleInputChange('Amount', e.target.value)}
                    required
                  />
                  <span className="input-group-text bg-light text-secondary border-start-0 rounded-end-3" style={{ fontSize: '0.82rem', borderColor: '#e2e8f0' }}>USD</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Duration (Days)
                </label>
                <div className="input-group mb-1.5">
                  <span className="input-group-text bg-light text-secondary border-end-0 rounded-start-3" style={{ borderColor: '#e2e8f0' }}>
                    <i className="bi bi-calendar3"></i>
                  </span>
                  <input 
                    type="number" 
                    className="form-control border-start-0 border-end-0 px-2" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    placeholder="30"
                    value={formState.Duration_Days}
                    onChange={(e) => handleInputChange('Duration_Days', e.target.value)}
                    required
                  />
                  <span className="input-group-text bg-light text-secondary border-start-0 rounded-end-3" style={{ fontSize: '0.82rem', borderColor: '#e2e8f0' }}>Days</span>
                </div>
                {/* Duration Pills */}
                <div className="d-flex align-items-center gap-1.5">
                  {[30, 36, 90, 180, 365].map(d => {
                    const isSelected = Number(formState.Duration_Days) === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-medium transition-all"
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: isSelected ? '#166534' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#64748b',
                          border: isSelected ? '1px solid #166534' : '1px solid #e2e8f0'
                        }}
                        onClick={() => handleInputChange('Duration_Days', d)}
                      >
                        {d}d
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Information / Tag & Admin Message */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Information / Tag
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-secondary border-end-0 rounded-start-3" style={{ borderColor: '#e2e8f0' }}>
                    <i className="bi bi-bookmark"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 rounded-end-3 px-2" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    placeholder="Recommended"
                    value={formState.Information}
                    onChange={(e) => handleInputChange('Information', e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Admin Message
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-secondary border-end-0 rounded-start-3" style={{ borderColor: '#e2e8f0' }}>
                    <i className="bi bi-chat-left"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 rounded-end-3 px-2" 
                    style={{ borderColor: '#e2e8f0', height: '42px', fontSize: '0.9rem' }}
                    placeholder="Add Package"
                    value={formState.Admin_Msg}
                    onChange={(e) => handleInputChange('Admin_Msg', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-3 d-flex align-items-center justify-content-end gap-2 border-0">
            <button 
              type="button" 
              className="btn btn-light px-4 py-2 rounded-3 fw-medium"
              style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', color: '#475569', fontSize: '0.88rem' }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn px-4 py-2 rounded-3 fw-bold text-white d-flex align-items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: '#166534', borderColor: '#166534', fontSize: '0.88rem' }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="bi bi-check2"></i>
              )}
              <span>{isEditing ? 'Save Package Changes' : 'Create Subscription Package'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
