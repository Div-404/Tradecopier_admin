import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');

  // Copier URLs state
  const [urlsList, setUrlsList] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlFormData, setUrlFormData] = useState({
    type: '1',
    url: 'https://tradercopierfx.traderscabinet.com',
    oStatus: '2',
    duration: '60',
  });

  const profileId = broker?.managerId || broker?.id?.replace('brk-', '') || '100001';

  // Fetch URLs when switching to urls tab
  const fetchUrls = async () => {
    setLoadingUrls(true);
    setUrlError(null);
    try {
      const data = await apiGetUserTypeUrl(profileId);
      setUrlsList(Array.isArray(data.lstURL) ? data.lstURL : []);
    } catch (err) {
      console.error('GET_USER_TYPE_URL error:', err);
      setUrlError(err.message);
      setUrlsList([]);
    }
    setLoadingUrls(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'urls') {
      fetchUrls();
    }
  }, [isOpen, activeTab, profileId]);

  // Reset to overview when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setShowUrlForm(false);
      setUrlError(null);
    }
  }, [isOpen]);

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
    } catch (err) {
      setUrlError(err.message);
    }
    setLoadingUrls(false);
  };

  // DELETE URL
  const handleDeleteUrl = async (copierType) => {
    if (!window.confirm(`Delete Type ${copierType} URL for Profile ${profileId}?`)) return;
    setLoadingUrls(true);
    setUrlError(null);
    try {
      await apiDelUserTypeUrl(copierType, profileId);
      await fetchUrls();
    } catch (err) {
      setUrlError(err.message);
    }
    setLoadingUrls(false);
  };

  const isConnected = broker.status === 'Connected' || broker.status === 'Approved';

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-dialog modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          borderRadius: '16px',
          padding: '28px 32px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Manager Platform Details
            </h2>
            <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
              {broker.name} • {broker.serverName} • Profile: <strong className="font-monospace">{profileId}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px', height: '34px', borderRadius: '8px', border: 'none',
              backgroundColor: '#f1f5f9', color: '#334155', fontSize: '18px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >×</button>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'MANAGER ID', value: profileId },
            { label: 'BROKER', value: broker.name },
            { label: 'SERVER', value: broker.serverName },
            { label: 'STATUS', value: broker.status, color: isConnected ? '#16a34a' : '#dc2626' },
          ].map((d, i) => (
            <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                {d.label}
              </label>
              <strong style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: d.color || '#0f172a' }}>
                {d.value}
              </strong>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'urls', label: 'Copier Type URLs' },
            { id: 'accounts', label: 'Accounts' },
            { id: 'groups', label: 'Groups' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '2.5px solid #22c55e' : '2.5px solid transparent',
                color: activeTab === tab.id ? '#16a34a' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '13.5px', padding: '10px 16px', cursor: 'pointer', marginBottom: '-1px',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: '18px' }}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                CONNECTION SUMMARY
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {broker.name} is {isConnected ? 'connected' : 'disconnected'} through {broker.serverName}.
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                <div>Plan: <strong>{broker.planName || '—'}</strong> | Type: <strong>{broker.type}</strong> | Accounts: <strong>{broker.accounts}</strong></div>
                <div>Country: <strong>{broker.country}</strong> | Email: <strong>{broker.email}</strong></div>
              </div>
            </div>
          )}

          {/* Copier Type URLs (Live API) */}
          {activeTab === 'urls' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                {/* <div className="text-secondary" style={{ fontSize: '13px' }}>
                  Live data from <code>GET_USER_TYPE_URL</code> for Profile <strong className="font-monospace">{profileId}</strong>
                </div> */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={fetchUrls}
                    disabled={loadingUrls}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-success text-white fw-bold d-flex align-items-center gap-1"
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
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '12.5px', borderRadius: '8px' }}>
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> {urlError}
                </div>
              )}

              {/* Add/Edit Form */}
              {showUrlForm && (
                <form onSubmit={handleSaveUrl} className="p-3 mb-3 border rounded-3 bg-white shadow-sm">
                  {/* <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '13px' }}>
                    <i className="bi bi-pencil-square me-1"></i>
                    Add/Edit URL — Profile {profileId}
                  </h6> */}
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '11px' }}>Type</label>
                      <select className="form-select form-select-sm" value={urlFormData.type} onChange={(e) => setUrlFormData(p => ({ ...p, type: e.target.value }))}>
                        {Object.entries(COPIER_TYPE_MAP).map(([id, info]) => (
                          <option key={id} value={id}>{id}: {info.code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '11px' }}>Status</label>
                      <select className="form-select form-select-sm" value={urlFormData.oStatus} onChange={(e) => setUrlFormData(p => ({ ...p, oStatus: e.target.value }))}>
                        {Object.entries(STATUS_MAP).map(([val, info]) => (
                          <option key={val} value={val}>{val}: {info.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '11px' }}>Duration (Days)</label>
                      <input type="number" className="form-control form-control-sm" value={urlFormData.duration} onChange={(e) => setUrlFormData(p => ({ ...p, duration: e.target.value }))} min="0" />
                    </div>
                    <div className="col-12">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '11px' }}>URL</label>
                      <input type="url" className="form-control form-control-sm font-monospace" value={urlFormData.url} onChange={(e) => setUrlFormData(p => ({ ...p, url: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
                    <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowUrlForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary text-white fw-bold px-3" disabled={loadingUrls}>Save via API</button>
                  </div>
                </form>
              )}

              {/* URLs Table */}
              <div className="border rounded-3 overflow-hidden">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '12.5px' }}>
                  <thead className="bg-light">
                    <tr>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700 }}>TYPE</th>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700 }}>COPIER NAME</th>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700 }}>URL</th>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700 }}>DURATION</th>
                      <th style={{ padding: '8px 12px', fontSize: '10.5px', fontWeight: 700, textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUrls ? (
                      <tr><td colSpan="6" className="text-center py-3 text-muted">
                        <span className="spinner-border spinner-border-sm me-2 text-primary"></span>Loading...
                      </td></tr>
                    ) : urlsList.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-3 text-muted">No URLs configured for this profile.</td></tr>
                    ) : (
                      urlsList.map((item, idx) => {
                        const copier = getCopierInfo(item.Type);
                        const status = getStatusInfo(item.oStatus);
                        return (
                          <tr key={idx}>
                            <td><span className="badge bg-dark font-monospace">{item.Type}</span></td>
                            <td><div className="fw-bold">{copier.name}</div></td>
                            <td><a href={item.URL} target="_blank" rel="noreferrer" className="font-monospace text-primary text-break" style={{ fontSize: '11.5px' }}>{item.URL}</a></td>
                            <td>
                              <span className="fw-bold" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: status.bg, color: status.color }}>
                                {status.label}
                              </span>
                            </td>
                            <td className="fw-semibold">{Number(item.Duration) > 0 ? `${item.Duration} Days` : 'Unlimited'}</td>
                            <td style={{ textAlign: 'right' }}>
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

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 22px' }}>
              <strong style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                {broker.accounts ?? 0} Trading Accounts Connected
              </strong>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                All client follower and manager trading accounts mapped to {broker.serverName}.
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 22px' }}>
              <strong style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Default Manager & Follower Allocation Groups Active
              </strong>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Group rules and leverage constraints configured for trade replication.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
