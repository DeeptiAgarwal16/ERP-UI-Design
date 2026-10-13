/**
 * GNV COMMODITIES PVT. LTD. — SALES ORDERS MODULE
 * Split Master-Detail layout with in-page PDF/Document Preview & Edit Mode
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderSalesOrders(container, param = null) {
  const d = store.data;

  // Edit / New Form
  if (param === 'new' || (param && param.startsWith('edit-'))) {
    renderEditOrderForm(container, param === 'new' ? null : param.replace('edit-', ''));
    return;
  }

  // Split Master-Detail View
  renderMasterDetailView(container, param ? param.replace('view-', '') : null);
}

// Split Master-Detail View
function renderMasterDetailView(container, selectedSoNumber = null) {
  const d = store.data;
  let selectedOrder = selectedSoNumber
    ? d.salesOrders.find(s => s.soNumber === selectedSoNumber || s.id === selectedSoNumber)
    : d.salesOrders[0];

  if (!selectedOrder) selectedOrder = d.salesOrders[0];

  let showPdfView = true; // Default to true as user requested in-page preview!
  let searchTerm = '';

  function render() {
    let filteredOrders = d.salesOrders.filter(so =>
      so.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    container.innerHTML = `
      <div class="split-view-container">
        
        <!-- Left List Column -->
        <div class="split-list-pane">
          <div class="split-list-header">
            <div class="split-list-title">All Sales Orders (${d.salesOrders.length})</div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#sales-orders/new'">
              <i data-lucide="plus"></i> New
            </button>
          </div>

          <div class="split-list-search">
            <input type="text" id="so-search-box" class="split-search-input" placeholder="Search orders..." value="${searchTerm}">
          </div>

          <div class="split-list-body">
            ${filteredOrders.map(so => `
              <div class="split-item-row ${so.soNumber === selectedOrder.soNumber ? 'active' : ''}" data-so="${so.soNumber}">
                <div class="split-item-top">
                  <span class="split-item-customer">${so.customerName}</span>
                  <span class="split-item-amount">₹${Number(so.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="split-item-meta">
                  <span>${so.soNumber} &bull; ${so.orderDate}</span>
                  <span class="badge ${so.overallStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-draft'}">
                    ${so.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Preview Column -->
        <div class="split-detail-pane">
          <div class="detail-top-toolbar">
            <div class="detail-left-actions">
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#sales-orders/edit-${encodeURIComponent(selectedOrder.soNumber)}'">
                <i data-lucide="edit"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm" id="btn-so-pdf-print">
                <i data-lucide="printer"></i> PDF / Print
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='#invoices/new-from-so/${encodeURIComponent(selectedOrder.soNumber)}'">
                <i data-lucide="file-text"></i> Convert to Invoice
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#packages/new-from-so/${encodeURIComponent(selectedOrder.soNumber)}'">
                <i data-lucide="box"></i> Create Package
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#allocation/${encodeURIComponent(selectedOrder.id)}'">
                <i data-lucide="layers"></i> Allocation
              </button>
            </div>

            <div class="detail-right-toggle">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" id="toggle-pdf-view" ${showPdfView ? 'checked' : ''}>
                <span>Show PDF Document View</span>
              </label>
            </div>
          </div>

          <div class="detail-scroll-area">
            ${showPdfView ? renderPaperSheetPreview(selectedOrder, d.company) : renderStandardOverview(selectedOrder)}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Bind left list selection
    container.querySelectorAll('.split-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const soNum = row.getAttribute('data-so');
        selectedOrder = d.salesOrders.find(s => s.soNumber === soNum) || selectedOrder;
        render();
      });
    });

    // Search filter
    container.querySelector('#so-search-box')?.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
    });

    // Toggle PDF view
    container.querySelector('#toggle-pdf-view')?.addEventListener('change', (e) => {
      showPdfView = e.target.checked;
      render();
    });

    // Print
    container.querySelector('#btn-so-pdf-print')?.addEventListener('click', () => {
      openPrintDocument('SALES_ORDER', selectedOrder, d.company);
    });
  }

  render();
}

// Rendered Paper Document Preview Sheet (Real PDF style matching screenshot 142428)
function renderPaperSheetPreview(order, company) {
  const items = order.items || [];

  return `
    <div class="document-paper-sheet">
      <div class="paper-header">
        <div>
          <div class="gnv-logo-badge" style="margin-bottom: 8px;">
            <div class="gnv-letter letter-g" style="width: 28px; height: 28px; font-size: 15px;">G</div>
            <div class="gnv-letter letter-n" style="width: 28px; height: 28px; font-size: 15px;">N</div>
            <div class="gnv-letter letter-v" style="width: 28px; height: 28px; font-size: 15px;">V</div>
          </div>
          <div style="font-weight: 800; font-size: 14px; color: #1E293B;">${company.legalName}</div>
          <div class="paper-company-details">
            ${company.address}, ${company.city} - ${company.pinCode}, Tamil Nadu, India<br>
            <strong>GSTIN:</strong> ${company.gstin} | <strong>PAN:</strong> ${company.pan}
          </div>
        </div>
        <div>
          <div class="paper-doc-title">SALES ORDER</div>
          <div class="paper-doc-subtitle">Sales Order# <strong>${order.soNumber}</strong></div>
          <div style="margin-top: 6px; text-align: right;">
            <span class="gnv-tag" onclick="window.location.hash='#gnv-group/${order.gnvNumber}'">GNV: ${order.gnvNumber}</span>
          </div>
        </div>
      </div>

      <div class="paper-info-grid">
        <div>
          <div class="paper-section-title">BILLING ADDRESS</div>
          <div class="paper-customer-name">${order.customerName}</div>
          <div style="font-size: 12px; line-height: 1.5; margin-top: 3px; color: #374151;">
            ${order.billingAddress || order.city + ', ' + (order.state || '') + ' - ' + (order.pinCode || '')}
          </div>
          <div style="font-size: 11.5px; color: #6B7280; margin-top: 4px;">
            Customer PO: <strong>${order.customerPO || 'N/A'}</strong>
          </div>
        </div>

        <div>
          <div class="paper-section-title">ORDER INFORMATION</div>
          <div style="font-size: 12px; line-height: 1.8;">
            Order Date: <strong>${order.orderDate}</strong><br>
            Dispatch Warehouse: <strong style="color: var(--primary-blue);">${order.warehouseLocation || 'Noida'}</strong><br>
            Payment Terms: <strong>${order.paymentTerms || 'PostPaid 30D'}</strong><br>
            Status: <span class="badge badge-confirmed">${order.overallStatus.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <table class="paper-table">
        <thead>
          <tr>
            <th style="width: 25px;">#</th>
            <th>Item & Description</th>
            <th>Location</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">MRP</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Tax</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <strong style="color: #111827;">${it.name}</strong>
                <br><small style="color: #6B7280;">SKU: ${it.sku} ${it.weight ? '| ' + it.weight : ''}</small>
              </td>
              <td>${it.location || order.warehouseLocation || 'Noida'}</td>
              <td class="text-right"><strong>${it.orderedQty || it.qty}</strong> Nos.</td>
              <td class="text-right">₹${Number(it.unitRate || it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td class="text-right">₹${Number(it.mrp || it.unitRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td class="text-right" style="color: var(--success-green); font-weight: 700;">${it.discountPct || 0}%</td>
              <td class="text-right">${it.taxRate}%</td>
              <td class="text-right" style="font-weight: 700;">₹${Number(it.lineTotal || it.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table class="paper-totals-box">
        <tr>
          <td>Sub Total:</td>
          <td class="text-right">₹${Number(order.subtotal || order.taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Total Discount:</td>
          <td class="text-right" style="color: var(--success-green);">- ₹${Number(order.discountTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Taxable Amount:</td>
          <td class="text-right">₹${Number(order.taxableAmount || order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Tax (IGST/GST):</td>
          <td class="text-right">₹${Number((order.igst || 0) + (order.cgst || 0) + (order.sgst || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        ${order.roundOff ? `<tr><td>Round Off:</td><td class="text-right">₹${order.roundOff}</td></tr>` : ''}
        <tr class="paper-grand-total">
          <td>Total Amount:</td>
          <td class="text-right">₹${Number(order.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>

      <div style="font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; display: flex; justify-content: space-between;">
        <span>GNV Commodities ERP &bull; Authorized by Deepti Agarwal (Software Developer)</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;
}

// Standard table overview
function renderStandardOverview(order) {
  return `
    <div style="background: #fff; border: 1px solid var(--border-color); border-radius: 6px; padding: 24px; width: 100%; max-width: 820px;">
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">${order.soNumber} Overview</h3>
      <table class="item-edit-table">
        <thead>
          <tr>
            <th>ITEM</th>
            <th>QTY</th>
            <th>RATE</th>
            <th>DISCOUNT</th>
            <th class="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(it => `
            <tr>
              <td><strong>${it.name}</strong><br><small>${it.sku}</small></td>
              <td>${it.orderedQty || it.qty} Nos.</td>
              <td>₹${it.unitRate || it.rate}</td>
              <td style="color: var(--success-green); font-weight: 700;">${it.discountPct}%</td>
              <td class="text-right" style="font-weight: 700;">₹${Number(it.lineTotal || it.amount).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Edit / New Form with Modern Containers & Live Quantity/Row Editing
function renderEditOrderForm(container, existingSoNumber = null) {
  const d = store.data;
  let order = existingSoNumber
    ? JSON.parse(JSON.stringify(d.salesOrders.find(s => s.soNumber === existingSoNumber || s.id === existingSoNumber) || d.salesOrders[0]))
    : null;

  const isEdit = !!order;
  let selectedCustomerId = isEdit ? order.customerId : d.customers[0].id;
  let selectedWarehouse = isEdit ? (order.warehouseLocation || 'Noida') : 'Noida';
  // Ensure warehouse is one of the 4 hubs
  if (!['Chennai', 'Mumbai', 'Kolkata', 'Noida'].includes(selectedWarehouse)) {
    selectedWarehouse = 'Noida';
  }
  let soNumberVal = isEdit ? order.soNumber : `SON/26-27-${4570 + d.salesOrders.length}`;
  let poVal = isEdit ? (order.customerPO || '') : '';
  let paymentTermsVal = isEdit ? (order.paymentTerms || 'PostPaid 30D') : 'PostPaid 30D';
  let dateVal = isEdit ? order.orderDate : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Normalized rows array
  let rows = isEdit && order.items && order.items.length > 0
    ? order.items.map(it => {
        const prod = d.products.find(p => p.sku === it.sku) || d.products[0];
        const qty = Number(it.qty || it.orderedQty || 1);
        const rate = Number(it.rate || it.unitRate || prod.sellingRate || 1000);
        const disc = Number(it.discountPct !== undefined ? it.discountPct : (prod.defaultDiscount || 20.0));
        const taxRate = Number(it.taxRate || prod.taxRate || 18);
        const gross = qty * rate;
        const discAmt = (gross * disc) / 100;
        const taxable = gross - discAmt;
        const taxAmt = (taxable * taxRate) / 100;
        const amount = Math.round(taxable + taxAmt);
        return {
          sku: it.sku || prod.sku,
          name: it.name || prod.name,
          weight: it.weight || prod.weight,
          expiryDate: it.expiryDate || "15-10-2027",
          qty,
          rate,
          mrp: Number(it.mrp || prod.mrp || rate),
          discountPct: disc,
          taxRate,
          amount
        };
      })
    : [
        {
          sku: d.products[0].sku,
          name: d.products[0].name,
          weight: d.products[0].weight,
          expiryDate: "15-10-2027",
          qty: 1,
          rate: d.products[0].sellingRate,
          mrp: d.products[0].mrp,
          discountPct: d.products[0].defaultDiscount || 23.0,
          taxRate: d.products[0].taxRate,
          amount: Math.round(d.products[0].sellingRate * (1 - (d.products[0].defaultDiscount || 23.0) / 100) * 1.18)
        }
      ];

  function recalculateTotals() {
    let subtotal = 0;
    let discountTotal = 0;
    let taxableTotal = 0;
    let taxTotal = 0;

    rows.forEach(r => {
      if (!r.sku) {
        r.amount = 0;
        return;
      }
      const gross = (r.rate || 0) * (r.qty || 1);
      const discAmt = (gross * (r.discountPct || 0)) / 100;
      const taxable = Math.max(0, gross - discAmt);
      const taxAmt = (taxable * (r.taxRate || 18)) / 100;
      r.amount = Math.round(taxable + taxAmt);
      r.discountAmount = discAmt;
      r.taxableAmount = taxable;
      r.taxAmount = taxAmt;

      subtotal += gross;
      discountTotal += discAmt;
      taxableTotal += taxable;
      taxTotal += taxAmt;
    });

    const grandTotal = Math.round(taxableTotal + taxTotal);
    return { subtotal, discountTotal, taxableTotal, taxTotal, grandTotal };
  }

  function updateDomTotals() {
    const calcs = recalculateTotals();

    // Update row amount cells without redrawing inputs
    rows.forEach((r, idx) => {
      const cell = container.querySelector(`.row-amount-cell[data-row="${idx}"]`);
      if (cell) {
        cell.textContent = `₹${r.amount.toLocaleString('en-IN')}`;
      }
    });

    // Update summary table
    const elSub = container.querySelector('#summary-subtotal');
    const elDisc = container.querySelector('#summary-discount');
    const elTaxable = container.querySelector('#summary-taxable');
    const elTax = container.querySelector('#summary-tax');
    const elGrand = container.querySelector('#summary-grandtotal');

    if (elSub) elSub.textContent = `₹${Math.round(calcs.subtotal).toLocaleString('en-IN')}`;
    if (elDisc) elDisc.textContent = `- ₹${Math.round(calcs.discountTotal).toLocaleString('en-IN')}`;
    if (elTaxable) elTaxable.textContent = `₹${Math.round(calcs.taxableTotal).toLocaleString('en-IN')}`;
    if (elTax) elTax.textContent = `₹${Math.round(calcs.taxTotal).toLocaleString('en-IN')}`;
    if (elGrand) elGrand.textContent = `₹${calcs.grandTotal.toLocaleString('en-IN')}`;
  }

  function renderPage() {
    const calcs = recalculateTotals();
    const cust = d.customers.find(c => c.id === selectedCustomerId) || d.customers[0];

    container.innerHTML = `
      <div class="form-page-container">
        
        <!-- Header Bar -->
        <div class="form-header-bar">
          <div class="form-title">
            <i data-lucide="shopping-cart" style="color: var(--primary-blue);"></i>
            <span>${isEdit ? 'Edit Sales Order — ' + soNumberVal : 'Create New Sales Order'}</span>
          </div>
          <button class="btn btn-ghost" onclick="window.location.hash='#sales-orders'">
            <i data-lucide="x"></i>
          </button>
        </div>

        <!-- Section Card 1: Customer & Logistic Information -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="user" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div class="form-section-title">Customer & Warehouse Routing</div>
              <div class="form-section-subtitle">Specify customer account entity and origin fulfillment warehouse</div>
            </div>
          </div>

          <div class="form-grid-row">
            <div class="form-field">
              <label class="form-field-label">Customer Name <span class="req">*</span></label>
              <select id="so-cust-select" class="form-select">
                ${d.customers.map(c => `
                  <option value="${c.id}" ${c.id === selectedCustomerId ? 'selected' : ''}>
                    ${c.name} (${c.city}, ${c.state})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-field">
              <label class="form-field-label">Origin Warehouse <span class="req">*</span></label>
              <select id="so-wh-select" class="form-select">
                ${d.warehouses.map(w => `
                  <option value="${w.name}" ${w.name === selectedWarehouse ? 'selected' : ''}>
                    ${w.displayName || w.name + ' Warehouse'} (${w.city})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-field">
              <label class="form-field-label">Sales Order# <span class="req">*</span></label>
              <input type="text" id="so-num-input" class="form-input" value="${soNumberVal}" readonly style="background: #F8FAFC; font-weight: 700; color: var(--primary-blue);">
            </div>

            <div class="form-field">
              <label class="form-field-label">Customer PO#</label>
              <input type="text" id="so-po-input" class="form-input" value="${poVal}" placeholder="e.g. PO-8891">
            </div>

            <div class="form-field">
              <label class="form-field-label">Sales Order Date <span class="req">*</span></label>
              <input type="text" id="so-date-input" class="form-input" value="${dateVal}">
            </div>

            <div class="form-field">
              <label class="form-field-label">Payment Terms</label>
              <select id="so-terms-select" class="form-select">
                <option value="PostPaid 30D" ${paymentTermsVal === 'PostPaid 30D' ? 'selected' : ''}>PostPaid 30D</option>
                <option value="PostPaid 15D" ${paymentTermsVal === 'PostPaid 15D' ? 'selected' : ''}>PostPaid 15D</option>
                <option value="PrePaid 0D" ${paymentTermsVal === 'PrePaid 0D' ? 'selected' : ''}>PrePaid 0D</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section Card 2: Line Items Specifications -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="package" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1;">
              <div class="form-section-title">Item Specifications & Quantities</div>
              <div class="form-section-subtitle">Add pet nutrition items, update quantities, rates and default distributor discounts</div>
            </div>
            <button type="button" id="btn-add-line-item" class="btn-add-line-row">
              <i data-lucide="plus" style="width: 15px; height: 15px;"></i> Add Line Item
            </button>
          </div>

          <!-- Items Table Container -->
          <div class="item-edit-table-container">
            <table class="item-edit-table">
              <thead>
                <tr>
                  <th style="width: 34%;">ITEM DETAILS & PACK SIZE</th>
                  <th style="width: 13%;">BATCH EXPIRY</th>
                  <th style="width: 11%;">QUANTITY</th>
                  <th style="width: 13%;">UNIT RATE (₹)</th>
                  <th style="width: 12%;">DISCOUNT (%)</th>
                  <th style="width: 7%;">TAX</th>
                  <th style="width: 10%; text-align: right;">AMOUNT (₹)</th>
                  <th style="width: 30px;"></th>
                </tr>
              </thead>
              <tbody id="so-items-table-body">
                ${renderItemRowsHtml()}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" id="btn-add-line-item-bottom" class="btn-add-line-row">
              <i data-lucide="plus" style="width: 15px; height: 15px;"></i> Add Another Item
            </button>
            <span style="font-size: 11.5px; color: #64748B;">
              Tip: Changing quantity or discount updates row amounts and order summary live.
            </span>
          </div>
        </div>

        <!-- Section Card 3: Financial Summary & Actions -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="calculator" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div class="form-section-title">Financial Summary & Taxes</div>
              <div class="form-section-subtitle">Tax calculations according to GST laws and trade discounts</div>
            </div>
          </div>

          <div class="form-summary-wrapper">
            <table class="form-summary-table">
              <tr>
                <td>Sub Total:</td>
                <td id="summary-subtotal" class="text-right" style="font-weight: 600;">₹${Math.round(calcs.subtotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Total Trade Discount:</td>
                <td id="summary-discount" class="text-right" style="color: var(--pet-emerald); font-weight: 700;">- ₹${Math.round(calcs.discountTotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Taxable Amount:</td>
                <td id="summary-taxable" class="text-right" style="font-weight: 600;">₹${Math.round(calcs.taxableTotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Total GST (18%):</td>
                <td id="summary-tax" class="text-right" style="font-weight: 600;">₹${Math.round(calcs.taxTotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="summary-total-row">
                <td style="font-weight: 800;">Grand Total ( ₹ ):</td>
                <td id="summary-grandtotal" class="text-right" style="font-weight: 800; font-size: 16px; color: var(--primary-blue);">₹${calcs.grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Sticky Bottom Actions -->
        <div class="form-bottom-actions">
          <button class="btn btn-ghost" onclick="window.location.hash='#sales-orders'">
            Cancel
          </button>
          <button id="btn-save-so" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
            <i data-lucide="check"></i> Save Sales Order
          </button>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    attachEventListeners();
  }

  function renderItemRowsHtml() {
    return rows.map((row, idx) => `
      <tr data-row-tr="${idx}">
        <td>
          <select class="form-select row-item-select" data-row="${idx}">
            <option value="">${row.sku ? `${row.name}` : 'Select an item...'}</option>
            ${d.products.map(p => `
              <option value="${p.sku}" ${p.sku === row.sku ? 'selected' : ''}>
                ${p.name} (${p.weight}) — ₹${p.sellingRate}
              </option>
            `).join('')}
          </select>
        </td>
        <td>
          <input type="text" class="item-input row-exp" data-row="${idx}" value="${row.expiryDate || '15-10-2027'}">
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 4px;">
            <input type="number" min="1" class="item-input row-qty" data-row="${idx}" value="${row.qty || 1}" style="font-weight: 700; text-align: center;">
          </div>
        </td>
        <td>
          <input type="number" min="0" class="item-input row-rate" data-row="${idx}" value="${row.rate || 0}">
        </td>
        <td>
          <input type="number" min="0" max="100" step="0.5" class="item-input row-disc" data-row="${idx}" value="${row.discountPct || 0}">
        </td>
        <td>
          <span style="font-size: 11.5px; font-weight: 600; color: #475569;">GST ${row.taxRate || 18}%</span>
        </td>
        <td class="row-amount-cell text-right" data-row="${idx}" style="font-weight: 800; color: #0F172A;">
          ₹${row.amount.toLocaleString('en-IN')}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn btn-sm btn-ghost row-del-btn" data-row="${idx}" title="Delete this line item" style="color: var(--danger-red); padding: 4px;">
            <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  function attachEventListeners() {
    // Customer Change
    container.querySelector('#so-cust-select')?.addEventListener('change', (e) => {
      selectedCustomerId = e.target.value;
    });

    // Warehouse Change
    container.querySelector('#so-wh-select')?.addEventListener('change', (e) => {
      selectedWarehouse = e.target.value;
    });

    // PO and Date changes
    container.querySelector('#so-po-input')?.addEventListener('input', (e) => {
      poVal = e.target.value;
    });

    container.querySelector('#so-date-input')?.addEventListener('input', (e) => {
      dateVal = e.target.value;
    });

    container.querySelector('#so-terms-select')?.addEventListener('change', (e) => {
      paymentTermsVal = e.target.value;
    });

    // Add Line Item Buttons
    const handleAddLineItem = () => {
      rows.push({
        sku: d.products[0].sku,
        name: d.products[0].name,
        weight: d.products[0].weight,
        expiryDate: "15-10-2027",
        qty: 1,
        rate: d.products[0].sellingRate,
        mrp: d.products[0].mrp,
        discountPct: d.products[0].defaultDiscount || 23.0,
        taxRate: d.products[0].taxRate,
        amount: Math.round(d.products[0].sellingRate * (1 - (d.products[0].defaultDiscount || 23.0) / 100) * 1.18)
      });
      refreshItemsTable();
    };

    container.querySelector('#btn-add-line-item')?.addEventListener('click', handleAddLineItem);
    container.querySelector('#btn-add-line-item-bottom')?.addEventListener('click', handleAddLineItem);

    // Live Row Listeners
    attachRowListeners();

    // Save Button
    container.querySelector('#btn-save-so')?.addEventListener('click', () => {
      const validItems = rows.filter(r => r.sku);
      if (validItems.length === 0) {
        alert("Please specify at least one product item.");
        return;
      }

      const cust = d.customers.find(c => c.id === selectedCustomerId) || d.customers[0];
      const calcs = recalculateTotals();

      const orderData = {
        id: soNumberVal,
        soNumber: soNumberVal,
        gnvNumber: isEdit ? order.gnvNumber : `GNV-2026-${String(d.salesOrders.length + 1).padStart(6, '0')}`,
        orderDate: dateVal,
        expectedDispatchDate: dateVal,
        customerId: cust.id,
        customerName: cust.name,
        customerCode: cust.code,
        city: cust.city,
        state: cust.state,
        pinCode: cust.pinCode,
        billingAddress: cust.billingAddress,
        shippingAddress: cust.shippingAddress,
        customerPO: poVal,
        paymentTerms: paymentTermsVal,
        warehouseLocation: selectedWarehouse,
        items: validItems.map(it => ({
          sku: it.sku,
          name: it.name,
          weight: it.weight,
          orderedQty: it.qty,
          qty: it.qty,
          unitRate: it.rate,
          rate: it.rate,
          mrp: it.mrp,
          discountPct: it.discountPct,
          discountAmount: it.discountAmount,
          taxableAmount: it.taxableAmount,
          taxRate: it.taxRate,
          lineTotal: it.amount,
          location: selectedWarehouse,
          status: "Confirmed"
        })),
        totalQty: validItems.reduce((acc, curr) => acc + curr.qty, 0),
        subtotal: calcs.subtotal,
        discountTotal: calcs.discountTotal,
        taxableAmount: calcs.taxableTotal,
        igst: calcs.taxTotal,
        grandTotal: calcs.grandTotal,
        overallStatus: "Confirmed",
        allocationStatus: "Pending Allocation",
        invoiceStatus: "Invoice Pending"
      };

      store.saveSalesOrder(orderData);
      store.addToast(`Sales Order ${soNumberVal} saved successfully!`);
      window.location.hash = `#sales-orders/view-${encodeURIComponent(soNumberVal)}`;
    });
  }

  function refreshItemsTable() {
    const tbody = container.querySelector('#so-items-table-body');
    if (tbody) {
      tbody.innerHTML = renderItemRowsHtml();
      if (window.lucide) window.lucide.createIcons();
      attachRowListeners();
      updateDomTotals();
    }
  }

  function attachRowListeners() {
    // Select Product
    container.querySelectorAll('.row-item-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        const sku = e.target.value;
        const prod = d.products.find(p => p.sku === sku);
        if (prod) {
          rows[idx].sku = prod.sku;
          rows[idx].name = prod.name;
          rows[idx].weight = prod.weight;
          rows[idx].rate = prod.sellingRate;
          rows[idx].mrp = prod.mrp;
          rows[idx].discountPct = prod.defaultDiscount || 23.0;
          rows[idx].taxRate = prod.taxRate;
          refreshItemsTable();
        }
      });
    });

    // Quantity Input (Live on input AND change without focus loss)
    container.querySelectorAll('.row-qty').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
        updateDomTotals();
      });
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
        updateDomTotals();
      });
    });

    // Rate Input (Live on input AND change)
    container.querySelectorAll('.row-rate').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].rate = Math.max(0, parseFloat(e.target.value) || 0);
        updateDomTotals();
      });
    });

    // Discount Input (Live on input AND change)
    container.querySelectorAll('.row-disc').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].discountPct = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        updateDomTotals();
      });
    });

    // Expiry Date input
    container.querySelectorAll('.row-exp').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].expiryDate = e.target.value;
      });
    });

    // Delete Line Item
    container.querySelectorAll('.row-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-row'), 10);
        rows.splice(idx, 1);
        if (rows.length === 0) {
          rows.push({
            sku: d.products[0].sku,
            name: d.products[0].name,
            weight: d.products[0].weight,
            expiryDate: "15-10-2027",
            qty: 1,
            rate: d.products[0].sellingRate,
            mrp: d.products[0].mrp,
            discountPct: d.products[0].defaultDiscount || 23.0,
            taxRate: d.products[0].taxRate,
            amount: 0
          });
        }
        refreshItemsTable();
      });
    });
  }

  renderPage();
}

