/**
 * GNV COMMODITIES PVT. LTD. — WORKFLOW ACTIVITY & AUDIT LOG MODULE
 */

import { store } from '../store.js';
import { exportToCSV } from '../pdfGenerator.js';

export function renderActivity(container) {
  let filterUser = 'ALL';
  let searchTerm = '';

  function render() {
    const d = store.data;
    let list = [...d.activityLogs];

    if (filterUser !== 'ALL') {
      list = list.filter(a => a.user.includes(filterUser));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a =>
        a.action.toLowerCase().includes(q) ||
        a.recordNumber.toLowerCase().includes(q) ||
        a.gnvNumber.toLowerCase().includes(q) ||
        a.remarks.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Workflow Activity Log</span>
          </div>
          <h1 class="page-title">Operational Audit Trail</h1>
          <div class="page-desc">Chronological compliance log of all order punches, allocations, dispatches, and warehouse state transitions.</div>
        </div>
        <div class="page-actions">
          <button id="btn-export-activity" class="btn btn-outline">
            <i data-lucide="download"></i> Export Audit Log CSV
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-wrap">
            <input type="text" id="act-search" class="table-search-input" placeholder="Search action, order#, GNV#, remarks..." value="${searchTerm}">
          </div>
          <select id="user-filter" class="form-select">
            <option value="ALL">All Users / Actors</option>
            <option value="Deepti Agarwal" ${filterUser === 'Deepti Agarwal' ? 'selected' : ''}>Deepti Agarwal (Operations Head)</option>
          </select>
        </div>
        <div style="font-size: 12px; color: var(--secondary-text);">
          Recorded <strong>${list.length}</strong> activity events
        </div>
      </div>

      <!-- Activity Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operation / Action</th>
                <th>Record Ref</th>
                <th>GNV Group Number</th>
                <th>State Transition</th>
                <th>Actor / User</th>
                <th>Audit Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(act => `
                <tr>
                  <td style="white-space: nowrap; font-size: 12px; color: var(--secondary-text);">
                    ${act.timestamp}
                  </td>
                  <td>
                    <strong style="color: var(--deep-navy);">${act.action}</strong>
                  </td>
                  <td><strong>${act.recordNumber}</strong></td>
                  <td>
                    ${act.gnvNumber && act.gnvNumber !== 'N/A' ? `
                      <span class="gnv-tag" onclick="window.location.hash='#gnv-group/${act.gnvNumber}'">
                        ${act.gnvNumber}
                      </span>
                    ` : '<span style="color:#94A3B8;">-</span>'}
                  </td>
                  <td>
                    <span class="badge badge-draft" style="font-size: 10px;">${act.previousStatus}</span>
                    &rarr;
                    <span class="badge badge-completed" style="font-size: 10px;">${act.newStatus}</span>
                  </td>
                  <td>
                    <span class="badge ${act.user.includes('Deepti') ? 'badge-progress' : 'badge-draft'}">
                      ${act.user}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--secondary-text); max-width: 280px;">
                    ${act.remarks}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#act-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
    });

    container.querySelector('#user-filter').addEventListener('change', (e) => {
      filterUser = e.target.value;
      render();
    });

    container.querySelector('#btn-export-activity').addEventListener('click', () => {
      exportToCSV('GNV_Audit_Activity_Logs.csv', d.activityLogs);
    });
  }

  render();
}
