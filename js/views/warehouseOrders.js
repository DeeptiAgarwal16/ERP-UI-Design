/**
 * GNV COMMODITIES PVT. LTD. — WAREHOUSE SALES ORDERS MODULE
 * Filter child orders by regional warehouses (FRS & DES) and Balance SSO
 */

import { store } from '../store.js';

export function renderWarehouseOrders(container, initialFilter = 'ALL') {
  let activeTab = initialFilter;
  const d = store.data;

  function render() {
    let list = [...d.childSalesOrders];

    if (activeTab === 'BALANCE_SSO') {
      list = list.filter(c => c.isBalanceSSO);
    } else if (activeTab !== 'ALL') {
      list = list.filter(c => c.warehouseCity === activeTab || c.warehouseName.includes(activeTab));
    }

    container.innerHTML = `
      <div class="page-top-bar">
        <div class="page-title">
          <i data-lucide="git-merge" style="color: var(--primary-blue);"></i>
          <span>Warehouse Child Sales Orders</span>
        </div>
      </div>

      <!-- Clean Tab Bar -->
      <div style="display: flex; gap: 6px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; overflow-x: auto;">
        <button class="btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}" data-tab="ALL">All Orders (${d.childSalesOrders.length})</button>
        <button class="btn btn-sm ${activeTab === 'Chennai' ? 'btn-primary' : 'btn-outline'}" data-tab="Chennai">Chennai Hub</button>
        <button class="btn btn-sm ${activeTab === 'Mumbai' ? 'btn-primary' : 'btn-outline'}" data-tab="Mumbai">Mumbai Hub</button>
        <button class="btn btn-sm ${activeTab === 'Kolkata' ? 'btn-primary' : 'btn-outline'}" data-tab="Kolkata">Kolkata Hub</button>
        <button class="btn btn-sm ${activeTab === 'Noida' ? 'btn-primary' : 'btn-outline'}" data-tab="Noida">Noida Hub</button>
        <button class="btn btn-sm ${activeTab === 'BALANCE_SSO' ? 'btn-primary' : 'btn-outline'}" data-tab="BALANCE_SSO" style="color: #92400E;">
          Balance SSO (${d.childSalesOrders.filter(c => c.isBalanceSSO).length})
        </button>
      </div>

      <div class="table-card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>CHILD SO#</th>
                <th>GNV GROUP</th>
                <th>CUSTOMER</th>
                <th>WAREHOUSE</th>
                <th class="text-right">QUANTITY</th>
                <th class="text-right">AMOUNT</th>
                <th>BATCH REF</th>
                <th>STATUS</th>
                <th style="text-align: center;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => `
                <tr style="${c.isBalanceSSO ? 'background: #FFFDF5;' : ''}">
                  <td>
                    <strong>${c.soNumber}</strong>
                    ${c.isBalanceSSO ? '<br><span class="badge badge-pending">Balance SSO</span>' : ''}
                  </td>
                  <td>
                    <span class="gnv-tag" onclick="window.location.hash='#gnv-group/${c.gnvNumber}'">${c.gnvNumber}</span>
                  </td>
                  <td><strong style="color: #0F172A;">${c.customerName}</strong></td>
                  <td><strong style="color: var(--primary-blue);">${c.warehouseName}</strong></td>
                  <td class="text-right"><strong>${c.allocatedQty}</strong> Nos.</td>
                  <td class="text-right">₹${Number(c.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td><code>${c.batchDetails}</code></td>
                  <td>
                    <span class="badge ${c.isBalanceSSO ? 'badge-draft' : 'badge-confirmed'}">
                      ${c.status}
                    </span>
                  </td>
                  <td style="text-align: center; white-space: nowrap;">
                    ${!c.isBalanceSSO ? `
                      <button class="btn btn-sm btn-outline" onclick="window.location.hash='#invoices/new-from-so/${encodeURIComponent(c.soNumber)}'">
                        <i data-lucide="file-text"></i> Invoice
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-ghost" onclick="window.location.hash='#gnv-group/${c.gnvNumber}'">
                      <i data-lucide="eye"></i> GNV Group
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });
  }

  render();
}
