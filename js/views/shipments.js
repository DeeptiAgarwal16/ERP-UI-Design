/**
 * GNV COMMODITIES PVT. LTD. — SHIPMENTS & DELIVERY MODULE
 * Matching Screenshot 2026-10-13 141857.png with + New button and edit mode
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderShipments(container, param = null) {
  const d = store.data;

  if (param === 'new' || (param && param.startsWith('new-from-pkg/')) || (param && param.startsWith('edit-'))) {
    const pkgRef = param.startsWith('new-from-pkg/') ? param.replace('new-from-pkg/', '') : null;
    const shpRef = param.startsWith('edit-') ? param.replace('edit-', '') : null;
    renderEditShipmentForm(container, shpRef, pkgRef);
    return;
  }

  renderShipmentList(container);
}

// Master-Detail Split View with In-Page DELIVERY CHALLAN & SHIPPING NOTE Preview Mode
function renderShipmentList(container, initialShpNumber = null) {
  const d = store.data;
  let selectedShp = (initialShpNumber && d.shipments.find(s => s.shipmentNumber === initialShpNumber))
    || d.shipments[0];
  let showPdfView = true;
  let searchTerm = '';

  function render() {
    let filteredShipments = d.shipments.filter(shp =>
      shp.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shp.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shp.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shp.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!filteredShipments.find(s => s.shipmentNumber === selectedShp.shipmentNumber)) {
      if (filteredShipments.length > 0) selectedShp = filteredShipments[0];
    }

    const so = d.salesOrders.find(s => s.soNumber === selectedShp.soNumber);
    const customer = (so && d.customers.find(c => c.id === so.customerId)) || {
      name: selectedShp.customerName || 'House of Pets Enterprises',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Plot No. B-1, Ground Floor, Nityanand Nagar, Queens Road, Vaishali Nagar',
      phone: '+91-9648455500'
    };

    container.innerHTML = `
      <div class="split-view-container">
        
        <!-- Left Master List Pane -->
        <div class="split-list-pane">
          <div class="split-list-header">
            <div class="split-list-title">All Shipments (${d.shipments.length})</div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#shipments/new'">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> New
            </button>
          </div>

          <div class="split-list-search">
            <input type="text" id="shp-search-box" class="split-search-input" placeholder="Search shipments..." value="${searchTerm}">
          </div>

          <div class="split-list-body">
            ${filteredShipments.map(shp => `
              <div class="split-item-row ${shp.shipmentNumber === selectedShp.shipmentNumber ? 'active' : ''}" data-shp="${shp.shipmentNumber}">
                <div class="split-item-top">
                  <span class="split-item-customer">${shp.shipmentNumber}</span>
                  <span class="badge ${shp.status === 'DELIVERED' ? 'badge-delivered' : 'badge-confirmed'}">
                    ${shp.status}
                  </span>
                </div>
                <div class="split-item-meta" style="margin-top: 2px;">
                  <span>SO: ${shp.soNumber}</span>
                  <span>${shp.shipmentDate}</span>
                </div>
                <div style="font-size: 11.5px; color: #334155; font-weight: 600; margin-top: 2px;">
                  ${shp.customerName}
                </div>
                <div style="font-size: 11px; color: #64748B;">
                  ${shp.carrier} &bull; AWB: ${shp.trackingNumber}
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
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#shipments/edit-${encodeURIComponent(selectedShp.shipmentNumber)}'">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm" id="btn-shp-print-challan">
                <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print Challan
              </button>
              <button class="btn btn-primary btn-sm" id="btn-shp-track">
                <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> Track AWB
              </button>
            </div>

            <div class="detail-right-toggle">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" id="toggle-pdf-view" ${showPdfView ? 'checked' : ''}>
                <span>Show Challan View</span>
              </label>
            </div>
          </div>

          <!-- Document Subheader -->
          <div class="doc-preview-header">
            <div class="doc-preview-location">Carrier: ${selectedShp.carrier}</div>
            <div class="doc-preview-title">Delivery Challan #${selectedShp.shipmentNumber}</div>
          </div>

          <!-- Document Paper Sheet -->
          <div class="detail-scroll-area">
            <div class="paper-sheet-container">
              
              <!-- Dogear ribbon -->
              <div class="paper-dogear-ribbon"></div>

              <!-- Stamp -->
              <div class="paper-stamp">${selectedShp.status}</div>

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
                    Logistics & Supply Chain Hub<br>
                    ${d.company.address}, ${d.company.city}<br>
                    <strong>GSTIN:</strong> ${d.company.gstin}
                  </div>
                </div>

                <div>
                  <div class="paper-doc-title">DELIVERY CHALLAN</div>
                  <div class="paper-doc-subtitle">TAX COMPLIANT DISPATCH COPY</div>
                </div>
              </div>

              <!-- Metadata Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; border: 1px solid #E2E8F0; border-radius: 4px; padding: 12px 14px; background: #F8FAFC;">
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>Challan / Shipment#:</strong> ${selectedShp.shipmentNumber}</div>
                  <div><strong>Dispatch Date:</strong> ${selectedShp.shipmentDate}</div>
                  <div><strong>Linked Sales Order#:</strong> ${selectedShp.soNumber}</div>
                  <div><strong>Package Slip#:</strong> ${selectedShp.packageNumber}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>3PL Carrier:</strong> ${selectedShp.carrier}</div>
                  <div><strong>Air Waybill (AWB):</strong> <strong style="font-family: var(--font-mono);">${selectedShp.trackingNumber}</strong></div>
                  <div><strong>Freight Charge:</strong> ₹${Number(selectedShp.shipmentRate || 150).toFixed(2)}</div>
                  <div><strong>Delivery Status:</strong> <span style="color: #1366D9; font-weight: 600;">${selectedShp.status}</span></div>
                </div>
              </div>

              <!-- Consignee Delivery Address -->
              <div style="border: 1px solid #E2E8F0; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
                <div class="paper-section-title">Consignee & Delivery Destination</div>
                <div class="paper-customer-name">${customer.name}</div>
                <div style="font-size: 11.5px; color: #4B5563; line-height: 1.4; margin-top: 4px;">
                  ${customer.address}<br>
                  ${customer.city}, ${customer.state}<br>
                  <strong>Contact Phone:</strong> ${customer.phone}
                </div>
              </div>

              <!-- Dispatched Items Table -->
              <table class="paper-table">
                <thead>
                  <tr>
                    <th style="width: 25px;">#</th>
                    <th>ITEM & SPECIFICATION</th>
                    <th>PACKAGE SLIP#</th>
                    <th class="text-right">DISPATCHED QTY</th>
                    <th>TRANSIT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${((so && so.items) || [
                    { name: 'Orijen Six Fish Dog_Large_11.4 Kg', sku: 'F1F100411K11400', qty: 1 }
                  ]).map((it, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>
                        <strong>${it.name}</strong>
                        <div style="font-size: 11px; color: #64748B;">SKU: ${it.sku} &bull; ${it.weight || '11.4 Kg'}</div>
                      </td>
                      <td style="font-family: var(--font-mono); font-size: 11px;">${selectedShp.packageNumber}</td>
                      <td class="text-right" style="font-weight: 700; color: #1366D9;">${it.qty || 1} Nos.</td>
                      <td>
                        <span class="badge ${selectedShp.status === 'DELIVERED' ? 'badge-delivered' : 'badge-confirmed'}">
                          ${selectedShp.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- AWB Barcode & Delivery Receipt Box -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 20px;">
                <div>
                  <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">AWB Tracking Barcode:</div>
                  <div class="barcode-sim">
                    ${[2,4,1,3,2,5,1,2,4,3,1,4,5,2,1,3,4,1,2,4,3,1,5].map(w => `
                      <span class="barcode-bar" style="width: ${w * 2}px;"></span>
                    `).join('')}
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 10px; color: #64748B; margin-top: 2px;">
                    AWB*${selectedShp.trackingNumber}*IN
                  </div>
                </div>

                <div style="display: flex; gap: 30px; text-align: right; font-size: 11.5px;">
                  <div>
                    <div style="color: #64748B; font-size: 11px;">Dispatched by:</div>
                    <div style="font-weight: 700; color: #0F172A; margin-top: 4px;">Deepti Agarwal</div>
                    <div style="font-size: 11px; color: #475569;">Software Developer</div>
                  </div>
                  <div>
                    <div style="color: #64748B; font-size: 11px;">Carrier Handover:</div>
                    <div style="height: 32px; display: flex; align-items: flex-end; justify-content: flex-end;">
                      <div style="font-family: cursive; font-size: 13px; color: #1E293B;">Acknowledged by Courier</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    const searchBox = container.querySelector('#shp-search-box');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    container.querySelectorAll('.split-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const shpNum = row.getAttribute('data-shp');
        selectedShp = d.shipments.find(s => s.shipmentNumber === shpNum) || selectedShp;
        render();
      });
    });

    const printBtn = container.querySelector('#btn-shp-print-challan');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        openPrintDocument('SHIPMENT', selectedShp, d.company);
      });
    }

    const trackBtn = container.querySelector('#btn-shp-track');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        store.addToast(`Live Tracking AWB ${selectedShp.trackingNumber} via ${selectedShp.carrier}: Status is ${selectedShp.status}`);
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

// Edit Shipment Form (Opens directly in EDIT MODE!)
function renderEditShipmentForm(container, existingShpNum = null, sourcePkgNum = null) {
  const d = store.data;

  let shp = existingShpNum
    ? JSON.parse(JSON.stringify(d.shipments.find(s => s.shipmentNumber === existingShpNum || s.id === existingShpNum) || d.shipments[0]))
    : null;

  let sourcePkg = sourcePkgNum
    ? d.packages.find(p => p.packageNumber === sourcePkgNum || p.id === sourcePkgNum)
    : null;

  const isEdit = !!shp;

  let shpNumVal = isEdit ? shp.shipmentNumber : `SHP-${18922 + d.shipments.length}`;
  let pkgNumVal = isEdit ? shp.packageNumber : (sourcePkg ? sourcePkg.packageNumber : '19320');
  let soNumVal = isEdit ? shp.soNumber : (sourcePkg ? sourcePkg.soNumber : 'SON/26-27-4567');
  let customerVal = isEdit ? shp.customerName : (sourcePkg ? sourcePkg.customerName : 'House of Pets Enterprises');
  let carrierVal = isEdit ? shp.carrier : (sourcePkg ? sourcePkg.carrier : 'Courier_Delhivery B2C');
  let trackingVal = isEdit ? shp.trackingNumber : `101111${Date.now().toString().slice(-7)}`;
  let dateVal = isEdit ? shp.shipmentDate : '13-10-2026';
  let rateVal = isEdit ? (shp.shipmentRate || 150) : 150;
  let statusVal = isEdit ? shp.status : 'SHIPPED';
  let notesVal = isEdit ? (shp.notes || '1 BOX') : '1 BOX';

  container.innerHTML = `
    <div class="form-page-container">
      <div class="form-header-bar">
        <div class="form-title">
          <i data-lucide="truck" style="color: var(--primary-blue);"></i>
          <span>${isEdit ? 'Edit Shipment — ' + shpNumVal : 'New Shipment (' + shpNumVal + ')'}</span>
        </div>
        <button class="btn btn-ghost" onclick="window.location.hash='#shipments'">
          <i data-lucide="x"></i>
        </button>
      </div>

      <div class="form-grid-row">
        <div class="form-field">
          <label class="form-field-label">Shipment Order# <span class="req">*</span></label>
          <input type="text" id="shp-num-input" class="form-input" value="${shpNumVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Customer Name <span class="req">*</span></label>
          <input type="text" id="shp-cust-input" class="form-input" value="${customerVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Linked Sales Order#</label>
          <input type="text" id="shp-so-input" class="form-input" value="${soNumVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Package#</label>
          <input type="text" id="shp-pkg-input" class="form-input" value="${pkgNumVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Carrier Partner <span class="req">*</span></label>
          <select id="shp-carrier-select" class="form-select">
            <option value="Courier_Delhivery B2C" ${carrierVal === 'Courier_Delhivery B2C' ? 'selected' : ''}>Courier_Delhivery B2C</option>
            <option value="Local_Porter" ${carrierVal === 'Local_Porter' ? 'selected' : ''}>Local_Porter</option>
            <option value="Local_Self Pickup" ${carrierVal === 'Local_Self Pickup' ? 'selected' : ''}>Local_Self Pickup</option>
            <option value="Courier_Ashrey_Movin" ${carrierVal === 'Courier_Ashrey_Movin' ? 'selected' : ''}>Courier_Ashrey_Movin</option>
          </select>
        </div>

        <div class="form-field">
          <label class="form-field-label">AWB / Tracking Number <span class="req">*</span></label>
          <input type="text" id="shp-track-input" class="form-input" value="${trackingVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Shipment Date <span class="req">*</span></label>
          <input type="text" id="shp-date-input" class="form-input" value="${dateVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Shipping Rate (₹)</label>
          <input type="number" id="shp-rate-input" class="form-input" value="${rateVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Status</label>
          <select id="shp-status-select" class="form-select">
            <option value="SHIPPED" ${statusVal === 'SHIPPED' ? 'selected' : ''}>SHIPPED</option>
            <option value="DELIVERED" ${statusVal === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
          </select>
        </div>

        <div class="form-field" style="grid-column: 1 / -1;">
          <label class="form-field-label">Shipment Notes</label>
          <input type="text" id="shp-notes-input" class="form-input" value="${notesVal}">
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="form-bottom-actions">
        <button id="btn-save-shp" class="btn btn-primary">
          <i data-lucide="check"></i> Save
        </button>
        <button class="btn btn-ghost" onclick="window.location.hash='#shipments'">
          Cancel
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-save-shp').addEventListener('click', () => {
    const shpData = {
      id: document.getElementById('shp-num-input').value.trim() || shpNumVal,
      shipmentNumber: document.getElementById('shp-num-input').value.trim() || shpNumVal,
      packageNumber: document.getElementById('shp-pkg-input').value.trim() || pkgNumVal,
      soNumber: document.getElementById('shp-so-input').value.trim() || soNumVal,
      gnvNumber: isEdit ? shp.gnvNumber : 'GNV-2026-000001',
      customerName: document.getElementById('shp-cust-input').value.trim() || customerVal,
      destination: "India",
      carrier: document.getElementById('shp-carrier-select').value,
      trackingNumber: document.getElementById('shp-track-input').value.trim() || trackingVal,
      shipmentDate: document.getElementById('shp-date-input').value.trim() || dateVal,
      expectedDelivery: "15-10-2026",
      shipmentRate: parseFloat(document.getElementById('shp-rate-input').value) || rateVal,
      notes: document.getElementById('shp-notes-input').value.trim() || notesVal,
      status: document.getElementById('shp-status-select').value
    };

    store.saveShipment(shpData);
    alert(`Shipment ${shpData.shipmentNumber} saved!`);
    window.location.hash = '#shipments';
  });
}
