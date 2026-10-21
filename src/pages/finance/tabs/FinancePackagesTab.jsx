import React, { useState, useEffect, useCallback } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminContext';
import CreatePackageModal from '../../../components/modals/CreatePackageModal';
import CustomizePackageModal from '../../../components/modals/CustomizePackageModal';
import { apiGetAdmUserPackage, apiDelAdmUserPackage } from '../../../services/api';

const SERVICE_TABS = [
  { id: 'internal-trade-copier', typeId: 1, title: 'Internal Trade Copier', icon: 'bi-arrow-left-right' },
  { id: 'cross-broker-trade-copier', typeId: 2, title: 'Cross-Broker Trade Copier', icon: 'bi-diagram-3-fill' },
  { id: 'fund-to-mt-group', typeId: 3, title: 'Fund to MT Group', icon: 'bi-file-earmark-spreadsheet-fill' },
  { id: 'account-to-mt-group', typeId: 4, title: 'Account to MT Group', icon: 'bi-boxes' },
  { id: 'broker-data-shifter', typeId: 5, title: 'Broker Data Shifter', icon: 'bi-database-fill-gear' },
  { id: 'lp-bridge', typeId: 6, title: 'LP Bridge', icon: 'bi-hdd-network-fill' },
  { id: 'mamm', typeId: 7, title: 'MAMM', icon: 'bi-people-fill' },
  { id: 'pamm', typeId: 8, title: 'PAMM', icon: 'bi-people-fill' },
];

