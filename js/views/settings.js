/**
 * GNV COMMODITIES PVT. LTD. — SYSTEM SETTINGS
 */

import { store } from '../store.js';

export function renderSettings(container) {
  const d = store.data;

  container.innerHTML = `
    <div class="page-top-bar">
      <div class="page-title">
        <i data-lucide="settings" style="color: var(--primary-blue);"></i>
        <span>Settings & User Profile</span>
      </div>
      <div class="page-actions">
        <button id="btn-reset-data" class="btn btn-outline" style="color: var(--danger);">
          <i data-lucide="rotate-ccw"></i> Reset Sample Data
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      
      <!-- User Profile Card -->
      <div class="form-page-container">
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: #0F172A; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="user"></i> User Profile
        </h3>

        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div class="topbar-avatar" style="width: 52px; height: 52px; font-size: 18px;">
            DA
          </div>
          <div>
            <h4 style="font-size: 17px; font-weight: 800; color: #0F172A;">${d.currentUser.name}</h4>
            <div style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">${d.currentUser.role}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${d.currentUser.email}</div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 14px;">
          <strong style="font-size: 12px; color: #475569; text-transform: uppercase;">Assigned Warehouses (4 Regional Hubs):</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
            ${d.currentUser.assignedWarehouses.map(w => `<span class="badge badge-draft">${w}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Company Credentials -->
      <div class="form-page-container">
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: #0F172A; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="building"></i> Company Information
        </h3>

        <div style="font-size: 12.5px; line-height: 1.8;">
          <div>Legal Name: <strong>${d.company.legalName}</strong></div>
          <div>GSTIN: <strong>${d.company.gstin}</strong></div>
          <div>PAN: <strong>${d.company.pan}</strong></div>
          <div>Registered Address: <strong>${d.company.address}, ${d.company.city}, ${d.company.state} - ${d.company.pinCode}</strong></div>
          <div>Phone: <strong>${d.company.phone}</strong></div>
          <div>Email: <strong>${d.company.email}</strong></div>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
    if (confirm("Reset to clean sample data?")) {
      store.reset();
      window.location.reload();
    }
  });
}
