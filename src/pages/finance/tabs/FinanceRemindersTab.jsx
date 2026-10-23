import React, { useState, useMemo } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';

export default function FinanceRemindersTab() {
  const { brokers, packages, showToast } = useSuperAdmin();

  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Synthesize reminder records from brokers & package validity
  const reminders = useMemo(() => {
    return brokers.map((b, idx) => {
      const pId = Number(b.profileId || b.managerId || 1000 + idx);
      const pkg = packages[idx % (packages.length || 1)] || { name: 'Internal Trade Copier', monthlyPrice: 499 };
      
      // Artificial staggered days left for realistic preview
      const daysLeft = (idx % 4 === 0) ? -2 : (idx % 3 === 0) ? 2 : (idx % 2 === 0) ? 6 : 18;
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysLeft);

      let urgency = 'NORMAL';
      if (daysLeft < 0) urgency = 'EXPIRED';
      else if (daysLeft <= 3) urgency = 'CRITICAL';
      else if (daysLeft <= 7) urgency = 'EXPIRING_SOON';

      return {
        id: `rem-${pId}`,
        profileId: pId,
        brokerName: b.name || `Broker ${pId}`,
        email: b.email || `broker${pId}@gmail.com`,
        phone: b.phone || '+1 555-0199',
        serverName: b.serverName || `Manager-${pId}`,
        packageName: pkg.name || 'Internal Trade Copier',
        amount: pkg.monthlyPrice || 499,
        daysLeft,
        expiryDate: expiryDate.toLocaleDateString(),
        urgency,
        lastReminderSent: idx % 2 === 0 ? 'Yesterday' : 'Never'
      };
    });
  }, [brokers, packages]);

  // Filter logic
  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || (
        r.brokerName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.packageName.toLowerCase().includes(q)
      );

      const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [reminders, searchTerm, urgencyFilter]);

  const handleSendReminder = (item) => {
    showToast?.(`Renewal notice queued and dispatched to ${item.email}`, 'success');
  };

  const handleExtend = (item) => {
    showToast?.(`Extended validity by 30 days for ${item.brokerName}`, 'success');
  };

  // Metrics
  const criticalCount = reminders.filter(r => r.urgency === 'CRITICAL').length;
  const expiringSoonCount = reminders.filter(r => r.urgency === 'EXPIRING_SOON').length;
  const expiredCount = reminders.filter(r => r.urgency === 'EXPIRED').length;

  return (
    <div>
      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Expiring ≤ 3 Days</span>
                <h4 className="fw-bolder text-danger m-0 mt-1">{criticalCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-alarm-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Expiring ≤ 7 Days</span>
                <h4 className="fw-bolder text-warning m-0 mt-1">{expiringSoonCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-clock-history fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Already Expired</span>
                <h4 className="fw-bolder text-secondary m-0 mt-1">{expiredCount}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-x-circle-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-2xs rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>Total Monitored</span>
                <h4 className="fw-bolder text-primary m-0 mt-1">{reminders.length}</h4>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '42px', height: '42px' }}>
                <i className="bi bi-bell-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Filter Strip */}
        <div className="p-3 border-bottom border-light bg-light bg-opacity-30">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex flex-wrap gap-2 flex-grow-1">
              <div className="position-relative" style={{ minWidth: '280px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input
                  type="text"
                  className="form-control bg-white rounded-3 ps-5"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-select bg-white rounded-3"
                style={{ width: '200px', height: '42px', fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="ALL">All Reminders</option>
                <option value="CRITICAL">Critical (≤ 3 Days)</option>
                <option value="EXPIRING_SOON">Expiring Soon (≤ 7 Days)</option>
                <option value="EXPIRED">Already Expired</option>
                <option value="NORMAL">Normal (&gt; 7 Days)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-neon-primary rounded-3 px-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
              style={{ height: '42px', fontSize: '0.86rem' }}
              onClick={() => showToast?.(`Dispatched bulk renewal notifications to ${filteredReminders.length} brokers`, 'success')}
            >
              <i className="bi bi-send-fill me-2"></i>
              <span>Notify All</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light text-secondary fw-semibold border-bottom" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th className="ps-4 py-3">Broker</th>
                <th className="py-3">Contact Information</th>
                <th className="py-3">Current Plan</th>
                <th className="py-3">Expiry Date</th>
                <th className="py-3">Days Remaining</th>
                <th className="py-3">Urgency Status</th>
                <th className="pe-4 py-3 text-end">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-bell-slash fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <h6 className="fw-bold text-dark">No Reminders Found</h6>
                    <span className="text-secondary" style={{ fontSize: '0.82rem' }}>All monitored broker packages are in good standing.</span>
                  </td>
                </tr>
              ) : (
                filteredReminders.map((r) => {
                  let urgencyBadge = null;
                  if (r.urgency === 'EXPIRED') {
                    urgencyBadge = <span className="badge bg-danger text-white px-3 py-1 fw-bold">Expired</span>;
                  } else if (r.urgency === 'CRITICAL') {
                    urgencyBadge = <span className="badge bg-danger bg-opacity-10 text-black border border-danger border-opacity-25 px-3 py-1 fw-bold">Critical</span>;
                  } else if (r.urgency === 'EXPIRING_SOON') {
                    urgencyBadge = <span className="badge bg-warning bg-opacity-15 text-black border border-warning border-opacity-50 px-3 py-1 fw-bold">Expiring Soon</span>;
                  } else {
                    urgencyBadge = <span className="badge bg-success bg-opacity-10 text-black border border-success border-opacity-25 px-3 py-1 fw-bold">Active</span>;
                  }

                  return (
                    <tr key={r.id} className="transition-all">
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-dark">{r.brokerName}</div>
                        <span className="badge rounded-pill bg-light text-muted border font-tabular" style={{ fontSize: '0.68rem' }}>
                          ID: {r.profileId}
                        </span>
                      </td>

                      <td className="py-3">
                        <div className="d-flex flex-column gap-1">
                          <span className="text-dark fw-medium" style={{ fontSize: '0.84rem' }}>{r.email}</span>
                          <span className="text-secondary" style={{ fontSize: '0.78rem' }}>{r.phone}</span>
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="fw-semibold text-dark">{r.packageName}</div>
                        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>${r.amount} / month</span>
                      </td>

                      <td className="py-3 font-tabular text-dark fw-medium">
                        {r.expiryDate}
                      </td>

                      <td className="py-3">
                        {r.daysLeft < 0 ? (
                          <span className="text-danger fw-bold font-tabular">{Math.abs(r.daysLeft)} days overdue</span>
                        ) : r.daysLeft === 0 ? (
                          <span className="text-danger fw-bold font-tabular">Expires Today</span>
                        ) : (
                          <span className="text-dark fw-bold font-tabular">{r.daysLeft} days left</span>
                        )}
                      </td>

                      <td className="py-3">
                        {urgencyBadge}
                      </td>

                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-2 px-3 py-1 fw-semibold"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleSendReminder(r)}
                            title="Send Email & Push Alert"
                          >
                            <i className="bi bi-bell me-2"></i> Remind
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success rounded-2 px-3 py-1 fw-semibold"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleExtend(r)}
                            title="Extend 30 Days"
                          >
                            <i className="bi bi-calendar-plus me-2"></i> Extend
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

        {/* Footer */}
        <div className="p-3 border-top border-light bg-light bg-opacity-20 d-flex justify-content-between align-items-center text-secondary" style={{ fontSize: '0.78rem' }}>
          <span>Showing <strong>{filteredReminders.length}</strong> active renewal trackers</span>
        </div>

      </div>
    </div>
  );
}
