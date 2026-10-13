/**
 * GNV COMMODITIES PVT. LTD. — GNV MASTER ORDER GROUP VIEW
 * Grouped view displaying parent sales order + all child orders + Balance SSO
 * linked under the same master GNV Number.
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderGnvGroupView(container, gnvNumber = "GNV-2026-000001") {
  const d = store.data;

  // Find parent order
  const parentOrder = d.salesOrders.find(o => o.gnvNumber === gnvNumber);
  
  // Find all child orders sharing this GNV Number
  const childOrders = d.childSalesOrders.filter(c => c.gnvNumber === gnvNumber);

  if (!parentOrder && childOrders.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center;">
        <h3>No records found for GNV Identifier: ${gnvNumber}</h3>
        <button class="btn btn-primary" onclick="window.location.hash='#sales-orders'" style="margin-top: 14px;">
          Return to Sales Orders
        </button>
      </div>
    `;
    return;
  }

  const orderValue = parentOrder ? parentOrder.grandTotal : childOrders.reduce((a, b) => a + b.amount, 0);
  const orderedQty = parentOrder ? parentOrder.totalQty : childOrders.reduce((a, b) => a + b.allocatedQty, 0);
  const allocatedQty = childOrders.filter(c => !c.isBalanceSSO).reduce((a, b) => a + b.allocatedQty, 0);
  const balanceSSOOrder = childOrders.find(c => c.isBalanceSSO);
  const balanceSSOQty = balanceSSOOrder ? balanceSSOOrder.allocatedQty : Math.max(0, orderedQty - allocatedQty);

  const customerName = parentOrder ? parentOrder.customerName : childOrders[0].customerName;
  const orderDate = parentOrder ? parentOrder.orderDate : childOrders[0].orderDate;

  container.innerHTML = `
    <div class="page-top-bar">
      <div>
        <div class="breadcrumbs">
          <span class="breadcrumb-item">GNV Commodities</span>
          <span>/</span>
          <span class="breadcrumb-item">GNV Order Group System</span>
          <span>/</span>
          <span class="breadcrumb-current">${gnvNumber}</span>
        </div>
        <h1 class="page-title">Master Order Group: ${gnvNumber}</h1>
        <div class="page-desc">Complete multi-warehouse fulfilment tree for customer order <strong>${parentOrder ? parentOrder.soNumber : 'N/A'}</strong>.</div>
      </div>
      <div class="page-actions">
        ${parentOrder ? `
          <button class="btn btn-outline" id="btn-print-parent-so">
            <i data-lucide="printer"></i>
            <span>Print Parent Order</span>
          </button>
          <button class="btn btn-primary" onclick="window.location.hash='#allocation/${parentOrder.id}'">
            <i data-lucide="layers"></i>
            <span>Re-Allocate Stock</span>
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Instruction Panel -->
    <div class="instruction-panel">
      <div class="instruction-content">
        <div class="instruction-icon"><i data-lucide="network"></i></div>
        <div>
          <div class="instruction-title">GNV Master Grouping Architecture</div>
          <div class="instruction-text">
            All warehouse orders and the unassigned <strong>Balance SSO</strong> below belong to the single original customer order. They share <code>${gnvNumber}</code> across all invoices, packaging slips, and logistics tracking notes.
          </div>
        </div>
      </div>
    </div>

    <!-- Overview KPI Grid -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); margin-bottom: 20px;">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">Parent Sales Order</span>
          <div class="kpi-icon-wrap kpi-icon-blue"><i data-lucide="file-text"></i></div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">${parentOrder ? parentOrder.soNumber : 'SO-10025'}</div>
        <div class="kpi-subtext">Original Customer PO</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">Original Ordered Qty</span>
          <div class="kpi-icon-wrap kpi-icon-blue"><i data-lucide="shopping-cart"></i></div>
        </div>
        <div class="kpi-value">${orderedQty} <span style="font-size: 13px; font-weight: normal;">units</span></div>
        <div class="kpi-subtext">Customer request</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">Allocated to Warehouses</span>
          <div class="kpi-icon-wrap kpi-icon-green"><i data-lucide="check-circle-2"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--success-green);">${allocatedQty} <span style="font-size: 13px; font-weight: normal;">units</span></div>
        <div class="kpi-subtext">Active child orders</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">Balance SSO Qty</span>
          <div class="kpi-icon-wrap kpi-icon-amber"><i data-lucide="clock"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--warning-amber);">${balanceSSOQty} <span style="font-size: 13px; font-weight: normal;">units</span></div>
        <div class="kpi-subtext">Awaiting inward stock</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">Total Group Value</span>
          <div class="kpi-icon-wrap kpi-icon-cyan"><i data-lucide="dollar-sign"></i></div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">₹${Math.round(orderValue).toLocaleString('en-IN')}</div>
        <div class="kpi-subtext">Inclusive of GST</div>
      </div>
    </div>

    <!-- Fulfilment Pipeline Bar -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i data-lucide="activity"></i> Group Fulfilment Lifecycle Status</div>
        <span class="badge ${balanceSSOQty > 0 ? 'badge-partial' : 'badge-completed'}">
          ${balanceSSOQty > 0 ? 'Partially Fulfilled' : 'Fully Allocated'}
        </span>
      </div>
      <div class="card-body">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; overflow-x: auto; padding: 10px 0;">
          <div style="text-align: center; flex: 1; padding: 10px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px;">
            <i data-lucide="file-check" style="color: #10B981; margin-bottom: 4px;"></i>
            <div style="font-size: 12px; font-weight: 700; color: #065F46;">Order Placed</div>
            <div style="font-size: 11px; color: #047857;">${orderDate}</div>
          </div>
          <i data-lucide="arrow-right" style="color: var(--secondary-text);"></i>

          <div style="text-align: center; flex: 1; padding: 10px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px;">
            <i data-lucide="git-merge" style="color: #10B981; margin-bottom: 4px;"></i>
            <div style="font-size: 12px; font-weight: 700; color: #065F46;">Allocated (${allocatedQty}/${orderedQty})</div>
            <div style="font-size: 11px; color: #047857;">4 Regional Hubs</div>
          </div>
          <i data-lucide="arrow-right" style="color: var(--secondary-text);"></i>

          <div style="text-align: center; flex: 1; padding: 10px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;">
            <i data-lucide="file-text" style="color: var(--primary-blue); margin-bottom: 4px;"></i>
            <div style="font-size: 12px; font-weight: 700; color: #1E40AF;">Invoices In-Progress</div>
            <div style="font-size: 11px; color: #1E40AF;">GST Ready</div>
          </div>
          <i data-lucide="arrow-right" style="color: var(--secondary-text);"></i>

          <div style="text-align: center; flex: 1; padding: 10px; background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px;">
            <i data-lucide="package" style="color: var(--secondary-text); margin-bottom: 4px;"></i>
            <div style="font-size: 12px; font-weight: 700; color: var(--secondary-text);">Packaging & Dispatch</div>
            <div style="font-size: 11px; color: var(--secondary-text);">Pending Invoices</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Linked Child Orders Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="git-branch"></i> All Child Sales Orders under ${gnvNumber} (${childOrders.length} records)
        </div>
        <span class="badge badge-completed">FEFO Verified</span>
      </div>
      <div class="table-responsive">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Child SO Number</th>
              <th>Assigned Warehouse</th>
              <th class="number-cell">Allocated Qty</th>
              <th class="number-cell">Pro-Rata Amount</th>
              <th>Batch Details</th>
              <th>Order Status</th>
              <th>Invoice Status</th>
              <th>Shipment Status</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${childOrders.map(c => `
              <tr style="${c.isBalanceSSO ? 'background-color: #FFFDF5;' : ''}">
                <td>
                  <strong>${c.soNumber}</strong>
                  ${c.isBalanceSSO ? '<br><span class="badge badge-pending">Balance SSO</span>' : ''}
                </td>
                <td>
                  <strong>${c.warehouseName || 'None (Unassigned)'}</strong>
                  <br><small style="color: var(--secondary-text);">${c.warehouseCity}</small>
                </td>
                <td class="number-cell" style="font-weight: 700; color: var(--deep-navy);">
                  ${c.allocatedQty} units
                </td>
                <td class="number-cell">
                  ₹${Math.round(c.amount).toLocaleString('en-IN')}
                </td>
                <td style="font-size: 11.5px; color: var(--secondary-text);">
                  ${c.batchDetails}
                </td>
                <td>
                  <span class="badge ${c.isBalanceSSO ? 'badge-draft' : 'badge-completed'}">
                    ${c.status}
                  </span>
                </td>
                <td>
                  <span class="badge ${c.invoiceStatus === 'Invoice Created' ? 'badge-progress' : 'badge-draft'}">
                    ${c.invoiceStatus}
                  </span>
                </td>
                <td>
                  <span class="badge ${c.shipmentStatus === 'Delivered' ? 'badge-delivered' : 'badge-draft'}">
                    ${c.shipmentStatus}
                  </span>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  ${!c.isBalanceSSO ? `
                    <button class="btn btn-sm btn-outline-primary" data-inv-btn="${c.id}">
                      <i data-lucide="file-text"></i> Invoice
                    </button>
                  ` : `
                    <button class="btn btn-sm btn-outline" onclick="window.location.hash='#inward'">
                      <i data-lucide="arrow-down-left"></i> Receive Stock
                    </button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Print parent order
  const printBtn = container.querySelector('#btn-print-parent-so');
  if (printBtn && parentOrder) {
    printBtn.addEventListener('click', () => {
      openPrintDocument('SALES_ORDER', parentOrder, d.company);
    });
  }

  // Invoice button on child rows
  container.querySelectorAll('[data-inv-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-inv-btn');
      const inv = store.createInvoice(id);
      if (inv) {
        alert(`Tax Invoice ${inv.invoiceNumber} created!`);
        renderGnvGroupView(container, gnvNumber);
      }
    });
  });
}
