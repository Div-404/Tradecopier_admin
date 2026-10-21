import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FinancePackagesTab from './tabs/FinancePackagesTab';
import FinanceSubscriptionsTab from './tabs/FinanceSubscriptionsTab';
import FinanceTransactionsTab from './tabs/FinanceTransactionsTab';
import FinanceRemindersTab from './tabs/FinanceRemindersTab';
import FinanceCouponsTab from './tabs/FinanceCouponsTab';

/**
 * FinancePage (Finance Module)
 * Implements Image 1 Structure:
 * 1. Package
 * 2. Subscription (Filtered by Name, Email, Phone, PkgID, Status)
 * 3. Transaction
 * 4. Reminder
 * + Coupons (Other section)
 */
export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'packages';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const TABS = [
    {
      id: 'packages',
      title: 'Package',
      icon: 'bi-box-seam-fill',
    },
    {
      id: 'subscriptions',
      title: 'Subscription',
      icon: 'bi-people-fill',
    },
    {
      id: 'transactions',
      title: 'Transaction',
      icon: 'bi-receipt-cutoff',
    },
    {
      id: 'reminders',
      title: 'Reminder',
      icon: 'bi-alarm-fill',
    },
    {
      id: 'coupons',
      title: 'Coupons',
      icon: 'bi-tag-fill',
    },
  ];

  return (
    <div className="finance-page pb-5">
      
      {/* Finance Header & Segmented Tab Navigation */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        
        {/* Top Header Row */}
        {/* <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 border-bottom border-light">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-success shadow-2xs"
              style={{ width: '48px', height: '48px', backgroundColor: '#e6f4ea' }}
            >
              <i className="bi bi-wallet2 fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.4px' }}>
                Finance Management
              </h4>
              <span className="text-secondary" style={{ fontSize: '0.84rem' }}>
                Complete oversight of copier packages, active subscriber quotas, transactions, renewals, and coupons.
              </span>
            </div>
          </div>

          
        </div> */}

        {/* 4 Tabs Bar (Package, Subscription, Transaction, Reminder, Coupons / Other) - No 1,2,3,4 */}
        <div 
          className="d-flex align-items-center gap-2 pt-3 overflow-x-auto" 
          style={{ scrollbarWidth: 'thin' }}
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className="btn d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-nowrap transition-all"
                style={{
                  border: isActive ? '2px solid #22c55e' : '2px solid transparent',
                  backgroundColor: isActive ? '#EDFAE6' : '#f8fafc',
                  color: isActive ? '#166534' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <i className={`bi ${tab.icon} me-2`} style={{ fontSize: '1rem', color: isActive ? '#166534' : '#64748b' }}></i>
                <span>{tab.title}</span>
              </button>
            );
          })}
          
        </div>

      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeTab === 'packages' && <FinancePackagesTab />}
        {activeTab === 'subscriptions' && <FinanceSubscriptionsTab />}
        {activeTab === 'transactions' && <FinanceTransactionsTab />}
        {activeTab === 'reminders' && <FinanceRemindersTab />}
        {activeTab === 'coupons' && <FinanceCouponsTab />}
      </div>

    </div>
  );
}
