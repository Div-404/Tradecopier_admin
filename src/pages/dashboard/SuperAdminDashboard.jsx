import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AddBrokerModal from '../../components/modals/AddBrokerModal';
import BrokerDetailsModal from '../../components/modals/BrokerDetailsModal';
import EditBrokerModal from '../../components/modals/EditBrokerModal';
import UserTypeUrlModal from '../../components/modals/UserTypeUrlModal';
import { getCountryFlag } from '../../services/api';

export default function SuperAdminDashboard() {
  const { brokers, packages, toggleBrokerConnection, approveBroker, cancelBroker, showToast, currentUser, fetchProfilesFromApi, clientIp } = useSuperAdmin();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Connected', 'Disconnected', 'LIVE', 'DEMO'
  const [planFilter, setPlanFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [syncingProfiles, setSyncingProfiles] = useState(false);

  // Modals state
  const [isAddBrokerOpen, setIsAddBrokerOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  const handleSyncProfiles = async () => {
    setSyncingProfiles(true);
    try {
      const list = await fetchProfilesFromApi();
      showToast(`Fetched ${list?.length || 0} profiles dynamically from GET_ADM_PROFILES API!`, 'success');
    } catch (err) {
      showToast(`API Error: ${err.message}`, 'error');
    } finally {
      setSyncingProfiles(false);
    }
  };

  // Copy IP handler
  const handleCopyIp = (ip, brokerName) => {
    navigator.clipboard?.writeText(ip);
    showToast(`Copied ${brokerName} server IP (${ip}) to clipboard!`);
  };

  const handleOpenDetails = (broker) => {
    setSelectedBroker(broker);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (broker) => {
    setEditingBroker(broker);
    setIsEditOpen(true);
  };

  const handleToggleConnection = (broker) => {
    toggleBrokerConnection(broker.id);
  };

  // Format timestamp strictly as MM/DD/YYYY hh:mm AM/PM (never "Today" or "Yesterday")
  const formatTimestamp = (dateInput) => {
    if (!dateInput) return '—';

    const str = String(dateInput).trim();

    // If already in MM/DD/YYYY hh:mm AM/PM format (e.g. 10/01/2026 10:30 AM)
    const exactPattern = /^\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+(AM|PM)$/i;
    if (exactPattern.test(str)) {
      return str;
    }

    // Handle "YYYY-MM-DD HH:mm:ss" like "2026-10-11 15:42:54"
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2];
      const day = ymdMatch[3];
      let hours = parseInt(ymdMatch[4] || '0', 10);
      const minutes = ymdMatch[5] || '00';
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${month}/${day}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }

    // Handle "Today • 02:40 PM" or "Today"
    if (/today/i.test(str)) {
      const timeMatch = str.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      const timeStr = timeMatch ? timeMatch[1].toUpperCase() : '10:30 AM';
      return `10/01/2026 ${timeStr}`;
    }

    // Handle "Yesterday • 06:20 PM" or "Yesterday"
    if (/yesterday/i.test(str)) {
      const timeMatch = str.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      const timeStr = timeMatch ? timeMatch[1].toUpperCase() : '04:15 PM';
      return `09/30/2026 ${timeStr}`;
    }

    // Handle "01 Oct 2026" or "30 Sep 2026 • 04:15 PM"
    const dayMonthYearMatch = str.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s*•?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)))?/i);
    if (dayMonthYearMatch) {
      const day = dayMonthYearMatch[1].padStart(2, '0');
      const monthNames = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      const month = monthNames[dayMonthYearMatch[2].toLowerCase()] || '10';
      const year = dayMonthYearMatch[3];
      const time = dayMonthYearMatch[4] ? dayMonthYearMatch[4].toUpperCase() : '10:30 AM';
      return `${month}/${day}/${year} ${time}`;
    }

    // Handle "Sep 25, 2026 • 10:14 AM"
    const monthDayYearMatch = str.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})(?:\s*•?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)))?/i);
    if (monthDayYearMatch) {
      const monthNames = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      const month = monthNames[monthDayYearMatch[1].toLowerCase()] || '10';
      const day = monthDayYearMatch[2].padStart(2, '0');
      const year = monthDayYearMatch[3];
      const time = monthDayYearMatch[4] ? monthDayYearMatch[4].toUpperCase() : '10:30 AM';
      return `${month}/${day}/${year} ${time}`;
    }

    // Standard Date parser fallback
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      const mm = pad(parsed.getMonth() + 1);
      const dd = pad(parsed.getDate());
      const yyyy = parsed.getFullYear();
      let hours = parsed.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minutes = pad(parsed.getMinutes());
      return `${mm}/${dd}/${yyyy} ${pad(hours)}:${minutes} ${ampm}`;
    }

    return str;
  };

  // Aggregate stats across all broker registrations
  const stats = useMemo(() => {
    const totalBrokers = brokers.length;
    const connectedBrokers = brokers.filter(b => b.status === 'Connected' || b.status === 'Approved').length;
    const disconnectedBrokers = brokers.filter(b => b.status === 'Disconnected' || b.status === 'Cancelled').length;
    const liveBrokers = brokers.filter(b => b.type === 'LIVE').length;
    const demoBrokers = brokers.filter(b => b.type === 'DEMO').length;
    const totalAccounts = brokers.reduce((sum, b) => sum + (Number(b.accounts) || 0), 0);

    return {
      totalBrokers,
      connectedBrokers,
      disconnectedBrokers,
      liveBrokers,
      demoBrokers,
      totalAccounts
    };
  }, [brokers]);

  // Filtered brokers list
  const filteredBrokers = useMemo(() => {
    return brokers.filter(broker => {
      const matchesSearch = 
        broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (broker.profileId && broker.profileId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.managerId && broker.managerId.toString().includes(searchTerm)) ||
        (broker.referCode && broker.referCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.loginType && broker.loginType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.ipAddress && broker.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.serverName && broker.serverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.serverIp && broker.serverIp.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.type && broker.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.status && broker.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.connectedOn && broker.connectedOn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.createdOn && broker.createdOn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.contactPerson && broker.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.email && broker.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((broker.country || broker.Country) && (broker.country || broker.Country).toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'Connected') {
        matchesStatus = broker.status === 'Connected' || broker.status === 'Approved';
      } else if (statusFilter === 'Disconnected') {
        matchesStatus = broker.status === 'Disconnected' || broker.status === 'Cancelled';
      } else if (statusFilter === 'LIVE' || statusFilter === 'DEMO') {
        matchesStatus = broker.type === statusFilter;
      } else {
        matchesStatus = broker.status === statusFilter;
      }

      const matchesPlan = planFilter === 'ALL' || broker.planId === planFilter || broker.planName === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [brokers, searchTerm, statusFilter, planFilter]);

  return (
    <div>
      {/* Modals */}
      <AddBrokerModal 
        isOpen={isAddBrokerOpen} 
        onClose={() => setIsAddBrokerOpen(false)} 
      />
      <BrokerDetailsModal 
        broker={selectedBroker} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
      <EditBrokerModal 
        broker={editingBroker} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
      <UserTypeUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        initialProfileId={selectedBroker?.managerId || (brokers[0]?.managerId || '1000')}
      />

      {/* Human-Touch Executive Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.4px' }}>
              Broker Platform Registrations
            </h4>
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              <i className="bi bi-shield-check me-1"></i> {stats.connectedBrokers} Connected Platforms
            </span>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Monitor live MT5 Manager server bridges, active account copy synchronization, and platform health.
          </span>
        </div>

       
        <div className="d-flex align-items-center gap-2">
          <button 
            type="button"
            className="btn btn-light-custom"
            onClick={() => navigate('/subscriptions')}
          >
            <i className="bi bi-box-seam text-success"></i>
            <span>Subscription Packages</span>
          </button>
          
          <button 
            type="button"
            className="btn btn-neon-primary shadow-sm"
            onClick={() => setIsAddBrokerOpen(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Register Broker Platform</span>
          </button>
        </div>
      </div> */}

      {/* 4 Summary Stats Cards */}
      <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4 mb-4">
        
        {/* Metric 1: Total Registered Brokers */}
        <div className="col col-xl-4">
          <div 
            className="custom-card p-3.5 mb-0 h-100 hover-lift cursor-pointer"
            onClick={() => setStatusFilter('ALL')}
            style={{ borderColor: statusFilter === 'ALL' ? '#52D300' : undefined }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Total Brokers
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' }}
              >
                <i className="bi bi-buildings-fill fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-3">
              {stats.totalBrokers} <span className="fs-6 fw-normal text-secondary">Brokers</span>
            </div>
            <div className="text-secondary d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-layers text-primary"></i>
              <span>All registered broker platforms</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Connected Platforms */}
        <div className="col col-xl-4">
          <div 
            className="custom-card p-3.5 mb-0 h-100 hover-lift cursor-pointer"
            onClick={() => setStatusFilter('Connected')}
            style={{ 
              borderColor: statusFilter === 'Connected' ? '#22c55e' : undefined,
              backgroundColor: statusFilter === 'Connected' ? '#f0fdf4' : '#ffffff'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-success" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Connected Sessions
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: '#EDFAE6', color: '#166534' }}
              >
                <i className="bi bi-broadcast fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-3">
              {stats.connectedBrokers} <span className="fs-6 fw-semibold text-success">Connected</span>
            </div>
            <div className="text-success d-flex align-items-center gap-1 mt-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-check2-circle"></i>
              <span>Active MT5 manager synchronization</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Disconnected Platforms */}
        <div className="col col-xl-4">
          <div 
            className="custom-card p-3.5 mb-0 h-100 hover-lift cursor-pointer"
            onClick={() => setStatusFilter('Disconnected')}
            style={{ borderColor: statusFilter === 'Disconnected' ? '#ef4444' : undefined }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Disconnected
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
              >
                <i className="bi bi-slash-circle fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-3">
              {stats.disconnectedBrokers} <span className="fs-6 fw-semibold text-danger">Offline</span>
            </div>
            <div className="text-secondary d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-exclamation-triangle text-danger"></i>
              <span>Requires manager reconnection</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Managed Accounts */}
        {/* <div className="col">
          <div 
            className="custom-card p-3.5 mb-0 h-100 hover-lift cursor-pointer"
            onClick={() => setStatusFilter('ALL')}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Total Accounts
              </span>
              <div 
                className="stat-icon-wrapper"
                style={{ backgroundColor: '#FAF5FF', color: '#6B21A8' }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
            <div className="financial-value fw-bold text-dark fs-3">
              {stats.totalAccounts.toLocaleString()} <span className="fs-6 fw-semibold text-primary">Accounts</span>
            </div>
            <div className="text-secondary d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-hdd-network text-primary"></i>
              <span>Replicating across active brokers</span>
            </div>
          </div>
        </div> */}

      </div>

      {/* Main Registrations Table Card */}
      <div className="custom-card p-0 overflow-hidden shadow-sm bg-white">
        
        {/* Card Header & Controls Toolbar */}
        <div className="p-3 p-xl-4 border-bottom border-light bg-white">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            
            {/* Title */}
            <div>
              <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px' }}>
                Brokers List
              </h5>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              
              {/* Search input with clear button */}
              <div className="position-relative" style={{ minWidth: '260px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '0.8rem' }}></i>
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-5 pe-4" 
                  placeholder="Search profile ID, name, email, refer code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-secondary border-0"
                    onClick={() => setSearchTerm('')}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>

              {/* View Switcher */}
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'table' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                  title="List View"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid Cards View"
                >
                  <i className="bi bi-grid-fill"></i>
                </button>
              </div>

              {/* GET_ADM_PROFILES API Fetch Button */}
              {/* <button
                type="button"
                className="btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-1.5"
                onClick={handleSyncProfiles}
                disabled={syncingProfiles}
              >
                <i className={`bi bi-arrow-clockwise ${syncingProfiles ? 'spin' : ''}`}></i>
                <span>Reload</span>
              </button> */}

              {/* User Type URLs Modal Trigger Button */}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1.5"
                onClick={() => setIsUrlModalOpen(true)}
              >
                <i className="bi bi-link-45deg fs-6"></i>
                <span>URL Configuration</span>
              </button>

            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7' }}>
  {/* <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>PROFILE ID</th> */}
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>NAME</th>
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>EMAIL</th>
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>REFER CODE</th>
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>COUNTRY</th>
  {/* <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>LOGIN TYPE</th> */}
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>CREATED ON</th>
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>IP ADDRESS</th>
  <th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 20px', borderBottom: '1px solid #edf2f7' }}>ACTION</th>
</tr>
              </thead>
              <tbody>
                {filteredBrokers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-search fs-2 d-block mb-2 text-muted"></i>
                      <div className="fw-semibold text-dark">No broker registrations found</div>
                      <span className="small text-muted">Try adjusting your status filter or search query.</span>
                    </td>
                  </tr>
                ) : (
                  filteredBrokers.map((broker) => {
                    const raw = broker.rawProfile || broker;
                    const basic = raw.oBasic || broker.oBasic || {};
                    const isConnected = broker.status === 'Connected' || broker.status === 'Approved';
                    const profileId = String(raw.Profile ?? broker.profileId ?? broker.managerId ?? broker.id?.replace('brk-', '') ?? '');
                    
                    const firstName = basic.First || broker.firstName || '';
                    const lastName = basic.Last || broker.lastName || '';
                    const brokerName = (firstName || lastName) 
                      ? `${firstName} ${lastName}`.trim() 
                      : (broker.name || raw.name || `Broker ${profileId}`);

                    const email = basic.Email || raw.Email || broker.email || '';
                    const referCode = raw.ReferCode || broker.referCode || '';
                    const loginType = broker.loginType || 'MT5 Login';
                    const countryName = raw.Country || basic.Country || broker.country || broker.Country || '';
                    const flag = getCountryFlag(countryName) || broker.flag || '🌐';
                    const createdDate = raw.dtCreated?.Tm_Str || raw.dtCreated || broker.createdOn || broker.connectedOn || broker.registeredAt;
                    const ipAddress = basic.IPAddr || raw.IPAddr || broker.ipAddress || (broker.serverIp ? broker.serverIp.split(':')[0] : '') || clientIp || '';

                    const avatarInitials = (
                      (firstName.charAt(0) || brokerName.charAt(0) || 'B') +
                      (lastName.charAt(0) || (brokerName.split(' ')[1] ? brokerName.split(' ')[1].charAt(0) : 'R'))
                    ).toUpperCase();

                    return (
                      <tr 
                        key={broker.id} 
                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        onClick={() => handleOpenDetails(broker)}
                        title="Click to view broker details"
                      >
                        {/* 1. PROFILE ID */}
                        {/* <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center gap-2">
                            <span 
                              style={{ 
                                width: '7px', 
                                height: '7px', 
                                borderRadius: '50%', 
                                backgroundColor: isConnected ? '#16A34A' : '#DC2626',
                                display: 'inline-block',
                                flexShrink: 0
                              }}
                              title={isConnected ? 'Connected' : 'Disconnected'}
                            />
                            <span className="fw-bold text-dark font-monospace" style={{ fontSize: '13px' }}>
                              {profileId}
                            </span>
                          </div>
                        </td> */}

                        {/* 2. NAME */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center gap-2.5">
                            <div 
                              className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: broker.avatarBg || '#EDFAE6', 
                                color: broker.avatarColor || '#166534',
                                fontSize: '11.5px',
                                flexShrink: 0
                              }}
                            >
                              {avatarInitials}
                            </div>
                            <div>
                              <div className="fw-bold text-dark" style={{ fontSize: '13.5px', lineHeight: '1.25' }}>
                                {brokerName}
                              </div>
                              {broker.contactPerson && broker.contactPerson !== brokerName && (
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.2' }}>
                                  {broker.contactPerson}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. EMAIL */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>
                            {email || '—'}
                          </span>
                        </td>

                        {/* 4. REFER CODE */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          {referCode ? (
                            <span 
                              className="font-monospace fw-semibold"
                              style={{ 
                                fontSize: '12px',
                                backgroundColor: '#F8FAFC',
                                color: '#0F172A',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                letterSpacing: '0.4px',
                                display: 'inline-block'
                              }}
                            >
                              {referCode}
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '13px' }}>—</span>
                          )}
                        </td>

                        {/* 5. COUNTRY */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>{flag}</span>
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{countryName || '—'}</span>
                          </div>
                        </td>

                        {/* 6. LOGIN TYPE */}
                        {/* <td style={{ padding: '14px 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {(() => {
                            const isGoogle = loginType.toLowerCase().includes('google');
                            const isDirect = loginType.toLowerCase().includes('direct') || loginType.toLowerCase().includes('mt5');
                            
                            return (
                              <span 
                                style={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  backgroundColor: isGoogle ? '#FEF2F2' : isDirect ? '#EFF6FF' : '#F8FAFC',
                                  color: isGoogle ? '#DC2626' : isDirect ? '#2563EB' : '#475569',
                                  border: isGoogle ? '1px solid #FEE2E2' : isDirect ? '1px solid #DBEAFE' : '1px solid #E2E8F0'
                                }}
                              >
                                {isGoogle && <i className="bi bi-google" style={{ fontSize: '10px' }}></i>}
                                {!isGoogle && !isDirect && <i className="bi bi-envelope-fill" style={{ fontSize: '10px' }}></i>}
                                {isDirect && <i className="bi bi-cpu" style={{ fontSize: '11px' }}></i>}
                                <span>{loginType}</span>
                              </span>
                            );
                          })()}
                        </td> */}

                        {/* 7. CREATED ON */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle', color: '#475569', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {formatTimestamp(createdDate)}
                        </td>

                        {/* 8. IP ADDRESS */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          {ipAddress ? (
                            <div className="d-inline-flex align-items-center gap-2">
                              <span className="font-monospace text-dark" style={{ fontSize: '12.5px' }}>
                                {ipAddress}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm p-0 text-secondary border-0"
                                style={{ lineHeight: 1 }}
                                title="Copy IP Address"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyIp(ipAddress, brokerName);
                                }}
                              >
                                <i className="bi bi-clipboard" style={{ fontSize: '12px' }}></i>
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '12.5px' }}>—</span>
                          )}
                        </td>

                        {/* 9. ACTION */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                padding: '3px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#2563EB',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(broker);
                              }}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                padding: '3px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(broker);
                              }}
                            >
                              Edit
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
        ) : (
          /* Grid Cards View */
          <div className="p-3 p-xl-4 bg-light bg-opacity-40">
            <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
              {filteredBrokers.map((broker) => {
                const raw = broker.rawProfile || broker;
                const basic = raw.oBasic || broker.oBasic || {};
                const isConnected = broker.status === 'Connected' || broker.status === 'Approved';
                const profileId = String(raw.Profile ?? broker.profileId ?? broker.managerId ?? broker.id?.replace('brk-', '') ?? '');
                
                const firstName = basic.First || broker.firstName || '';
                const lastName = basic.Last || broker.lastName || '';
                const brokerName = (firstName || lastName) 
                  ? `${firstName} ${lastName}`.trim() 
                  : (broker.name || raw.name || `Broker ${profileId}`);

                const email = basic.Email || raw.Email || broker.email || '';
                const referCode = raw.ReferCode || broker.referCode || '';
                const countryName = raw.Country || basic.Country || broker.country || broker.Country || '';
                const flag = getCountryFlag(countryName) || broker.flag || '🌐';
                const createdDate = raw.dtCreated?.Tm_Str || raw.dtCreated || broker.createdOn || broker.connectedOn || broker.registeredAt;
                const ipAddress = basic.IPAddr || raw.IPAddr || broker.ipAddress || (broker.serverIp ? broker.serverIp.split(':')[0] : '') || clientIp || '';

                const avatarInitials = (
                  (firstName.charAt(0) || brokerName.charAt(0) || 'B') +
                  (lastName.charAt(0) || (brokerName.split(' ')[1] ? brokerName.split(' ')[1].charAt(0) : 'R'))
                ).toUpperCase();

                return (
                  <div className="col" key={broker.id}>
                    <div 
                      className="custom-card p-3.5 mb-0 h-100 hover-lift bg-white position-relative"
                      style={{ borderTop: isConnected ? '3px solid #22c55e' : '3px solid #ef4444' }}
                    >
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2.5">
                          <div 
                            className="broker-avatar shadow-2xs"
                            style={{ 
                              backgroundColor: broker.avatarBg || '#EDFAE6',
                              color: broker.avatarColor || '#166534',
                              fontWeight: 700
                            }}
                          >
                            {avatarInitials}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                              <span className="fw-bold text-dark">{brokerName}</span>
                              {/* <span style={{ fontSize: '14px' }} title={countryName}>{flag}</span> */}
                            </div>
                            {/* <div className="text-secondary font-monospace" style={{ fontSize: '0.74rem' }}>
                              Manager ID: <strong>{profileId}</strong>
                            </div> */}
                          </div>
                        </div>
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isConnected ? '#EBF8EE' : '#FEE8E8',
                            color: isConnected ? '#16A34A' : '#DC2626'
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: isConnected ? '#16A34A' : '#DC2626' }}></span>
                          {broker.status}
                        </span>
                      </div>

                      {/* Server, Email, IP & Account Info */}
                      <div className="bg-light rounded-3 p-2.5 mb-3" style={{ fontSize: '0.78rem' }}>
                        <div className="d-flex justify-content-between text-secondary">
                          <span>Email:</span>
                          <span className="text-dark fw-medium text-truncate ms-2" style={{ maxWidth: '180px' }}>{email || '—'}</span>
                        </div>
                        {referCode && (
                          <div className="d-flex justify-content-between text-secondary mt-1">
                            <span>Refer Code:</span>
                            <span className="font-monospace fw-semibold text-dark">{referCode}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between text-secondary mt-1">
                          <span>Country:</span>
                          <span className="fw-medium text-dark">{flag} {countryName || '—'}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center text-secondary mt-1">
                          <span>IP Address:</span>
                          {ipAddress ? (
                            <span className="font-monospace text-dark d-inline-flex align-items-center gap-1">
                              {ipAddress}
                              <button
                                type="button"
                                className="btn btn-sm p-0 text-secondary border-0"
                                style={{ lineHeight: 1 }}
                                title="Copy IP Address"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyIp(ipAddress, brokerName);
                                }}
                              >
                                <i className="bi bi-clipboard" style={{ fontSize: '11px' }}></i>
                              </button>
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </div>
                        <div className="d-flex justify-content-between text-secondary mt-1">
                          <span>Created On:</span>
                          <span className="text-dark font-tabular">{formatTimestamp(createdDate)}</span>
                        </div>
                        {/* <div className="d-flex justify-content-between text-secondary mt-1">
                          <span>Server:</span>
                          <span className="fw-semibold text-dark">{broker.serverName || `Manager-${profileId}`}</span>
                        </div> */}
                      </div>

                      {/* Direct Actions in Card */}
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-light border px-2.5 py-1 text-primary fw-semibold"
                          style={{ fontSize: '0.76rem' }}
                          onClick={() => handleOpenDetails(broker)}
                        >
                          View Details
                        </button>

                        <div className="d-flex align-items-center gap-1.5">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-light border px-2.5 py-1"
                            style={{ fontSize: '0.76rem' }}
                            onClick={() => handleOpenEdit(broker)}
                          >
                            Edit
                          </button>

                          {isConnected ? (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger px-2 py-1"
                              style={{ fontSize: '0.76rem' }}
                              onClick={() => handleToggleConnection(broker)}
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-success px-2 py-1 fw-bold"
                              style={{ fontSize: '0.76rem' }}
                              onClick={() => handleToggleConnection(broker)}
                            >
                              Reconnect
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Status Summary Bar */}
        <div className="p-3 border-top bg-light bg-opacity-30 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2" style={{ fontSize: '0.82rem' }}>
          <span className="text-secondary">
            Showing <strong className="text-dark">{filteredBrokers.length}</strong> of {brokers.length} total broker platforms.
          </span>
          <div className="d-flex align-items-center gap-3 text-secondary">
            <span><i className="bi bi-shield-check text-success me-1"></i>Active Manager Session Verification</span>
            <span><i className="bi bi-clock-history text-primary me-1"></i>Real-Time Account Sync</span>
          </div>
        </div>

      </div>
    </div>
  );
}
