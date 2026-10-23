import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  apiGetUserTypeUrl,
  apiAddEditUserTypeUrl,
  apiDelUserTypeUrl,
  COPIER_TYPE_MAP,
  STATUS_MAP,
  getCopierInfo,
  getStatusInfo,
} from '../../services/api';

export default function BrokerDetailsModal({ broker, isOpen, onClose }) {
  const { refreshBrokerPlanFromUrls } = useSuperAdmin() || {};
  const [activeTab, setActiveTab] = useState('overview');

  // Copier URLs state
  const [urlsList, setUrlsList] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlFormData, setUrlFormData] = useState({
    type: '1',
    url: '',
    oStatus: '2',
    duration: '',
  });

  const profileId = String(broker?.managerId || broker?.profileId || broker?.id?.replace('brk-', '') || '');

  // Fetch URLs when switching to urls tab
  const fetchUrls = async () => {
    setLoadingUrls(true);
    setUrlError(null);
    try {
      const data = await apiGetUserTypeUrl(profileId);
      const urls = Array.isArray(data?.lstURL) ? data.lstURL : [];
      setUrlsList(urls);
    } catch (err) {
      console.error('GET_USER_TYPE_URL error:', err);
      setUrlError(err.message);
      setUrlsList([]);
    } finally {
      setLoadingUrls(false);
    }
  };

  // Fetch URLs when modal opens or profileId changes
  useEffect(() => {
    if (isOpen) {
      fetchUrls();
    }
  }, [isOpen, profileId]);

  // Reset to overview when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setShowUrlForm(false);
      setUrlError(null);
    }
  }, [isOpen]);

  const hasConfiguredPackage = urlsList.length > 0;
  const configuredPackageName = hasConfiguredPackage
    ? urlsList.map(u => getCopierInfo(u.Type).name).join(', ')
    : 'No Package / URLs Configured';

  if (!isOpen || !broker) return null;

  // ADD/EDIT URL
  const handleSaveUrl = async (e) => {
    e.preventDefault();
    setLoadingUrls(true);
    setUrlError(null);
    try {
      await apiAddEditUserTypeUrl({
        profileId,
        type: urlFormData.type,
        url: urlFormData.url,
        oStatus: urlFormData.oStatus,
        duration: urlFormData.duration,
      });
      setShowUrlForm(false);
      await fetchUrls();
      if (refreshBrokerPlanFromUrls) {
        refreshBrokerPlanFromUrls(profileId);
      }
    } catch (err) {
      setUrlError(err.message);
    } finally {
      setLoadingUrls(false);
    }
  };

  // DELETE URL
  const handleDeleteUrl = async (copierType) => {
    if (!window.confirm(`Delete Type ${copierType} URL for Profile ${profileId}?`)) return;
    setLoadingUrls(true);
    setUrlError(null);
    try {
      await apiDelUserTypeUrl(copierType, profileId);
      await fetchUrls();
      if (refreshBrokerPlanFromUrls) {
        refreshBrokerPlanFromUrls(profileId);
      }
    } catch (err) {
      setUrlError(err.message);
    } finally {
      setLoadingUrls(false);
    }
  };

  const isConnected = broker.status === 'Connected' || broker.status === 'Approved';

  return (
    <div className="custom-modal-backdrop">
      <div
        className="custom-modal-dialog modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1060px',
          width: '95%',
          borderRadius: '24px',
          padding: '30px 36px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          border: 'none',
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
                flexShrink: 0
              }}
            >
              <i className="bi bi-layers-half fs-5"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
                Manager Platform Details
              </h3>
              <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                MT5 Bridge & Copier Configuration
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-sm"
            style={{
              width: '38px', height: '38px', borderRadius: '12px', border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc', color: '#64748b', fontSize: '18px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
          >×</button>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
          {[
            { label: 'MANAGER ID', value: profileId, icon: 'bi-fingerprint', iconColor: '#3b82f6', isMonospace: true },
            { label: 'BROKER', value: broker.name, icon: 'bi-buildings-fill', iconColor: '#0ea5e9' },
            { label: 'SERVER', value: broker.serverName, icon: 'bi-hdd-network-fill', iconColor: '#8b5cf6' },
            { 
              label: 'STATUS', 
              value: broker.status, 
              icon: isConnected ? 'bi-shield-fill-check' : 'bi-shield-fill-x', 
              color: isConnected ? '#059669' : '#dc2626', 
              bg: isConnected ? 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)', 
              border: isConnected ? '#bbf7d0' : '#fecaca',
              hasPulse: isConnected
            },
          ].map((d, i) => (
            <div 
              key={i} 
              style={{ 
                background: d.bg || 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
                border: `1px solid ${d.border || '#e2e8f0'}`, 
                borderRadius: '16px', 
                padding: '14px 18px',
                boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: d.color || '#64748b', textTransform: 'uppercase' }}>
                  {d.label}
                </span>
                <i className={`bi ${d.icon}`} style={{ color: d.iconColor || d.color, fontSize: '15px' }}></i>
              </div>
              <div className="d-flex align-items-center gap-2">
                {d.hasPulse && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981', flexShrink: 0 }}></span>
                )}
                <strong 
                  className={d.isMonospace ? 'font-monospace' : ''} 
                  style={{ fontSize: '15.5px', fontWeight: 800, color: d.color || '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {d.value}
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs - Modern Segmented Pill Control */}
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '5px',
          borderRadius: '14px',
          display: 'inline-flex',
          gap: '4px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'bi-grid-fill' },
            { id: 'urls', label: 'Copier Type URLs', icon: 'bi-link-45deg' },
            { id: 'packages', label: 'Packages', icon: 'bi-box-seam-fill' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                border: activeTab === tab.id ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid transparent',
                borderRadius: '10px',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '13.5px',
                padding: '9px 18px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <i className={`bi ${tab.icon}`} style={{ color: activeTab === tab.id ? '#10b981' : '#94a3b8', fontSize: '14px' }}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px 26px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 10px -2px rgba(0, 0, 0, 0.02)'
            }}>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isConnected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isConnected ? '0 6px 14px -2px rgba(16, 185, 129, 0.35)' : '0 6px 14px -2px rgba(239, 68, 68, 0.35)',
                    flexShrink: 0
                  }}
                >
                  <i className={`bi ${isConnected ? 'bi-check-circle-fill' : 'bi-slash-circle-fill'} fs-5`}></i>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.7px', color: isConnected ? '#059669' : '#dc2626', textTransform: 'uppercase', marginBottom: '2px' }}>
                    CONNECTION SUMMARY
                  </div>
                  <h5 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
                    {isConnected ? 'Bridge link is active and synchronizing.' : 'Bridge link is currently offline.'}
                  </h5>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Plan</span>
                      <i className="bi bi-box-seam text-success" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {loadingUrls ? 'Loading...' : (hasConfiguredPackage ? configuredPackageName : (broker.planName || 'No Package / URLs Configured'))}
                    </strong>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email</span>
                      <i className="bi bi-envelope text-primary" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block text-break" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {broker.email || '—'}
                    </strong>
                  </div>
                </div>

                <div className="col-md-4 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Country</span>
                      <i className="bi bi-geo-alt text-danger" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {broker.flag || '🌐'} {broker.country || '—'}
                    </strong>
                  </div>
                </div>

                <div className="col-md-4 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Platform Type</span>
                      <i className="bi bi-lightning-charge text-warning" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {broker.type || 'LIVE'} Trading
                    </strong>
                  </div>
                </div>

                <div className="col-md-4 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Accounts</span>
                      <i className="bi bi-people text-info" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block font-monospace" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {broker.accounts ?? 0} Connected
                    </strong>
                  </div>
                </div>

                <div className="col-md-4 col-lg-4">
                  <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Refer Code</span>
                      <i className="bi bi-ticket-perforated text-secondary" style={{ fontSize: '12px' }}></i>
                    </div>
                    <strong className="text-dark d-block font-monospace" style={{ fontSize: '14.5px', lineHeight: 1.3 }}>
                      {broker.referCode || '—'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copier Type URLs (Live API) */}
          {activeTab === 'urls' && (
            <div>
              <div className="d-flex align-items-center justify-content-end mb-3">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                    onClick={fetchUrls}
                    disabled={loadingUrls}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                    onClick={() => {
                      const usedTypes = urlsList.map(u => Number(u.Type));
                      const nextType = [1,2,3,4,5,6,7,8].find(t => !usedTypes.includes(t)) || 1;
                      setUrlFormData({ type: String(nextType), url: 'https://tradercopierfx.traderscabinet.com', oStatus: '2', duration: '60' });
                      setShowUrlForm(true);
                    }}
                  >
                    <i className="bi bi-plus-circle-fill"></i> Add URL
                  </button>
                </div>
              </div>

              {urlError && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', borderRadius: '10px' }}>
                  <i className="bi bi-exclamation-triangle-fill"></i> {urlError}
                </div>
              )}

              {/* Add/Edit Form */}
              {showUrlForm && (
                <form onSubmit={handleSaveUrl} className="p-3 mb-3 border rounded-3 bg-white shadow-sm">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label mb-2 fw-semibold" style={{ fontSize: '11px' }}>Type</label>
                      <select className="form-select form-select-sm" value={urlFormData.type} onChange={(e) => setUrlFormData(p => ({ ...p, type: e.target.value }))}>
                        {Object.entries(COPIER_TYPE_MAP).map(([id, info]) => (
                          <option key={id} value={id}>{id}: {info.code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-2 fw-semibold" style={{ fontSize: '11px' }}>Status</label>
                      <select className="form-select form-select-sm" value={urlFormData.oStatus} onChange={(e) => setUrlFormData(p => ({ ...p, oStatus: e.target.value }))}>
                        {Object.entries(STATUS_MAP).map(([val, info]) => (
                          <option key={val} value={val}>{val}: {info.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-2 fw-semibold" style={{ fontSize: '11px' }}>Duration (Days)</label>
                      <input type="number" className="form-control form-control-sm" value={urlFormData.duration} onChange={(e) => setUrlFormData(p => ({ ...p, duration: e.target.value }))} min="0" />
                    </div>
                    <div className="col-12">
                      <label className="form-label mb-2 fw-semibold" style={{ fontSize: '11px' }}>URL</label>
                      <input type="url" className="form-control form-control-sm font-monospace" value={urlFormData.url} onChange={(e) => setUrlFormData(p => ({ ...p, url: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
                    <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowUrlForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary text-white fw-bold px-3" disabled={loadingUrls}>Save</button>
                  </div>
                </form>
              )}

              {/* URLs Table */}
              <div className="border rounded-3 overflow-hidden shadow-sm">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '12.5px' }}>
                  <thead className="bg-light">
                    <tr>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>TYPE</th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>COPIER NAME</th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>URL</th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>DURATION</th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUrls ? (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">
                        <span className="spinner-border spinner-border-sm me-2 text-primary"></span>Loading...
                      </td></tr>
                    ) : urlsList.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">No URLs configured for this profile.</td></tr>
                    ) : (
                      urlsList.map((item, idx) => {
                        const copier = getCopierInfo(item.Type);
                        const status = getStatusInfo(item.oStatus);
                        return (
                          <tr key={idx}>
                            <td style={{ padding: '10px 14px' }}><span className="badge bg-dark font-monospace">{item.Type}</span></td>
                            <td style={{ padding: '10px 14px' }}><div className="fw-bold">{copier.name}</div></td>
                            <td style={{ padding: '10px 14px' }}><a href={item.URL} target="_blank" rel="noreferrer" className="font-monospace text-primary text-break" style={{ fontSize: '11.5px' }}>{item.URL}</a></td>
                            <td style={{ padding: '10px 14px' }}>
                              <span className="fw-bold" style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '9999px', backgroundColor: status.bg, color: status.color }}>
                                {status.label}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }} className="fw-semibold">{Number(item.Duration) > 0 ? `${item.Duration} Days` : 'Unlimited'}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                              <div className="d-inline-flex gap-1">
                                <button className="btn btn-sm btn-light border py-0 px-2" onClick={() => {
                                  setUrlFormData({ type: String(item.Type), url: item.URL, oStatus: String(item.oStatus), duration: String(item.Duration) });
                                  setShowUrlForm(true);
                                }}><i className="bi bi-pencil-square text-primary"></i></button>
                                <button className="btn btn-sm btn-light border py-0 px-2" onClick={() => handleDeleteUrl(item.Type)}>
                                  <i className="bi bi-trash3 text-danger"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px 26px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 10px -2px rgba(0, 0, 0, 0.02)'
            }}>
              {/* Header inside Package */}
              <div
                className="d-flex align-items-center justify-content-between mb-4 pb-3"
                style={{ borderBottom: '1px solid #f1f5f9' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: hasConfiguredPackage
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: hasConfiguredPackage
                        ? '0 6px 16px -2px rgba(16, 185, 129, 0.35)'
                        : '0 6px 16px -2px rgba(100, 116, 139, 0.25)',
                      flexShrink: 0
                    }}
                  >
                    <i className="bi bi-box-seam-fill fs-5"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.8px', color: hasConfiguredPackage ? '#059669' : '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                      SUBSCRIPTION PACKAGE
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
                        {loadingUrls ? (
                          <span className="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>
                        ) : null}
                        {hasConfiguredPackage ? configuredPackageName : (broker.planName || 'No Package / URLs Configured')}
                      </h4>
                      {hasConfiguredPackage ? (
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                          Active
                        </span>
                      ) : (
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                          Not Configured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="text-end px-3 py-2 rounded-3"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>
                    Quota Allocation
                  </span>
                  <strong className="text-dark font-monospace" style={{ fontSize: '15px' }}>
                    {hasConfiguredPackage ? (broker.accounts || 0) : 0} Accounts Managed
                  </strong>
                </div>
              </div>

              {/* 3 Sub-Cards - Distinct & Informative (No Duplicates) */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-secondary small fw-semibold" style={{ fontSize: '12px' }}>Copier Architecture</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-cpu-fill" style={{ fontSize: '14px' }}></i>
                      </div>
                    </div>
                    <strong className="text-dark d-block text-truncate" style={{ fontSize: '15px' }} title={hasConfiguredPackage && urlsList[0] ? getCopierInfo(urlsList[0].Type).name : (broker.planName || 'Internal Trade Copier')}>
                      {hasConfiguredPackage && urlsList[0] ? getCopierInfo(urlsList[0].Type).name : (broker.planName || 'Internal Trade Copier')}
                    </strong>
                    <span className="text-muted small d-block mt-1" style={{ fontSize: '11.5px' }}>
                      {hasConfiguredPackage && urlsList[0] ? getCopierInfo(urlsList[0].Type).desc : 'Real-time trade replication'}
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
                      border: '1px solid #fef3c7',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ fontSize: '12px', color: '#b45309' }}>Execution Duration</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-clock-history" style={{ fontSize: '14px' }}></i>
                      </div>
                    </div>
                    <strong className="text-dark d-block" style={{ fontSize: '15px' }}>
                      {hasConfiguredPackage && urlsList[0] && Number(urlsList[0].Duration) > 0 ? `${urlsList[0].Duration} Days` : 'Continuous / Unlimited'}
                    </strong>
                    <span className="small d-block mt-1" style={{ fontSize: '11.5px', color: '#92400e' }}>
                      Direct socket replication
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    style={{
                      background: hasConfiguredPackage
                        ? 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      border: hasConfiguredPackage ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ fontSize: '12px', color: hasConfiguredPackage ? '#15803d' : '#64748b' }}>Configured Gateways</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: hasConfiguredPackage ? '#dcfce7' : '#f1f5f9', color: hasConfiguredPackage ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-link-45deg" style={{ fontSize: '16px' }}></i>
                      </div>
                    </div>
                    <strong className="d-block" style={{ fontSize: '15px', color: hasConfiguredPackage ? '#15803d' : '#64748b' }}>
                      {urlsList.length} Endpoint{urlsList.length === 1 ? '' : 's'} Configured
                    </strong>
                    <span className="small d-block mt-1" style={{ fontSize: '11.5px', color: hasConfiguredPackage ? '#166534' : '#64748b' }}>
                      {urlsList.length > 0 ? 'Managed in Copier Type URLs' : 'No URLs mapped'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
