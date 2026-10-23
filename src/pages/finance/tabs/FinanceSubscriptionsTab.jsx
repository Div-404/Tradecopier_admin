import React, { useState, useEffect, useMemo } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';
import { apiGetAdmUsrSubscribedPkg, BLC_STATUS_MAP } from '../../../services/api';

export default function FinanceSubscriptionsTab() {
  const { brokers, packages, showToast } = useSuperAdmin();

  // Subscriptions list state
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state (User info: Name, Email, Phone, AND PkgID and Status)
  const [userQuery, setUserQuery] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Load subscriptions from API (GET_ADM_USR_SUBSCRIBED_PKG)
  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdmUsrSubscribedPkg({ initial: 1, maxCount: 50 });
      console.log("res",res);
      const list = res?.lstSubscribe || [];

      if (Array.isArray(list) && list.length > 0) {
        // Correlate with brokers list to enrich user snapshot (Name, Email, Phone)
        const enriched = list.map(sub => {
          const u = sub.oUser || {};
          const matchedBroker = brokers.find(b => 
            String(b.profileId || b.managerId || b.id?.replace('brk-', '')) === String(u.Profile)
          );
          return {
            ...sub,
            resolvedUser: {
              Profile: u.Profile,
              Name: u.Name || matchedBroker?.name || `Profile #${u.Profile}`,
              Email: u.Email || matchedBroker?.email || '',
              Phone: u.Phone || matchedBroker?.phone || '',
            }
          };
        });
        setSubscriptions(enriched);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.warn("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [brokers, packages]);

  // Unique PkgIDs for dropdown filter
  const uniquePkgIds = useMemo(() => {
    const ids = new Set();
    subscriptions.forEach(s => {
      const id = s?.oPkg?.PkgId;
      if (id !== undefined && id !== null) ids.add(id);
    });
    return Array.from(ids).sort((a, b) => a - b);
  }, [subscriptions]);

  // Filter logic: User information (Name, Email, Phone) AND PkgID AND Status
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const user = sub.resolvedUser || sub.oUser || {};
      const pkg = sub.oPkg || {};

      // User search across Name, Email, and Phone
      const q = userQuery.trim().toLowerCase();
      const matchesUser = !q || (
        (user.Name && user.Name.toLowerCase().includes(q)) ||
        (user.Email && user.Email.toLowerCase().includes(q)) ||
        (user.Phone && user.Phone.toLowerCase().includes(q)) ||
        String(user.Profile || '').includes(q)
      );

      // PkgID filter
      const matchesPkgId = selectedPkgId === 'ALL' || String(pkg.PkgId) === String(selectedPkgId);

      // Status filter
      const matchesStatus = selectedStatus === 'ALL' || String(pkg.oStatus) === String(selectedStatus);

      return matchesUser && matchesPkgId && matchesStatus;
    });
  }, [subscriptions, userQuery, selectedPkgId, selectedStatus]);

  // Summary Metrics
  const activeCount = useMemo(() => {
    return subscriptions.filter(s => s?.oPkg?.oStatus === 2).length;
  }, [subscriptions]);

  const pendingCount = useMemo(() => {
    return subscriptions.filter(s => s?.oPkg?.oStatus === 1).length;
  }, [subscriptions]);

  const expiredCount = useMemo(() => {
    return subscriptions.filter(s => s?.oPkg?.oStatus === 3).length;
  }, [subscriptions]);

  return (
    <div>
      {/* Top Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Total Subscriptions</span>
                <h4 className="fw-bolder text-dark m-0 mt-1">{subscriptions.length}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-dark" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Active Plans</span>
                <h4 className="fw-bolder text-dark m-0 mt-1">{activeCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-dark" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-check-circle-fill fs-5 text-success"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Pending Approval</span>
                <h4 className="fw-bolder text-dark m-0 mt-1">{pendingCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-15 text-dark" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-hourglass-split fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Expired / Inactive</span>
                <h4 className="fw-bolder text-dark m-0 mt-1">{expiredCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-dark" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-exclamation-octagon-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card with Multi-Filter Header */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Filters Strip */}
        <div className="p-3 border-bottom border-light bg-light bg-opacity-30">
          <div className="row g-3 align-items-center">
            
            {/* Filter 1: User info search (Name, Email, Phone) */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 rounded-start-3 text-secondary" style={{ borderColor: '#e2e8f0' }}>
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-white rounded-end-3 px-3"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
                {userQuery && (
                  <button 
                    type="button" 
                    className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y z-3 text-decoration-none"
                    onClick={() => setUserQuery('')}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filter 2: PkgID Filter */}
            <div className="col-sm-6 col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 rounded-start-3 text-secondary" style={{ borderColor: '#e2e8f0', fontSize: '0.82rem' }}>
                  PkgID
                </span>
                <select
                  className="form-select bg-white rounded-end-3"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                >
                  <option value="ALL">All Package IDs</option>
                  {uniquePkgIds.map((id) => (
                    <option key={id} value={id}>
                      Package ID #{id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 3: Status Filter */}
            <div className="col-sm-6 col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 rounded-start-3 text-secondary" style={{ borderColor: '#e2e8f0', fontSize: '0.82rem' }}>
                  Status
                </span>
                <select
                  className="form-select bg-white rounded-end-3"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="2">Active (2)</option>
                  <option value="1">Pending Approval (1)</option>
                  <option value="3">Expired / Inactive (3)</option>
                  <option value="4">Redeemed (4)</option>
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="col-md-1 text-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center p-2"
                style={{ height: '42px', borderColor: '#e2e8f0' }}
                onClick={loadSubscriptions}
                title="Refresh Subscriptions"
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
              </button>
            </div>

          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light text-secondary fw-semibold border-bottom" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th className="ps-4 py-3">Broker / User Information</th>
                <th className="py-3">Contact (Email & Phone)</th>
                <th className="py-3">Package / PkgID</th>
                <th className="py-3">Validity & Created</th>
                <th className="py-3">Subscription Status</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading subscriptions...</span>
                    </div>
                    <div className="text-secondary mt-2" style={{ fontSize: '0.85rem' }}>Loading active user subscriptions...</div>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <h6 className="fw-bold text-dark">No Matching Subscriptions Found</h6>
                    <span className="text-secondary" style={{ fontSize: '0.82rem' }}>
                      Try adjusting your search query, PkgID, or Status filter.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub, idx) => {
                  const user = sub.resolvedUser || sub.oUser || {};
                  const pkg = sub.oPkg || {};
                  const statusInfo = BLC_STATUS_MAP[pkg.oStatus] || BLC_STATUS_MAP[0];

                  return (
                    <tr key={idx} className="transition-all">
                      
                      {/* User Info (Name + Profile ID) */}
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold flex-shrink-0"
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              backgroundColor: '#e6f4ea', 
                              color: '#000000',
                              fontSize: '0.82rem',
                              border: '2px solid #bbf7d0'
                            }}
                          >
                            {(user.Name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{user.Name || `Profile #${user.Profile}`}</div>
                            <span className="badge rounded-pill bg-light text-dark border font-tabular mt-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                              Profile ID: {user.Profile}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                            <i className="bi bi-envelope text-secondary me-2" style={{ fontSize: '0.85rem' }}></i>
                            <span>{user.Email || 'No Email'}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-telephone text-secondary me-2" style={{ fontSize: '0.85rem' }}></i>
                            <span>{user.Phone || 'No Phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Package Name & PkgID */}
                      <td className="py-3">
                        <div className="fw-bold text-dark">{sub.Pkg || `Package ${pkg.PkgId}`}</div>
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-black border border-success border-opacity-25 px-2 py-1 mt-1 font-tabular" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                          PkgID: #{pkg.PkgId}
                        </span>
                      </td>

                      {/* Validity & Created */}
                      <td className="py-3">
                        <div className="d-flex flex-column gap-2" style={{ fontSize: '0.8rem' }}>
                          <span className="text-dark fw-medium">
                            Valid Until: <strong className="text-primary">{pkg.dtValid?.Tm_Str || 'N/A'}</strong>
                          </span>
                          <span className="text-secondary" style={{ fontSize: '0.74rem' }}>
                            Created: {pkg.dtCreated?.Tm_Str || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Status (Rule 1: High-Contrast text-black) */}
                      <td className="py-3">
                        <span 
                          className="badge rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-2 text-black"
                          style={{ 
                            backgroundColor: statusInfo.bg, 
                            fontSize: '0.74rem',
                            border: `1px solid ${statusInfo.border || '#cbd5e1'}`
                          }}
                        >
                          <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#16a34a' }}></span>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="pe-4 py-3 text-end">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-2 px-3 py-1 text-secondary"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => {
                              showToast?.(`Broker: ${user.Name}\nTransID: ${pkg.TransID}\nRef: ${pkg.TransRef || 'None'}`, 'info');
                            }}
                            title="View Reference Details"
                          >
                            <i className="bi bi-info-circle me-2"></i> Details
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

        {/* Footer info strip */}
        <div className="p-3 border-top border-light bg-light bg-opacity-20 d-flex justify-content-between align-items-center text-secondary" style={{ fontSize: '0.78rem' }}>
          <span>Showing <strong>{filteredSubscriptions.length}</strong> of <strong>{subscriptions.length}</strong> active user subscriptions</span>
        </div>

      </div>
    </div>
  );
}
