/**
 * GNV COMMODITIES PVT. LTD. — CUSTOMER MASTER MODULE
 */

import { store } from '../store.js';

export function renderCustomers(container) {
  let searchTerm = '';

  function render() {
    const d = store.data;
    let list = [...d.customers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Customer Master</span>
          </div>
          <h1 class="page-title">Indian Customer Directory (${d.customers.length})</h1>
          <div class="page-desc">Retailers, distributors, and veterinary clinics across India with credit exposure monitors.</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-wrap">
            <input type="text" id="cust-search" class="table-search-input" placeholder="Search customer, city, GSTIN, contact..." value="${searchTerm}">
          </div>
        </div>
        <div style="font-size: 12px; color: var(--secondary-text);">
          Showing <strong>${list.length}</strong> registered customer accounts
        </div>
      </div>

      <!-- Customers Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Customer Code & Name</th>
                <th>City & State</th>
                <th>Contact Person & Phone</th>
                <th>GSTIN</th>
                <th>Customer Tier</th>
                <th>Payment Terms</th>
                <th class="number-cell">Credit Limit</th>
                <th class="number-cell">Credit Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => {
                const avail = c.creditLimit - c.currentCreditUsed;
                const pct = Math.round((c.currentCreditUsed / c.creditLimit) * 100);

                return `
                  <tr>
                    <td>
                      <strong style="color: var(--deep-navy);">${c.name}</strong>
                      <br><code style="font-size: 11px;">${c.code}</code>
                    </td>
                    <td>
                      <strong>${c.city}</strong>
                      <br><small style="color: var(--secondary-text);">${c.state}</small>
                    </td>
                    <td>
                      ${c.contactPerson}
                      <br><small style="color: var(--secondary-text);">${c.phone}</small>
                    </td>
                    <td><code>${c.gstin}</code></td>
                    <td><span class="badge badge-draft">${c.customerGroup || 'Gold Tier'}</span></td>
                    <td>${c.paymentTerms}</td>
                    <td class="number-cell">₹${c.creditLimit.toLocaleString('en-IN')}</td>
                    <td class="number-cell">
                      <strong style="color: ${avail < 50000 ? 'var(--danger-red)' : 'var(--success-green)'};">
                        ₹${avail.toLocaleString('en-IN')}
                      </strong>
                      <div style="background: #E2E8F0; height: 4px; border-radius: 2px; margin-top: 4px; overflow: hidden; width: 80px; margin-left: auto;">
                        <div style="width: ${pct}%; background: ${pct > 80 ? 'var(--danger-red)' : 'var(--primary-blue)'}; height: 100%;"></div>
                      </div>
                    </td>
                    <td><span class="badge badge-completed">${c.status || 'Active'}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#cust-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
    });
  }

  render();
}
