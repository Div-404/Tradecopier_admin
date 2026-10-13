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

export default function UserTypeUrlModal({ isOpen, onClose, initialProfileId }) {
  const { brokers, showToast } = useSuperAdmin();

  const [profileId, setProfileId] = useState(() => {
    return initialProfileId || (brokers.length > 0 ? String(brokers[0].managerId || brokers[0].profileId || '1000') : '1000');
  });
  const [urlsList, setUrlsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add/Edit form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '1',
    url: 'https://tradercopierfx.traderscabinet.com',
    oStatus: '2',
    duration: '60',
  });

  // Fetch URLs on open / profile change
  const fetchUrls = async (pid) => {
    if (!pid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetUserTypeUrl(pid);
      // API returns { Profile, lstURL: [...] }
      setUrlsList(Array.isArray(data.lstURL) ? data.lstURL : []);
    } catch (err) {
      console.error('GET_USER_TYPE_URL error:', err);
      setError(err.message);
      setUrlsList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      let targetId = initialProfileId;
      const matchesAny = brokers.some(b => String(b.managerId || b.profileId || b.id.replace('brk-', '')) === String(targetId));
      if (!targetId || (!matchesAny && brokers.length > 0)) {
        targetId = brokers[0]?.managerId || brokers[0]?.profileId || '1000';
      }
      targetId = String(targetId || '1000');
      setProfileId(targetId);
      fetchUrls(targetId);
      setShowForm(false);
    }
  }, [isOpen, initialProfileId]);

  // Sync if brokers arrive after modal is opened
  useEffect(() => {
    if (isOpen && brokers.length > 0 && !brokers.some(b => String(b.managerId || b.profileId || b.id.replace('brk-', '')) === String(profileId))) {
      const firstId = String(brokers[0].managerId || brokers[0].profileId || '1000');
      setProfileId(firstId);
      fetchUrls(firstId);
    }
  }, [brokers, isOpen]);

  if (!isOpen) return null;

  const handleProfileChange = (pid) => {
    setProfileId(pid);
    fetchUrls(pid);
    setShowForm(false);
  };

  // ADD / EDIT
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiAddEditUserTypeUrl({
        profileId,
        type: formData.type,
        url: formData.url,
        oStatus: formData.oStatus,
        duration: formData.duration,
      });
      showToast(res.MSG_USER || 'User URL saved successfully!', 'success');
      setShowForm(false);
      // Refresh list
      await fetchUrls(profileId);
    } catch (err) {
      console.error('ADD_EDIT_USER_TYPE_URL error:', err);
      setError(err.message);
      showToast('API Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  // DELETE
  const handleDelete = async (copierType) => {
    const info = getCopierInfo(copierType);
    if (!window.confirm(`Delete "${info.name}" (Type ${copierType}) URL for Profile ${profileId}?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiDelUserTypeUrl(copierType, profileId);
      showToast(res.MSG_USER || 'Configuration deleted.', 'success');
      await fetchUrls(profileId);
    } catch (err) {
      console.error('DEL_USER_TYPE_URL error:', err);
      setError(err.message);
      showToast('API Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const openEditForm = (item) => {
    setFormData({
      type: String(item.Type),
      url: item.URL || '',
      oStatus: String(item.oStatus ?? 2),
      duration: String(item.Duration ?? 60),
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    // Pick a type that's not already in the list
    const usedTypes = urlsList.map(u => Number(u.Type));
    const nextType = [1,2,3,4,5,6,7,8].find(t => !usedTypes.includes(t)) || 1;
    setFormData({
      type: String(nextType),
      url: 'https://tradercopierfx.traderscabinet.com',
      oStatus: '2',
      duration: '60',
    });
    setShowForm(true);
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-dialog modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          borderRadius: '16px',
          padding: '28px 32px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        {/* <div className="d-flex align-items-start justify-content-between mb-3 pb-3 border-bottom">
          <div>
            <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2" style={{ letterSpacing: '-0.3px' }}>
              <i className="bi bi-link-45deg text-primary fs-4"></i>
              User Type URL Configuration
            </h5>
          </div>
          <button
    type="button"
    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 px-3"
    onClick={() => fetchUrls(profileId)}
    disabled={loading}
    title="Refresh URL list"
  >
    <i
      className={`bi bi-arrow-clockwise${loading ? ' spin' : ''}`}
    ></i>
    Refresh
  </button>
          <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
        </div> */}
<div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
  <div>
    <h5
      className="fw-bold m-0 text-dark d-flex align-items-center gap-2"
      style={{ letterSpacing: '-0.3px' }}
    >
      <i className="bi bi-link-45deg text-primary fs-4"></i>
      User Type URL Configuration
    </h5>
  </div>

  <div className="d-flex align-items-center gap-2">
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2"
      onClick={() => fetchUrls(profileId)}
      disabled={loading}
      title="Refresh URL list"
    >
      <i className={`bi bi-arrow-clockwise${loading ? ' spin' : ''}`}></i>
      Refresh
    </button>

    <button
      type="button"
      className="btn-close shadow-none"
      onClick={onClose}
      aria-label="Close"
    ></button>
  </div>
</div>

{/* URLs Table Header */}
{/* <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
  <div>
    <h6 className="fw-bold text-dark mb-1">
      Configured URLs
    </h6>
    <small className="text-muted">
      Manage user type URL configurations
    </small>
  </div>

  <button
    type="button"
    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 px-3"
    onClick={() => fetchUrls(profileId)}
    disabled={loading}
    title="Refresh URL list"
  >
    <i
      className={`bi bi-arrow-clockwise${loading ? ' spin' : ''}`}
    ></i>
    Refresh
  </button>
</div> */}

{/* URLs Table */}
{/* <div className="border rounded-3 overflow-hidden mb-3">

</div> */}

        {/* Profile Selector + Actions */}
        {/* <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3 p-3 bg-light rounded-3 border">
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '320px' }}>
            <label className="fw-bold text-dark mb-0" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Profile ID:</label>
            <select
              className="form-select form-select-sm font-monospace fw-bold"
              value={profileId}
              onChange={(e) => handleProfileChange(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              {brokers.length === 0 ? (
                <option value={profileId || "1000"}>
                  {profileId || "1000"} — Broker
                </option>
              ) : (
                brokers.map(b => {
                  const mid = String(b.managerId || b.profileId || b.id.replace('brk-', ''));
                  return (
                    <option key={b.id || mid} value={mid}>
                      {mid} — {b.name}
                    </option>
                  );
                })
              )}
              {brokers.length > 0 && !brokers.some(b => String(b.managerId || b.profileId || b.id.replace('brk-', '')) === String(profileId)) && profileId && (
                <option value={profileId}>{profileId} (Custom Profile)</option>
              )}
            </select>
          </div>
          <div className="ms-auto">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-end gap-1"
              onClick={() => fetchUrls(profileId)}
              disabled={loading}
            >
              <i className={`bi bi-arrow-clockwise${loading ? ' spin' : ''}`}></i> Refresh
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success text-white fw-bold d-flex align-items-center gap-1"
              onClick={openAddForm}
            >
              <i className="bi bi-plus-circle-fill"></i> Add URL
            </button>
          </div>
        </div> */}

        {/* Error alert */}
        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', borderRadius: '8px' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSave} className="p-3 mb-3 border rounded-3 bg-white shadow-sm" style={{ borderColor: '#3b82f6 !important' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 className="m-0 fw-bold text-primary" style={{ fontSize: '13.5px' }}>
                <i className="bi bi-pencil-square me-1"></i>
                {urlsList.some(u => Number(u.Type) === Number(formData.type)) ? 'Edit' : 'Add'} User Type URL
              </h6>
              <button type="button" className="btn-close shadow-none" style={{ fontSize: '0.7rem' }} onClick={() => setShowForm(false)}></button>
            </div>
            <div className="row g-3">
              {/* Type */}
              <div className="col-md-5">
                <label className="form-label fw-bold" style={{ fontSize: '12px' }}>
                  Copier Type  <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                  required
                >
                  {Object.entries(COPIER_TYPE_MAP).map(([id, info]) => (
                    <option key={id} value={id}>{id}: {info.code} — {info.name}</option>
                  ))}
                </select>
              </div>
              {/* Status */}
              <div className="col-md-4">
                <label className="form-label fw-bold" style={{ fontSize: '12px' }}>
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  value={formData.oStatus}
                  onChange={(e) => setFormData(p => ({ ...p, oStatus: e.target.value }))}
                  required
                >
                  {Object.entries(STATUS_MAP).map(([val, info]) => (
                    <option key={val} value={val}>{val}: {info.label}</option>
                  ))}
                </select>
              </div>
              {/* Duration */}
              <div className="col-md-3">
                <label className="form-label fw-bold" style={{ fontSize: '12px' }}>Duration (Days)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={formData.duration}
                  onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                  min="0"
                />
              </div>
              {/* URL */}
              <div className="col-12">
                <label className="form-label fw-bold" style={{ fontSize: '12px' }}>
                  URL<span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  className="form-control form-control-sm font-monospace"
                  value={formData.url}
                  onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://tradercopierfx.traderscabinet.com"
                  required
                />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
              <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary text-white fw-bold px-4" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                Save
              </button>
            </div>
          </form>
        )}

        {/* URLs Table */}
        <div className="border rounded-3 overflow-hidden mb-3">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="bg-light">
              <tr>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>TYPE</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>COPIER NAME</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>URL</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>DURATION</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && urlsList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Calling GET_USER_TYPE_URL for Profile {profileId}...
                  </td>
                </tr>
              ) : urlsList.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-1 text-secondary"></i>
                    No URLs configured for Profile {profileId}.
                  </td>
                </tr>
              ) : (
                urlsList.map((item, idx) => {
                  const copier = getCopierInfo(item.Type);
                  const status = getStatusInfo(item.oStatus);
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge bg-dark font-monospace px-2 py-1" style={{ fontSize: '11px' }}>
                          {item.Type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{copier.name}</div>
                        <div className="text-muted" style={{ fontSize: '11.5px' }}>{copier.code}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <a
                          href={item.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-monospace text-primary text-break text-decoration-none"
                          style={{ fontSize: '12px' }}
                        >
                          {item.URL} <i className="bi bi-box-arrow-up-right" style={{ fontSize: '10px' }}></i>
                        </a>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className="d-inline-flex align-items-center gap-1 fw-bold"
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status.color, display: 'inline-block' }}></span>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {Number(item.Duration) > 0 ? `${item.Duration} Days` : 'Unlimited'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div className="d-inline-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border px-2 py-1"
                            onClick={() => openEditForm(item)}
                            title="Edit (ADD_EDIT_USER_TYPE_URL)"
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light border px-2 py-1"
                            onClick={() => handleDelete(item.Type)}
                            title="Delete (DEL_USER_TYPE_URL)"
                          >
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

        {/* API Reference Footer */}
        {/* <div className="p-3 bg-light rounded-3 border" style={{ fontSize: '11.5px' }}>
          <div className="fw-bold text-dark mb-1">
            <i className="bi bi-code-slash text-primary me-1"></i> API Endpoints
          </div>
          <div className="row g-2">
            <div className="col-md-4">
              <code className="text-dark">POST /GET_USER_TYPE_URL</code>
              <div className="text-muted">{"{ Key, Param1: ProfileID }"}</div>
            </div>
            <div className="col-md-4">
              <code className="text-dark">POST /ADD_EDIT_USER_TYPE_URL</code>
              <div className="text-muted">{"{ Key, Profile, oInfo: {Type, URL, oStatus, Duration} }"}</div>
            </div>
            <div className="col-md-4">
              <code className="text-dark">POST /DEL_USER_TYPE_URL</code>
              <div className="text-muted">{"{ Key, Param1: Type, Param2: ProfileID }"}</div>
            </div>
          </div>
        </div> */}

        {/* Close */}
        <div className="d-flex justify-content-end mt-3 pt-2 border-top">
          <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
