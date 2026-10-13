/**
 * GNV COMMODITIES PVT. LTD. — INVOICES MODULE
 * Full editable invoice creation & editing, discount editing, and PDF printing
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderInvoices(container, param = null) {
  const d = store.data;

  // Route: New Invoice or New Invoice From SO
  if (param === 'new' || (param && param.startsWith('new-from-so/')) || (param && param.startsWith('edit-'))) {
    const soRef = param.startsWith('new-from-so/') ? param.replace('new-from-so/', '') : null;
    const invRef = param.startsWith('edit-') ? param.replace('edit-', '') : null;
    renderEditInvoiceForm(container, invRef, soRef);
    return;
  }

  // Default: Invoice List
  renderInvoiceList(container);
}

// Master-Detail Split View with In-Page TAX INVOICE Preview Mode
function renderInvoiceList(container, initialInvNumber = null) {
  const d = store.data;
  let selectedInvoice = (initialInvNumber && d.invoices.find(i => i.invoiceNumber === initialInvNumber))
    || d.invoices[0];
  let showPdfView = true;
  let searchTerm = '';

  function render() {
    let filteredInvoices = d.invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.soNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!filteredInvoices.find(i => i.invoiceNumber === selectedInvoice.invoiceNumber)) {
      if (filteredInvoices.length > 0) selectedInvoice = filteredInvoices[0];
    }

    const customer = d.customers.find(c => c.id === selectedInvoice.customerId) || {
      name: selectedInvoice.customerName,
      city: 'Jaipur',
      state: 'Rajasthan',
      gstin: '08ABAFN3581C1ZH',
      address: 'Plot No. 315, First Floor, Officers Campus Ext., Anjani Marg',
      phone: '+91-9461203914'
    };

    container.innerHTML = `
      <div class="split-view-container">
        
        <!-- Left Master List Pane -->
        <div class="split-list-pane">
          <div class="split-list-header">
            <div class="split-list-title">All Invoices (${d.invoices.length})</div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#invoices/new'">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> New
            </button>
          </div>

          <div class="split-list-search">
            <input type="text" id="inv-search-box" class="split-search-input" placeholder="Search invoices..." value="${searchTerm}">
          </div>

          <div class="split-list-body">
            ${filteredInvoices.map(inv => `
              <div class="split-item-row ${inv.invoiceNumber === selectedInvoice.invoiceNumber ? 'active' : ''}" data-inv="${inv.invoiceNumber}">
                <div class="split-item-top">
                  <span class="split-item-customer">${inv.customerName}</span>
                  <span class="split-item-amount">₹${Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="split-item-meta">
                  <span>${inv.invoiceNumber} &bull; ${inv.invoiceDate}</span>
                  <span class="badge ${inv.status === 'Paid' ? 'badge-delivered' : 'badge-confirmed'}">
                    ${inv.status === 'Paid' ? 'PAID' : 'DUE TODAY'}
                  </span>
                </div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 1px;">
                  SO: ${inv.soNumber}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Preview Pane -->
        <div class="split-detail-pane">
          
          <!-- Top Action Bar -->
          <div class="detail-top-toolbar">
            <div class="detail-left-actions">
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#invoices/edit-${encodeURIComponent(selectedInvoice.invoiceNumber)}'">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm" id="btn-inv-pdf-print">
                <i data-lucide="printer" style="width: 14px; height: 14px;"></i> PDF / Print
              </button>
              <button class="btn btn-outline btn-sm" id="btn-inv-send-email">
                <i data-lucide="mail" style="width: 14px; height: 14px;"></i> Send Email
              </button>
              <button class="btn btn-sm ${selectedInvoice.status === 'Paid' ? 'btn-ghost' : 'btn-success'}" id="btn-inv-record-pay">
                <i data-lucide="credit-card" style="width: 14px; height: 14px;"></i> ${selectedInvoice.status === 'Paid' ? 'Payment Received' : 'Record Payment'}
              </button>
            </div>

            <div class="detail-right-toggle">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" id="toggle-pdf-view" ${showPdfView ? 'checked' : ''}>
                <span>Show PDF Document View</span>
              </label>
            </div>
          </div>

          <!-- Document Subheader -->
          <div class="doc-preview-header">
            <div class="doc-preview-location">Location: ${customer.state || 'Tamil Nadu'}</div>
            <div class="doc-preview-title">${selectedInvoice.invoiceNumber}</div>
          </div>

          <!-- Document Paper Sheet (Matching Screenshot 2026-10-13 142547.png) -->
          <div class="detail-scroll-area">
            <div class="paper-sheet-container">
              
              <!-- Dogear ribbon -->
              <div class="paper-dogear-ribbon"></div>

              <!-- Stamp -->
              ${selectedInvoice.status === 'Paid' ? '<div class="paper-stamp">PAID</div>' : ''}

              <!-- Header with Authentic GNV Logo & Company Details -->
              <div class="paper-header">
                <div>
                  <div class="gnv-logo-badge" style="margin-bottom: 6px;">
                    <div class="gnv-letter letter-g" style="width: 26px; height: 26px; font-size: 14px;">G</div>
                    <div class="gnv-letter letter-n" style="width: 26px; height: 26px; font-size: 14px;">N</div>
                    <div class="gnv-letter letter-v" style="width: 26px; height: 26px; font-size: 14px;">V</div>
                  </div>
                  <div style="font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #475569; margin-bottom: 4px;">COMMODITIES</div>
                  <strong style="font-size: 13px; color: #0F172A;">${d.company.name}</strong>
                  <div class="paper-company-details">
                    ${d.company.address}<br>
                    ${d.company.city}, ${d.company.state} - ${d.company.pinCode || d.company.pincode || '600066'}, ${d.company.country}<br>
                    <strong>GSTIN:</strong> ${d.company.gstin} &bull; <strong>PAN:</strong> ${d.company.pan}
                  </div>
                </div>

                <div>
                  <div class="paper-doc-title">TAX INVOICE</div>
                  <div class="paper-doc-subtitle">ORIGINAL FOR RECIPIENT</div>
                </div>
              </div>

              <!-- Metadata Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; border: 1px solid #E2E8F0; border-radius: 4px; padding: 12px 14px; background: #F8FAFC;">
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>Invoice#:</strong> ${selectedInvoice.invoiceNumber}</div>
                  <div><strong>Invoice Date:</strong> ${selectedInvoice.invoiceDate}</div>
                  <div><strong>Terms:</strong> ${selectedInvoice.paymentTerms || 'PrePaid 0D'}</div>
                  <div><strong>Due Date:</strong> ${selectedInvoice.dueDate || selectedInvoice.invoiceDate}</div>
                  <div><strong>Sales Order#:</strong> ${selectedInvoice.soNumber}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>Place Of Supply:</strong> ${customer.state} (${customer.state === 'Rajasthan' ? '08' : '33'})</div>
                  <div><strong>Dispatch Warehouse:</strong> ${selectedInvoice.warehouseLocation || 'Chennai'}</div>
                  <div><strong>Scheme Remarks:</strong> <span style="color: #475569;">Your base discount has been applied on scheme-eligible products.</span></div>
                </div>
              </div>

              <!-- Bill To & Ship To Boxes -->
              <div class="paper-info-grid">
                <div style="border: 1px solid #E2E8F0; padding: 12px; border-radius: 4px;">
                  <div class="paper-section-title">Bill To</div>
                  <div class="paper-customer-name">${customer.name}</div>
                  <div style="font-size: 11.5px; color: #4B5563; line-height: 1.4; margin-top: 4px;">
                    ${customer.address}<br>
                    ${customer.city}, ${customer.state}<br>
                    <strong>GSTIN:</strong> ${customer.gstin || 'Unregistered'}<br>
                    <strong>Phone:</strong> ${customer.phone}
                  </div>
                </div>

                <div style="border: 1px solid #E2E8F0; padding: 12px; border-radius: 4px;">
                  <div class="paper-section-title">Ship To</div>
                  <div class="paper-customer-name">${customer.name}</div>
                  <div style="font-size: 11.5px; color: #4B5563; line-height: 1.4; margin-top: 4px;">
                    ${customer.address}<br>
                    ${customer.city}, ${customer.state}<br>
                    <strong>GSTIN:</strong> ${customer.gstin || 'Unregistered'}<br>
                    <strong>Phone:</strong> ${customer.phone}
                  </div>
                </div>
              </div>

              <!-- Items & Description Table -->
              <table class="paper-table">
                <thead>
                  <tr>
                    <th style="width: 25px;">#</th>
                    <th>ITEM & DESCRIPTION</th>
                    <th>EAN / SKU</th>
                    <th>EXPIRY</th>
                    <th class="text-right">QTY</th>
                    <th class="text-right">MRP</th>
                    <th class="text-right">AMOUNT</th>
                    <th class="text-right">DISCOUNT</th>
                    <th class="text-right">TAXABLE</th>
                    <th class="text-right">TAX</th>
                    <th class="text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${(selectedInvoice.items || []).map((it, idx) => {
                    const gross = (it.rate || it.mrp || 0) * (it.qty || 1);
                    const disc = (gross * (it.discountPct || 0)) / 100;
                    const taxable = gross - disc;
                    const tax = (taxable * (it.taxRate || 18)) / 100;
                    const lineTot = taxable + tax;
                    return `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>
                          <strong>${it.name}</strong>
                          <div style="font-size: 11px; color: #64748B;">${it.weight || ''}</div>
                        </td>
                        <td style="font-family: var(--font-mono); font-size: 11px;">${it.sku}</td>
                        <td style="font-size: 11px;">03-12-2027</td>
                        <td class="text-right" style="font-weight: 700;">${it.qty || 1} Nos.</td>
                        <td class="text-right">₹${Number(it.mrp || it.rate).toLocaleString('en-IN')}</td>
                        <td class="text-right">₹${gross.toLocaleString('en-IN')}</td>
                        <td class="text-right" style="color: var(--success-green); font-weight: 600;">${it.discountPct || 0}%</td>
                        <td class="text-right">₹${Math.round(taxable).toLocaleString('en-IN')}</td>
                        <td class="text-right">18%</td>
                        <td class="text-right" style="font-weight: 700;">₹${Math.round(lineTot).toLocaleString('en-IN')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <!-- Totals Section -->
              <div class="paper-totals-box">
                <table style="width: 100%;">
                  <tr>
                    <td>Sub Total:</td>
                    <td class="text-right">₹${Number(selectedInvoice.subTotal || selectedInvoice.grandTotal).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Discount:</td>
                    <td class="text-right" style="color: var(--success-green);">- ₹${Number(selectedInvoice.discountTotal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Taxable Amount:</td>
                    <td class="text-right">₹${Number(selectedInvoice.taxableAmount || (selectedInvoice.grandTotal * 0.84)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td>IGST / GST (18%):</td>
                    <td class="text-right">₹${Number(selectedInvoice.taxTotal || (selectedInvoice.grandTotal * 0.16)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td>Round Off:</td>
                    <td class="text-right">₹0.00</td>
                  </tr>
                  <tr class="paper-grand-total">
                    <td style="padding-top: 8px;">Total ( ₹ ):</td>
                    <td class="text-right" style="padding-top: 8px;">₹${Number(selectedInvoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <!-- Bank Details & Signatory -->
              <div style="border-top: 1px solid #E5E7EB; padding-top: 18px; margin-top: 24px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
                <div style="font-size: 11.5px; color: #4B5563; line-height: 1.5;">
                  <strong style="color: #111827;">Bank Details:</strong><br>
                  Bank: <strong>${(d.company && d.company.bankDetails && d.company.bankDetails.bankName) || 'HDFC Bank Ltd.'}</strong><br>
                  A/C No: <strong>${(d.company && d.company.bankDetails && d.company.bankDetails.accountNo) || '50200049281940'}</strong><br>
                  IFSC: <strong>${(d.company && d.company.bankDetails && d.company.bankDetails.ifsc) || 'HDFC0000048'}</strong> &bull; Branch: ${(d.company && d.company.bankDetails && d.company.bankDetails.branch) || 'Puzhal, Chennai'}
                </div>
                <div style="text-align: right; font-size: 11.5px;">
                  <div style="font-weight: 700; color: #111827;">For GNV COMMODITIES PRIVATE LIMITED</div>
                  <div style="height: 48px; display: flex; align-items: flex-end; justify-content: flex-end;">
                    <div style="font-family: cursive; font-size: 14px; color: #1E293B;">Authorized Signatory</div>
                  </div>
                  <div style="color: #6B7280; font-size: 11px;">Authorised Signatory</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    const searchBox = container.querySelector('#inv-search-box');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    container.querySelectorAll('.split-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const invNum = row.getAttribute('data-inv');
        selectedInvoice = d.invoices.find(i => i.invoiceNumber === invNum) || selectedInvoice;
        render();
      });
    });

    const printBtn = container.querySelector('#btn-inv-pdf-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        openPrintDocument('INVOICE', selectedInvoice, d.company);
      });
    }

    const emailBtn = container.querySelector('#btn-inv-send-email');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        store.addToast(`Invoice ${selectedInvoice.invoiceNumber} emailed to ${selectedInvoice.customerName}`);
      });
    }

    const payBtn = container.querySelector('#btn-inv-record-pay');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        selectedInvoice.status = 'Paid';
        store.saveToStorage();
        store.addToast(`Payment recorded for Invoice ${selectedInvoice.invoiceNumber}! Status set to PAID.`);
        render();
      });
    }

    const togglePdf = container.querySelector('#toggle-pdf-view');
    if (togglePdf) {
      togglePdf.addEventListener('change', (e) => {
        showPdfView = e.target.checked;
        const area = container.querySelector('.paper-sheet-container');
        if (area) {
          area.style.display = showPdfView ? 'block' : 'none';
        }
      });
    }
  }

  render();
}

// Full Edit Invoice Form (Always opens in EDIT MODE!)
function renderEditInvoiceForm(container, existingInvNumber = null, sourceSoNumber = null) {
  const d = store.data;

  let invoice = existingInvNumber
    ? JSON.parse(JSON.stringify(d.invoices.find(i => i.invoiceNumber === existingInvNumber || i.id === existingInvNumber) || d.invoices[0]))
    : null;

  let sourceSo = sourceSoNumber
    ? d.salesOrders.find(s => s.soNumber === sourceSoNumber || s.id === sourceSoNumber)
    : null;

  const isEdit = !!invoice;

  let invNumberVal = isEdit ? invoice.invoiceNumber : `C2627${3298 + d.invoices.length}`;
  let soNumberVal = isEdit ? invoice.soNumber : (sourceSo ? sourceSo.soNumber : 'SOC/26-27-5265');
  let selectedCustomer = isEdit
    ? (d.customers.find(c => c.id === invoice.customerId) || d.customers[0])
    : (sourceSo ? (d.customers.find(c => c.id === sourceSo.customerId) || d.customers[0]) : d.customers[0]);

  let warehouseLocVal = isEdit ? (invoice.warehouseLocation || 'Chennai') : (sourceSo ? sourceSo.warehouseLocation : 'Chennai');
  if (!['Chennai', 'Mumbai', 'Kolkata', 'Noida'].includes(warehouseLocVal)) {
    warehouseLocVal = 'Chennai';
  }
  let invDateVal = isEdit ? invoice.invoiceDate : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  let dueDateVal = isEdit ? (invoice.dueDate || invDateVal) : invDateVal;
  let termsVal = isEdit ? (invoice.paymentTerms || 'PrePaid 0D') : 'PrePaid 0D';

  // Initialize editable rows from invoice or source SO
  let rows = [];
  if (isEdit && invoice.items && invoice.items.length > 0) {
    rows = invoice.items.map(it => ({ ...it }));
  } else if (sourceSo && sourceSo.items && sourceSo.items.length > 0) {
    rows = sourceSo.items.map(it => ({
      sku: it.sku,
      name: it.name,
      weight: it.weight,
      qty: it.orderedQty || it.qty || 1,
      mrp: it.mrp || it.unitRate,
      rate: it.unitRate || it.rate,
      discountPct: it.discountPct || 23.0,
      taxRate: it.taxRate || 18,
      amount: it.lineTotal || 0
    }));
  } else {
    rows = [
      {
        sku: d.products[0].sku,
        name: d.products[0].name,
        weight: d.products[0].weight,
        qty: 1,
        mrp: d.products[0].mrp,
        rate: d.products[0].sellingRate,
        discountPct: d.products[0].defaultDiscount || 23.0,
        taxRate: d.products[0].taxRate,
        amount: 0
      }
    ];
  }

  // Add blank row ready
  rows.push({
    sku: "",
    name: "",
    weight: "",
    qty: 1,
    mrp: 0,
    rate: 0,
    discountPct: 0,
    taxRate: 18,
    amount: 0
  });

  function recalculate() {
    let taxableTotal = 0;
    let taxTotal = 0;

    rows.forEach(r => {
      if (!r.sku) {
        r.amount = 0;
        return;
      }
      const gross = r.rate * r.qty;
      const discAmt = (gross * (r.discountPct || 0)) / 100;
      const taxable = gross - discAmt;
      const taxAmt = (taxable * (r.taxRate || 18)) / 100;
      r.amount = Math.round(taxable + taxAmt);
      r.taxableAmount = taxable;
      r.taxAmount = taxAmt;

      taxableTotal += taxable;
      taxTotal += taxAmt;
    });

    const grandTotal = Math.round(taxableTotal + taxTotal);
    return { taxableTotal, taxTotal, grandTotal };
  }

  function renderForm() {
    const calcs = recalculate();

    container.innerHTML = `
      <div class="form-page-container">
        
        <!-- Header Bar -->
        <div class="form-header-bar">
          <div class="form-title">
            <i data-lucide="file-text" style="color: var(--primary-blue);"></i>
            <span>${isEdit ? 'Edit Tax Invoice — ' + invNumberVal : 'Create New Tax Invoice'}</span>
          </div>
          <button class="btn btn-ghost" onclick="window.location.hash='#invoices'">
            <i data-lucide="x"></i>
          </button>
        </div>

        <!-- Section Card 1: Invoice Header Details -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="receipt" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div class="form-section-title">Invoice & Customer Entity</div>
              <div class="form-section-subtitle">Billing particulars, GST identification, and warehouse origin</div>
            </div>
          </div>

          <div class="form-grid-row">
            <div class="form-field">
              <label class="form-field-label">Customer Name <span class="req">*</span></label>
              <select id="inv-cust-select" class="form-select">
                ${d.customers.map(c => `
                  <option value="${c.id}" ${c.id === selectedCustomer.id ? 'selected' : ''}>${c.name} (${c.city}, ${c.state})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-field">
              <label class="form-field-label">Invoice# <span class="req">*</span></label>
              <input type="text" id="inv-num-input" class="form-input" value="${invNumberVal}" readonly style="background: #F8FAFC; font-weight: 700; color: var(--primary-blue);">
            </div>

            <div class="form-field">
              <label class="form-field-label">Linked Sales Order#</label>
              <input type="text" id="inv-so-input" class="form-input" value="${soNumberVal}">
            </div>

            <div class="form-field">
              <label class="form-field-label">Invoice Date <span class="req">*</span></label>
              <input type="text" id="inv-date-input" class="form-input" value="${invDateVal}">
            </div>

            <div class="form-field">
              <label class="form-field-label">Due Date</label>
              <input type="text" id="inv-due-input" class="form-input" value="${dueDateVal}">
            </div>

            <div class="form-field">
              <label class="form-field-label">Dispatch Warehouse Location (4 Hubs)</label>
              <select id="inv-wh-select" class="form-select">
                ${d.warehouses.map(w => `
                  <option value="${w.name}" ${w.name === warehouseLocVal ? 'selected' : ''}>${w.displayName || w.name + ' Warehouse'} (${w.city})</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Section Card 2: Line Items Table (Fully Editable) -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="list" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1;">
              <div class="form-section-title">Invoice Line Items & Commercials</div>
              <div class="form-section-subtitle">Adjust item quantities, rates, and line-level discounts</div>
            </div>
            <button type="button" id="btn-add-inv-item" class="btn-add-line-row">
              <i data-lucide="plus" style="width: 15px; height: 15px;"></i> Add Line Item
            </button>
          </div>

          <div class="item-edit-table-container">
            <table class="item-edit-table">
              <thead>
                <tr>
                  <th style="width: 35%;">ITEM DETAILS</th>
                  <th style="width: 10%;">QUANTITY</th>
                  <th style="width: 12%;">RATE (₹)</th>
                  <th style="width: 12%;">DISCOUNT (%)</th>
                  <th style="width: 12%;">TAXABLE (₹)</th>
                  <th style="width: 8%;">TAX</th>
                  <th style="width: 11%; text-align: right;">AMOUNT (₹)</th>
                  <th style="width: 25px;"></th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, idx) => `
                  <tr>
                    <td>
                      <select class="form-select inv-row-sku" data-row="${idx}">
                        <option value="">${row.sku ? `${row.name}` : 'Type or select an item...'}</option>
                        ${d.products.map(p => `
                          <option value="${p.sku}" ${p.sku === row.sku ? 'selected' : ''}>${p.name} (${p.weight}) — ₹${p.sellingRate}</option>
                        `).join('')}
                      </select>
                    </td>
                    <td>
                      <input type="number" min="1" class="item-input inv-row-qty" data-row="${idx}" value="${row.qty || 1}" style="text-align: center; font-weight: 700;">
                    </td>
                    <td>
                      <input type="number" min="0" class="item-input inv-row-rate" data-row="${idx}" value="${row.rate || 0}">
                    </td>
                    <td>
                      <input type="number" min="0" max="100" step="0.5" class="item-input inv-row-disc" data-row="${idx}" value="${row.discountPct || 0}" title="Edit Discount %">
                    </td>
                    <td>
                      <span style="font-size: 12px; font-weight: 600;">₹${Math.round(row.taxableAmount || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span style="font-size: 11.5px; font-weight: 600; color: #475569;">GST ${row.taxRate || 18}%</span>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: #0F172A;">
                      ₹${row.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      ${rows.length > 1 && row.sku ? `
                        <button type="button" class="btn btn-sm btn-ghost inv-row-del" data-row="${idx}" style="color: var(--danger-red); padding: 2px;">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section Card 3: Summary -->
        <div class="form-section-card">
          <div class="form-section-header">
            <div class="form-section-icon">
              <i data-lucide="calculator" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div class="form-section-title">Tax Invoice Totals</div>
              <div class="form-section-subtitle">Total taxable amount and applicable goods and services tax</div>
            </div>
          </div>

          <div class="form-summary-wrapper">
            <table class="form-summary-table">
              <tr>
                <td>Taxable Amount:</td>
                <td class="text-right" style="font-weight: 600;">₹${Math.round(calcs.taxableTotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Total GST (18%):</td>
                <td class="text-right" style="font-weight: 600;">₹${Math.round(calcs.taxTotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="summary-total-row">
                <td style="font-weight: 800;">Total Payable ( ₹ ):</td>
                <td class="text-right" style="font-weight: 800; font-size: 16px; color: var(--primary-blue);">₹${calcs.grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="form-bottom-actions">
          <button class="btn btn-ghost" onclick="window.location.hash='#invoices'">
            Cancel
          </button>
          <button id="btn-save-inv" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
            <i data-lucide="check"></i> Save Invoice
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    container.querySelector('#inv-cust-select').addEventListener('change', (e) => {
      selectedCustomer = d.customers.find(c => c.id === e.target.value) || selectedCustomer;
    });

    container.querySelectorAll('.inv-row-sku').forEach(sel => {
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

          if (idx === rows.length - 1) {
            rows.push({
              sku: "",
              name: "",
              weight: "",
              qty: 1,
              mrp: 0,
              rate: 0,
              discountPct: 0,
              taxRate: 18,
              amount: 0
            });
          }
          renderForm();
        }
      });
    });

    container.querySelectorAll('.inv-row-qty').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
        renderForm();
      });
    });

    container.querySelectorAll('.inv-row-rate').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].rate = Math.max(0, parseFloat(e.target.value) || 0);
        renderForm();
      });
    });

    container.querySelectorAll('.inv-row-disc').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-row'), 10);
        rows[idx].discountPct = Math.max(0, parseFloat(e.target.value) || 0);
        renderForm();
      });
    });

    container.querySelectorAll('.inv-row-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-row'), 10);
        rows.splice(idx, 1);
        renderForm();
      });
    });

    container.querySelector('#btn-save-inv').addEventListener('click', () => {
      const validItems = rows.filter(r => r.sku);
      if (validItems.length === 0) {
        alert("Please add at least one line item.");
        return;
      }

      const invNum = document.getElementById('inv-num-input').value.trim() || invNumberVal;
      const soNum = document.getElementById('inv-so-input').value.trim() || soNumberVal;
      const invDate = document.getElementById('inv-date-input').value.trim() || invDateVal;
      const dueDate = document.getElementById('inv-due-input').value.trim() || dueDateVal;
      const whLoc = document.getElementById('inv-wh-select').value;
      const calcs = recalculate();

      const invData = {
        id: invNum,
        invoiceNumber: invNum,
        invoiceDate: invDate,
        dueDate,
        soNumber: soNum,
        gnvNumber: isEdit ? invoice.gnvNumber : (sourceSo ? sourceSo.gnvNumber : 'GNV-2026-000001'),
        customerName: selectedCustomer.name,
        customerId: selectedCustomer.id,
        customerGSTIN: selectedCustomer.gstin,
        billingAddress: selectedCustomer.billingAddress,
        placeOfSupply: `${selectedCustomer.state} (08)`,
        warehouseLocation: whLoc,
        paymentTerms: termsVal,
        items: validItems.map(it => ({
          sku: it.sku,
          name: it.name,
          weight: it.weight,
          qty: it.qty,
          mrp: it.mrp || it.rate,
          rate: it.rate,
          discountPct: it.discountPct,
          taxableAmount: it.taxableAmount,
          taxRate: it.taxRate,
          taxAmount: it.taxAmount,
          lineTotal: it.amount
        })),
        taxableAmount: calcs.taxableTotal,
        igst: calcs.taxTotal,
        cgst: 0,
        sgst: 0,
        grandTotal: calcs.grandTotal,
        status: "Sent"
      };

      store.saveInvoice(invData);
      alert(`Invoice ${invNum} saved successfully!`);
      window.location.hash = '#invoices';
    });
  }

  renderForm();
}
