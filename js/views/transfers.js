/**
 * GNV COMMODITIES PVT. LTD. — INTER-WAREHOUSE TRANSFERS MODULE
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderTransfers(container) {
  function render() {
    const d = store.data;

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Inventory Transfers</span>
          </div>
          <h1 class="page-title">Inter-Warehouse Stock Transfers</h1>
          <div class="page-desc">Rebalance inventory across Chennai, Mumbai, Noida, and Kolkata hubs with in-transit tracking.</div>
        </div>
        <div class="page-actions">
          <button id="btn-create-transfer" class="btn btn-primary">
            <i data-lucide="send"></i>
            <span>Initiate Stock Transfer</span>
          </button>
        </div>
      </div>

      <!-- Transfers Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Transfer #</th>
                <th>Source Hub</th>
                <th>Destination Hub</th>
                <th>Product & SKU</th>
                <th>Batch # & Expiry</th>
                <th class="number-cell">Transfer Qty</th>
                <th>Transfer Date</th>
                <th>Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${d.transfers.map(trf => `
                <tr>
                  <td><strong>${trf.transferNumber}</strong></td>
                  <td><strong>${trf.sourceWarehouseName}</strong></td>
                  <td><strong>${trf.destWarehouseName}</strong></td>
                  <td>
                    <strong>${trf.productName}</strong>
                    <br><small style="color: var(--secondary-text);">${trf.sku}</small>
                  </td>
                  <td>
                    <code>${trf.batchNumber}</code>
                    <br><small style="color: var(--secondary-text);">Exp: ${trf.expiryDate}</small>
                  </td>
                  <td class="number-cell" style="font-weight: 700; color: var(--primary-blue);">
                    ${trf.transferQty} units
                  </td>
                  <td>${trf.transferDate}</td>
                  <td>
                    <span class="badge ${trf.status === 'Received' ? 'badge-completed' : 'badge-progress'}">
                      ${trf.status}
                    </span>
                  </td>
                  <td style="text-align: center; white-space: nowrap;">
                    ${trf.status === 'In Transit' ? `
                      <button class="btn btn-sm btn-success" data-receive-trf="${trf.id}">
                        <i data-lucide="check"></i> Receive Stock
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-ghost" data-print-trf="${trf.id}" title="Print Transfer Note">
                      <i data-lucide="printer"></i>
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

    // Event listeners
    container.querySelectorAll('[data-print-trf]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-print-trf');
        const trf = d.transfers.find(t => t.id === id);
        if (trf) openPrintDocument('TRANSFER_NOTE', trf, d.company);
      });
    });

    container.querySelectorAll('[data-receive-trf]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-receive-trf');
        store.receiveTransfer(id);
        render();
        alert("Stock received at destination hub! Inventory counts updated.");
      });
    });

    container.querySelector('#btn-create-transfer').addEventListener('click', openCreateTransferModal);
  }

  function openCreateTransferModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalTitle = document.getElementById('global-modal-title');
    const modalBody = document.getElementById('global-modal-body');
    const modalFooter = document.getElementById('global-modal-footer');

    const d = store.data;

    modalTitle.innerHTML = `<i data-lucide="send" style="color: var(--primary-blue);"></i> Initiate Inter-Warehouse Transfer`;
    modalBody.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Source Warehouse <span class="req">*</span></label>
          <select id="trf-src-wh" class="form-control">
            ${d.warehouses.map(w => `<option value="${w.id}">${w.city}: ${w.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Destination Warehouse <span class="req">*</span></label>
          <select id="trf-dest-wh" class="form-control">
            ${d.warehouses.slice().reverse().map(w => `<option value="${w.id}">${w.city}: ${w.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Product SKU <span class="req">*</span></label>
          <select id="trf-sku" class="form-control">
            ${d.products.map(p => `<option value="${p.sku}">${p.name} (${p.brand})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Transfer Quantity (Units) <span class="req">*</span></label>
          <input type="number" id="trf-qty" class="form-control" value="10" min="1">
        </div>
        <div class="form-group form-col-full">
          <label class="form-label">Logistics Dispatch Remarks</label>
          <input type="text" id="trf-remarks" class="form-control" value="Stock rebalancing via VRL Logistics">
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="document.getElementById('global-modal-backdrop').classList.remove('open')">Cancel</button>
      <button id="modal-confirm-transfer" class="btn btn-primary">Dispatch Transfer</button>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalFooter.querySelector('#modal-confirm-transfer').addEventListener('click', () => {
      const srcId = document.getElementById('trf-src-wh').value;
      const destId = document.getElementById('trf-dest-wh').value;
      if (srcId === destId) {
        alert("Source and destination warehouses cannot be the same.");
        return;
      }

      const srcWh = d.warehouses.find(w => w.id === srcId);
      const destWh = d.warehouses.find(w => w.id === destId);
      const sku = document.getElementById('trf-sku').value;
      const prod = d.products.find(p => p.sku === sku);
      const qty = parseInt(document.getElementById('trf-qty').value, 10) || 5;
      const remarks = document.getElementById('trf-remarks').value;

      // Suggest FEFO batch from source
      const batches = store.getBatchesForProduct(sku, srcWh.city);
      const chosenBatch = batches.find(b => b.availableQty >= qty) || batches[0] || {
        batchNumber: `BN-SRC-${Date.now().toString().slice(-4)}`,
        expiryDate: "15 Jul 2027"
      };

      const newTrf = {
        sourceWarehouseId: srcWh.id,
        sourceWarehouseName: srcWh.name,
        destWarehouseId: destWh.id,
        destWarehouseName: destWh.name,
        sku,
        productName: prod.name,
        batchNumber: chosenBatch.batchNumber,
        expiryDate: chosenBatch.expiryDate,
        transferQty: qty,
        dispatchedQty: qty,
        receivedQty: 0,
        discrepancy: 0,
        transferDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        deliveryDate: "18 Oct 2026",
        remarks
      };

      store.createTransfer(newTrf);
      modalBackdrop.classList.remove('open');
      render();
      alert(`Transfer ${newTrf.transferNumber} dispatched! In transit to ${destWh.name}.`);
    });

    modalBackdrop.classList.add('open');
  }

  render();
}