export default function FinancePackagesTab() {
  const { showToast } = useSuperAdmin();

  // Tab State
  const [activeTabId, setActiveTabId] = useState(SERVICE_TABS[0].id);
  const activeTab = SERVICE_TABS.find((t) => t.id === activeTabId) || SERVICE_TABS[0];

  // Dynamic API Packages State across all types
  const [packagesByTypeMap, setPackagesByTypeMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Fetch packages for all copier types (1-8)
  const fetchAllTypePackages = useCallback(async () => {
    setLoading(true);
    try {
      const map = {};
      const typeIds = [1, 2, 3, 4, 5, 6, 7, 8];
      await Promise.all(
        typeIds.map(async (typeId) => {
          try {
            const data = await apiGetAdmUserPackage(typeId);
            map[typeId] = Array.isArray(data) ? data : [];
          } catch {
            map[typeId] = [];
          }
        })
      );
      setPackagesByTypeMap(map);
    } catch (err) {
      console.error("Error fetching packages by type:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTypePackages();
  }, [fetchAllTypePackages]);

  // Packages for currently active tab & Total across all tabs
  const tabPackages = packagesByTypeMap[activeTab.typeId] || [];
  const totalPackagesCount = Object.values(packagesByTypeMap).reduce((sum, list) => sum + (list?.length || 0), 0);

  // Handle Delete Package via DEL_ADM_USER_PACKAGE API
  const handleDeletePackage = async (pkgItem) => {
    const oPkg = pkgItem.oPkg || pkgItem;
    const pkgName = oPkg.Pkg || 'Package';
    const pkgId = pkgItem.PkgID ?? oPkg.PkgID ?? 0;

    if (!window.confirm(`Are you sure you want to delete package "${pkgName}"?`)) return;

    try {
      const res = await apiDelAdmUserPackage(pkgId || pkgName);
      showToast?.(res.MSG_USER || `Package "${pkgName}" deleted successfully!`, 'success');
      await fetchAllTypePackages();
    } catch (err) {
      console.error("DEL_ADM_USER_PACKAGE Error:", err);
      showToast?.("API Delete Error: " + err.message, "error");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (pkgItem) => {
    setEditingPackage(pkgItem);
    setIsCreatePackageOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPackage(null);
    setIsCreatePackageOpen(true);
  };

  return (
    <div>
      {/* Create / Edit Package Modal */}
      <CreatePackageModal 
        isOpen={isCreatePackageOpen} 
        onClose={() => setIsCreatePackageOpen(false)}
        initialData={editingPackage}
        initialType={activeTab.typeId}
        onPackageCreated={() => fetchAllTypePackages()}
      />

      {/* Customize Package Modal */}
      <CustomizePackageModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onPackageCustomized={() => fetchAllTypePackages()}
      />

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.4px' }}>
              Subscription Packages for Brokers
            </h4>
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              <i className="bi bi-box-seam me-2"></i> {totalPackagesCount} Packages
            </span>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Official Trade Copier packages for managing broker subscriptions and access.
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            type="button" 
            className="btn btn-outline-success shadow-2xs d-flex align-items-center gap-2 fw-semibold"
            style={{ borderRadius: '10px', fontSize: '0.86rem' }}
            onClick={() => setIsCustomizeModalOpen(true)}
          >
            <i className="bi bi-sliders me-2"></i>
            <span>Customize Package</span>
          </button>
          <button 
            type="button" 
            className="btn btn-neon-primary shadow-sm d-flex align-items-center gap-2"
            onClick={handleOpenCreate}
          >
            <i className="bi bi-plus-lg me-2"></i>
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* 8 Services Tabs Section */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">

        {/* Tab Buttons Strip */}
        <div 
          className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-4 border-bottom" 
          style={{ scrollbarWidth: 'thin' }}
        >
          {SERVICE_TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            const countForType = (packagesByTypeMap[tab.typeId] || []).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className="btn d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-nowrap"
                style={{
                  border: isActive ? '2px solid #22c55e' : '2px solid transparent',
                  backgroundColor: isActive ? '#EDFAE6' : '#f8fafc',
                  color: isActive ? '#166534' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <i className={`bi ${tab.icon}`} style={{ fontSize: '0.9rem' }}></i>
                <span>{tab.title}</span>
                <span 
                  className="d-flex align-items-center justify-content-center rounded-circle ms-1"
                  style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#166534' : '#cbd5e1',
                    color: isActive ? '#ffffff' : '#475569',
                  }}
                >
                  {countForType}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Package Cards Grid */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success mb-2" role="status"></div>
            <div>Fetching packages for {activeTab.title}...</div>
          </div>
        ) : tabPackages.length === 0 ? (
          /* Empty State when GET_ADM_USER_PACKAGE returns [] */
          <div className="text-center py-5 px-3 bg-light bg-opacity-50 rounded-4 border border-dashed my-2" style={{ borderColor: '#cbd5e1' }}>
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', color: '#64748b' }}
            >
              <i className="bi bi-box-seam fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">No package found</h5>
            <p className="text-secondary mx-auto mb-3" style={{ maxWidth: '440px', fontSize: '0.88rem' }}>
              No subscription packages are configured for <strong>{activeTab.title}</strong> (Copier Type {activeTab.typeId}).
            </p>
            <button
              type="button"
              className="btn btn-neon-primary px-4 fw-bold shadow-sm"
              onClick={handleOpenCreate}
            >
              <i className="bi bi-plus-lg me-2"></i>
              <span>Create Package for {activeTab.title}</span>
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {tabPackages.map((item, idx) => {
              const oPkg = item.oPkg || item;
              const pkgName = oPkg.Pkg || `Package ${idx + 1}`;
              const master = oPkg.Master ?? 1;
              const slave = oPkg.Slave ?? 1;
              const duration = oPkg.Duration_Days ?? 30;
              const amount = oPkg.Amount ?? 0;
              const tradeProp = Number(oPkg.TradeProp ?? 2);
              const riskManager = Number(oPkg.RiskManager ?? 2);

              return (
                <div className="col-12 col-md-4" key={idx}>
                  <div 
                    className="p-4 bg-white rounded-4 border h-100"
                    style={{ 
                      borderColor: '#e2e8f0',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' 
                    }}
                  >
                    {/* Header: Green 3D Box Icon + Package Name */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          backgroundColor: '#e8faee', 
                          border: '1px solid #c6f6d5', 
                          borderRadius: '12px' 
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                          <path d="M16 3L28 9.5L16 16L4 9.5L16 3Z" fill="#34D399" />
                          <path d="M4 9.5L16 16V28.5L4 22V9.5Z" fill="#059669" />
                          <path d="M16 16L28 9.5V22L16 28.5V16Z" fill="#10B981" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.3px', fontSize: '1.25rem' }}>
                          {pkgName}
                        </h4>
                        {oPkg.Information && (
                          <span className="badge bg-light text-dark border me-2" style={{ fontSize: '0.65rem' }}>
                            {oPkg.Information}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4 Stat Boxes in 2x2 Grid */}
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: '#f0f7ff', border: '1px solid #e0f2fe' }}>
                          <div className="fw-bolder text-dark fs-5 mb-0">{master}</div>
                          <div className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>Max Master Accounts</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                          <div className="fw-bolder text-dark fs-5 mb-0">{slave}</div>
                          <div className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>Max Investor Accounts</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: '#faf5ff', border: '1px solid #ede9fe' }}>
                          <div className="fw-bolder text-dark fs-5 mb-0">{duration} Days</div>
                          <div className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>Duration</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: '#fff1f2', border: '1px solid #ffe4e6' }}>
                          <div className="fw-bolder text-dark fs-5 mb-0">${amount} USD</div>
                          <div className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>Subscription Fee</div>
                        </div>
                      </div>
                    </div>

                    {/* Features Indicator Banner */}
                    <div className="p-2 px-3 rounded-3 mb-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f2fbf6', border: '1px solid #dcfce7' }}>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                        <i className={`bi bi-${tradeProp === 2 ? 'check-circle-fill text-success' : 'x-circle-fill text-muted'} me-2`}></i>
                        <span className="fw-bold">Trade Prop ({tradeProp === 2 ? 'On' : 'Off'})</span>
                      </div>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                        <i className={`bi bi-${riskManager === 2 ? 'check-circle-fill text-success' : 'x-circle-fill text-muted'} me-2`}></i>
                        <span className="fw-bold">Risk Manager ({riskManager === 2 ? 'On' : 'Off'})</span>
                      </div>
                    </div>

                    {/* Action Buttons: Edit Package & Delete Package */}
                    <div className="row g-2">
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn w-100 text-white fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                          style={{ backgroundColor: '#059669', borderRadius: '8px', fontSize: '0.82rem' }}
                          onClick={() => handleOpenEdit(item)}
                        >
                          <i className="bi bi-pencil-fill me-2"></i>
                          <span>Edit Package</span>
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                          style={{ backgroundColor: '#ffffff', border: '2px solid #fecdd3', color: '#e11d48', borderRadius: '8px', fontSize: '0.82rem' }}
                          onClick={() => handleDeletePackage(item)}
                        >
                          <i className="bi bi-trash3-fill me-2"></i>
                          <span>Delete Package</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
