/**
 * GNV COMMODITIES PVT. LTD. — INVENTORY INWARD MODULE
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderInward(container) {
  function render() {
    const d = store.data;

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Inventory Inward</span>
          </div>
          <h1 class="page-title">Goods Receipt & Batch Registration</h1>
          <div class="page-desc">Inward stock receiving, Quality Inspection (Accepted vs Rejected), and batch onboarding.</div>
        </div>
        <div class="page-actions">
          <button id="btn-new-inward" class="btn btn-primary">
            <i data-lucide="plus-circle"></i>
            <span>Receive New Inward Shipment</span>
          </button>
        </div>
      </div>

      <!-- Inward Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Inward Ref</th>
                <th>Supplier & PO Reference</th>
                <th>Receipt Date</th>
                <th>Receiving Warehouse</th>
                <th>SKU / Product</th>
                <th>Batch Assigned</th>
                <th class="number-cell">Accepted Qty</th>
                <th class="number-cell">Rejected Qty</th>
                <th>Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${d.inwards.map(inw => `
                <tr>
                  <td><strong>${inw.inwardRef}</strong></td>
                  <td>
                    <strong>${inw.supplier}</strong>
                    <br><small style="color: var(--secondary-text);">PO: ${inw.poRef}</small>
                  </td>
                  <td>${inw.receiptDate}</td>
                  <td><strong>${inw.warehouseName}</strong></td>
                  <td>
                    <strong>${inw.productName}</strong>
                    <br><small style="color: var(--secondary-text);">${inw.sku}</small>
                  </td>
                  <td>
                    <code style="font-size: 11px;">${inw.batchNumber}</code>
                    <br><small style="color: var(--secondary-text);">Exp: ${inw.expiryDate}</small>
                  </td>
                  <td class="number-cell" style="font-weight: 700; color: var(--success-green);">
                    ${inw.acceptedQty}
                  </td>
                  <td class="number-cell" style="color: ${inw.rejectedQty > 0 ? 'var(--error-red)' : 'var(--secondary-text)'};">
                    ${inw.rejectedQty}
                  </td>
                  <td><span class="badge badge-completed">${inw.status}</span></td>
                  <td style="text-align: center;">
                    <button class="btn btn-sm btn-ghost" data-print-inward="${inw.id}" title="Print Goods Inward Slip">
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
    container.querySelectorAll('[data-print-inward]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-print-inward');
        const item = d.inwards.find(i => i.id === id);
        if (item) openPrintDocument('INWARD_RECEIPT', item, d.company);
      });
    });

    container.querySelector('#btn-new-inward').addEventListener('click', openNewInwardModal);
  }

  function openNewInwardModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalTitle = document.getElementById('global-modal-title');
    const modalBody = document.getElementById('global-modal-body');
    const modalFooter = document.getElementById('global-modal-footer');

    const d = store.data;

    modalTitle.innerHTML = `<i data-lucide="arrow-down-left" style="color: var(--primary-blue);"></i> Receive New Inward Shipment`;
    modalBody.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Supplier Name <span class="req">*</span></label>
          <input type="text" id="inw-supplier" class="form-control" value="Champion Petfoods International Ltd.">
        </div>
        <div class="form-group">
          <label class="form-label">PO Reference</label>
          <input type="text" id="inw-po" class="form-control" value="PO-GNV-IMP-2026-49">
        </div>
        <div class="form-group">
          <label class="form-label">Receiving Warehouse <span class="req">*</span></label>
          <select id="inw-wh" class="form-control">
            ${d.warehouses.map(w => `<option value="${w.id}">${w.city}: ${w.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Product (SKU) <span class="req">*</span></label>
          <select id="inw-sku" class="form-control">
            ${d.products.map(p => `<option value="${p.sku}">${p.name} (${p.brand})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ordered Qty</label>
          <input type="number" id="inw-qty-ord" class="form-control" value="50">
        </div>
        <div class="form-group">
          <label class="form-label">Accepted Qty <span class="req">*</span></label>
          <input type="number" id="inw-qty-acc" class="form-control" value="50">
        </div>
        <div class="form-group">
          <label class="form-label">Batch Number <span class="req">*</span></label>
          <input type="text" id="inw-batch" class="form-control" value="BN-NEW-${Date.now().toString().slice(-4)}">
        </div>
        <div class="form-group">
          <label class="form-label">Manufacturing Date</label>
          <input type="text" id="inw-mfg" class="form-control" value="01 Sep 2026">
        </div>
        <div class="form-group">
          <label class="form-label">Expiry Date <span class="req">*</span></label>
          <input type="text" id="inw-exp" class="form-control" value="01 Sep 2027">
        </div>
        <div class="form-group">
          <label class="form-label">Inspection Remarks</label>
          <input type="text" id="inw-remarks" class="form-control" value="Sealed outer cartons verified. Approved by QC.">
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="document.getElementById('global-modal-backdrop').classList.remove('open')">Cancel</button>
      <button id="modal-confirm-inward" class="btn btn-primary">Process Inward & Update Stock</button>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalFooter.querySelector('#modal-confirm-inward').addEventListener('click', () => {
      const whId = document.getElementById('inw-wh').value;
      const wh = d.warehouses.find(w => w.id === whId);
      const sku = document.getElementById('inw-sku').value;
      const prod = d.products.find(p => p.sku === sku);
      const accQty = parseInt(document.getElementById('inw-qty-acc').value, 10) || 0;
      const ordQty = parseInt(document.getElementById('inw-qty-ord').value, 10) || accQty;
      const batchNo = document.getElementById('inw-batch').value.trim();
      const expDate = document.getElementById('inw-exp').value.trim();
      const mfgDate = document.getElementById('inw-mfg').value.trim();
      const supplier = document.getElementById('inw-supplier').value.trim();
      const poRef = document.getElementById('inw-po').value.trim();
      const remarks = document.getElementById('inw-remarks').value.trim();

      const newInward = {
        inwardRef: `INW-2026-${String(d.inwards.length + 91).padStart(4, '0')}`,
        supplier,
        poRef,
        supplierInvoice: `INV-SUPP-${Date.now().toString().slice(-4)}`,
        receiptDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        warehouseId: wh.id,
        warehouseName: wh.name,
        sku,
        productName: prod.name,
        orderedQty: ordQty,
        receivedQty: ordQty,
        acceptedQty: accQty,
        rejectedQty: Math.max(0, ordQty - accQty),
        batchNumber: batchNo,
        mfgDate,
        expiryDate: expDate,
        purchaseRate: prod.purchaseRate,
        remarks
      };

      store.processInward(newInward);
      modalBackdrop.classList.remove('open');
      render();
      alert(`Inward ${newInward.inwardRef} received! Batch ${batchNo} has been added to available inventory.`);
    });

    modalBackdrop.classList.add('open');
  }

  render();
}
