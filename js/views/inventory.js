/**
 * GNV COMMODITIES PVT. LTD. — INVENTORY & BATCH MANAGEMENT MODULE
 */

import { store } from '../store.js';
import { exportToCSV } from '../pdfGenerator.js';

export function renderInventory(container) {
  let filterStatus = 'ALL'; // 'ALL' | 'NORMAL' | 'SHORT_EXPIRY' | 'EXPIRED'
  let filterCity = 'ALL';
  let searchTerm = '';

  function render() {
    const d = store.data;
    let list = [...d.batches];

    if (filterStatus === 'SHORT_EXPIRY') {
      list = list.filter(b => b.status === 'Short Expiry');
    } else if (filterStatus === 'EXPIRED') {
      list = list.filter(b => b.status === 'Expired');
    } else if (filterStatus === 'NORMAL') {
      list = list.filter(b => b.status === 'Normal');
    }

    if (filterCity !== 'ALL') {
      list = list.filter(b => b.city === filterCity);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(b =>
        b.batchNumber.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.sku.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
      );
    }

    // Sort by FEFO (Earliest Expiry Date first)
    list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Inventory & Batches</span>
          </div>
          <h1 class="page-title">Inventory & FEFO Batch Ledger</h1>
          <div class="page-desc">Three-tier tracking: City &rarr; Warehouse Hub &rarr; Storage Rack/Zone with strict FEFO governance.</div>
        </div>
        <div class="page-actions">
          <button id="btn-export-inventory" class="btn btn-outline">
            <i data-lucide="download"></i> Export Inventory CSV
          </button>
          <button class="btn btn-primary" onclick="window.location.hash='#inward'">
            <i data-lucide="arrow-down-left"></i> Receive Stock Inward
          </button>
        </div>
      </div>

      <!-- Instruction Panel -->
      <div class="instruction-panel">
        <div class="instruction-content">
          <div class="instruction-icon"><i data-lucide="shield-check"></i></div>
          <div>
            <div class="instruction-title">FEFO (First Expiry, First Out) Protocol Active</div>
            <div class="instruction-text">
              Batches expiring within 6 months (< 180 days) are highlighted with red alerts. Expired batches are automatically locked and quarantined from order allocation.
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-wrap">
            <input type="text" id="batch-search" class="table-search-input" placeholder="Search batch#, SKU, item name..." value="${searchTerm}">
          </div>
          <select id="status-filter" class="form-select">
            <option value="ALL" ${filterStatus === 'ALL' ? 'selected' : ''}>All Stock Batches (${d.batches.length})</option>
            <option value="SHORT_EXPIRY" ${filterStatus === 'SHORT_EXPIRY' ? 'selected' : ''}>Short Expiry Only (&lt; 6 Months)</option>
            <option value="EXPIRED" ${filterStatus === 'EXPIRED' ? 'selected' : ''}>Expired / Quarantined</option>
            <option value="NORMAL" ${filterStatus === 'NORMAL' ? 'selected' : ''}>Normal Stable Stock</option>
          </select>
          <select id="city-filter" class="form-select">
            <option value="ALL" ${filterCity === 'ALL' ? 'selected' : ''}>All Warehouse Cities</option>
            <option value="Chennai" ${filterCity === 'Chennai' ? 'selected' : ''}>Chennai</option>
            <option value="Mumbai" ${filterCity === 'Mumbai' ? 'selected' : ''}>Mumbai</option>
            <option value="Noida" ${filterCity === 'Noida' ? 'selected' : ''}>Noida</option>
            <option value="Kolkata" ${filterCity === 'Kolkata' ? 'selected' : ''}>Kolkata</option>
          </select>
        </div>
        <div style="font-size: 12px; color: var(--secondary-text);">
          Showing <strong>${list.length}</strong> active batch records
        </div>
      </div>

      <!-- Batches Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Item & SKU</th>
                <th>Warehouse City</th>
                <th>Storage Location</th>
                <th>Mfg Date</th>
                <th>Expiry Date</th>
                <th>Days to Expiry</th>
                <th class="number-cell">Physical Qty</th>
                <th class="number-cell">Reserved</th>
                <th class="number-cell">Available Stock</th>
                <th style="text-align: center;">FEFO Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(b => {
                const isShort = b.status === 'Short Expiry';
                const isExp = b.status === 'Expired';

                return `
                  <tr style="${isShort ? 'background-color: #FFF5F5;' : isExp ? 'background-color: #FEF2F2; opacity: 0.75;' : ''}">
                    <td>
                      <strong>${b.batchNumber}</strong>
                    </td>
                    <td>
                      <strong style="color: var(--deep-navy);">${b.productName}</strong>
                      <br><small style="color: var(--secondary-text);">${b.sku}</small>
                    </td>
                    <td><strong>${b.city}</strong></td>
                    <td><code>${b.location}</code></td>
                    <td>${b.mfgDate}</td>
                    <td>
                      <strong>${b.expiryDate}</strong>
                    </td>
                    <td>
                      <strong style="color: ${b.daysToExpiry < 180 ? 'var(--error-red)' : 'var(--secondary-text)'};">
                        ${b.daysToExpiry > 0 ? `${b.daysToExpiry} days` : 'Expired'}
                      </strong>
                    </td>
                    <td class="number-cell">${b.physicalQty}</td>
                    <td class="number-cell" style="color: var(--secondary-text);">${b.reservedQty || 0}</td>
                    <td class="number-cell" style="font-weight: 700; color: ${b.availableQty > 0 ? 'var(--deep-navy)' : 'var(--error-red)'}; font-size: 14px;">
                      ${b.availableQty}
                    </td>
                    <td style="text-align: center;">
                      <span class="badge ${isExp ? 'badge-expired' : isShort ? 'badge-short-expiry' : 'badge-completed'}">
                        ${b.status}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    container.querySelector('#batch-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
    });

    container.querySelector('#status-filter').addEventListener('change', (e) => {
      filterStatus = e.target.value;
      render();
    });

    container.querySelector('#city-filter').addEventListener('change', (e) => {
      filterCity = e.target.value;
      render();
    });

    container.querySelector('#btn-export-inventory').addEventListener('click', () => {
      exportToCSV('GNV_Inventory_Batches.csv', d.batches);
    });
  }

  render();
}
