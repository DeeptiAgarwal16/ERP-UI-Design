/**
 * GNV COMMODITIES PVT. LTD. — WAREHOUSE LOCATIONS MODULE
 * 4 Regional Hubs: Chennai, Mumbai, Kolkata, Noida
 */

import { store } from '../store.js';

export function renderWarehouses(container) {
  const d = store.data;

  container.innerHTML = `
    <div class="page-top-bar" style="margin-bottom: 20px;">
      <div class="page-title">
        <i data-lucide="warehouse" style="color: var(--primary-blue);"></i>
        <span>Regional Warehouses & Logistics Hubs (4 Hubs)</span>
      </div>
      <div class="page-actions">
        <span class="badge badge-delivered" style="font-size: 11px; padding: 6px 12px;">
          All 4 Regional Hubs Active & Operational
        </span>
      </div>
    </div>

    <!-- 4 Primary Regional Hubs Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
      ${d.warehouses.map(wh => {
        const whBatches = store.getBatchesForProduct(d.products[0].sku, wh.name);
        const totalItemsInHub = d.batches.filter(b => b.warehouseName === wh.name || b.location === wh.name).length || 5;

        return `
          <div class="hub-card" style="box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05); border-radius: 10px;">
            <div class="hub-card-header">
              <div>
                <strong style="font-size: 16px; color: #0F172A;">${wh.displayName || wh.name + ' Warehouse'}</strong>
                <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                  Hub Code: <code>${wh.code}</code> &bull; ${wh.state}
                </div>
              </div>
              <span class="badge badge-confirmed" style="font-size: 11px;">${wh.city}</span>
            </div>

            <div class="hub-card-body">
              <div style="font-size: 12px; color: #475569; margin-bottom: 14px; line-height: 1.5; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                <i data-lucide="map-pin" style="width: 13px; height: 13px; color: var(--primary-blue); display: inline-block; vertical-align: middle;"></i>
                ${wh.address}
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; margin-bottom: 12px;">
                <div>
                  <span style="color: #64748B;">Facility Size:</span><br>
                  <strong style="color: #0F172A;">${wh.capacity || '18,000 Sq. Ft.'}</strong>
                </div>
                <div>
                  <span style="color: #64748B;">Active Batches:</span><br>
                  <strong style="color: var(--pet-emerald);">${totalItemsInHub} Tracked Batches</strong>
                </div>
              </div>

              <div style="font-size: 12px; line-height: 1.8;">
                Hub Manager: <strong>${wh.manager}</strong><br>
                Contact: <strong>${wh.contact}</strong><br>
                Status: <span class="badge badge-delivered" style="font-size: 10px;">OPERATIONAL</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
