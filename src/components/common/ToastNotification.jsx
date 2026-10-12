import React from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function ToastNotification() {
  const { toastMessage, toastType } = useSuperAdmin();

  if (!toastMessage) return null;

  const isSuccess = toastType === 'success';
  const isInfo = toastType === 'info';
  const isWarning = toastType === 'warning';
  const isDanger = toastType === 'danger';

  let bgClass = 'bg-white';
  let borderClass = 'border-success';
  let iconClass = 'bi-check-circle-fill text-success';

  if (isInfo) {
    borderClass = 'border-info';
    iconClass = 'bi-info-circle-fill text-info';
  } else if (isWarning) {
    borderClass = 'border-warning';
    iconClass = 'bi-exclamation-triangle-fill text-warning';
  } else if (isDanger) {
    borderClass = 'border-danger';
    iconClass = 'bi-x-circle-fill text-danger';
  }

  return (
    <div 
      className="position-fixed bottom-0 end-0 p-3" 
      style={{ zIndex: 1100 }}
    >
      <div 
        className={`toast show ${bgClass} border ${borderClass} shadow-lg rounded-3 p-3 d-flex align-items-center gap-3`}
        style={{ minWidth: '320px', maxWidth: '420px', animation: 'fadeInUp 0.25s ease' }}
        role="alert"
      >
        <i className={`bi ${iconClass} fs-4`}></i>
        <div className="flex-grow-1">
          <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>Notification</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{toastMessage}</div>
        </div>
      </div>
    </div>
  );
}
