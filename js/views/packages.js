/**
 * GNV COMMODITIES PVT. LTD. — PACKAGES MODULE
 * Opens directly in Edit Mode matching Screenshot 2026-10-13 141840.png
 */

import { store } from '../store.js';
import { openPrintDocument } from '../pdfGenerator.js';

export function renderPackages(container, param = null) {
  const d = store.data;

  if (param === 'new' || (param && param.startsWith('new-from-so/')) || (param && param.startsWith('edit-'))) {
    const soRef = param.startsWith('new-from-so/') ? param.replace('new-from-so/', '') : null;
    const pkgRef = param.startsWith('edit-') ? param.replace('edit-', '') : null;
    renderEditPackageForm(container, pkgRef, soRef);
    return;
  }

  renderPackageList(container);
}

// Master-Detail Split View with In-Page PACKING SLIP Preview Mode
function renderPackageList(container, initialPkgNumber = null) {
  const d = store.data;
  let selectedPkg = (initialPkgNumber && d.packages.find(p => p.packageNumber === initialPkgNumber))
    || d.packages[0];
  let showPdfView = true;
  let searchTerm = '';

  function render() {
    let filteredPackages = d.packages.filter(pkg =>
      pkg.packageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.customerName && pkg.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!filteredPackages.find(p => p.packageNumber === selectedPkg.packageNumber)) {
      if (filteredPackages.length > 0) selectedPkg = filteredPackages[0];
    }

    const so = d.salesOrders.find(s => s.soNumber === selectedPkg.soNumber);
    const customer = (so && d.customers.find(c => c.id === so.customerId)) || {
      name: selectedPkg.customerName || 'House of Pets Enterprises',
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
            <div class="split-list-title">All Packages (${d.packages.length})</div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#packages/new'">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> New
            </button>
          </div>

          <div class="split-list-search">
            <input type="text" id="pkg-search-box" class="split-search-input" placeholder="Search packages..." value="${searchTerm}">
          </div>

          <div class="split-list-body">
            ${filteredPackages.map(pkg => `
              <div class="split-item-row ${pkg.packageNumber === selectedPkg.packageNumber ? 'active' : ''}" data-pkg="${pkg.packageNumber}">
                <div class="split-item-top">
                  <span class="split-item-customer">${pkg.packageNumber}</span>
                  <span class="badge badge-delivered">${pkg.status.toUpperCase()}</span>
                </div>
                <div class="split-item-meta" style="margin-top: 2px;">
                  <span>SO: ${pkg.soNumber}</span>
                  <span>${pkg.date}</span>
                </div>
                <div style="font-size: 11.5px; color: #334155; font-weight: 600; margin-top: 2px;">
                  ${pkg.customerName || customer.name}
                </div>
                <div style="font-size: 11px; color: #64748B;">
                  Hub: ${pkg.warehouseName || 'Noida'} &bull; ${pkg.carrier || 'Delhivery'}
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
              <button class="btn btn-outline btn-sm" onclick="window.location.hash='#packages/edit-${encodeURIComponent(selectedPkg.packageNumber)}'">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm" id="btn-pkg-print-slip">
                <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print Slip
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='#shipments/new-from-pkg/${encodeURIComponent(selectedPkg.packageNumber)}'">
                <i data-lucide="truck" style="width: 14px; height: 14px;"></i> Ship Package
              </button>
            </div>

            <div class="detail-right-toggle">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" id="toggle-pdf-view" ${showPdfView ? 'checked' : ''}>
                <span>Show Packing Slip View</span>
              </label>
            </div>
          </div>

          <!-- Document Subheader -->
          <div class="doc-preview-header">
            <div class="doc-preview-location">Warehouse Hub: ${selectedPkg.warehouseName || 'Noida'}</div>
            <div class="doc-preview-title">Package Slip #${selectedPkg.packageNumber}</div>
          </div>

          <!-- Document Paper Sheet -->
          <div class="detail-scroll-area">
            <div class="paper-sheet-container">
              
              <!-- Dogear ribbon -->
              <div class="paper-dogear-ribbon"></div>

              <!-- Stamp -->
              <div class="paper-stamp">PACKED</div>

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
                    Central Distribution & Logistics<br>
                    ${d.company.address}, ${d.company.city}<br>
                    <strong>GSTIN:</strong> ${d.company.gstin}
                  </div>
                </div>

                <div>
                  <div class="paper-doc-title">PACKING SLIP</div>
                  <div class="paper-doc-subtitle">DISPATCH VERIFICATION COPY</div>
                </div>
              </div>

              <!-- Metadata Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; border: 1px solid #E2E8F0; border-radius: 4px; padding: 12px 14px; background: #F8FAFC;">
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>Package Slip#:</strong> ${selectedPkg.packageNumber}</div>
                  <div><strong>Pack Date:</strong> ${selectedPkg.date}</div>
                  <div><strong>Sales Order#:</strong> ${selectedPkg.soNumber}</div>
                  <div><strong>Dispatch Hub:</strong> ${selectedPkg.warehouseName || 'Noida'}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                  <div><strong>Carrier:</strong> ${selectedPkg.carrier || 'Courier_Delhivery B2C'}</div>
                  <div><strong>Package Type:</strong> Standard Corrugated Box</div>
                  <div><strong>Gross Weight:</strong> ${selectedPkg.grossWeight || 12} kg (Net: ${selectedPkg.netWeight || 11.4} kg)</div>
                  <div><strong>Dimensions:</strong> 40 x 30 x 25 cm</div>
                </div>
              </div>

              <!-- Ship To Box -->
              <div style="border: 1px solid #E2E8F0; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
                <div class="paper-section-title">Deliver To Customer</div>
                <div class="paper-customer-name">${customer.name}</div>
                <div style="font-size: 11.5px; color: #4B5563; line-height: 1.4; margin-top: 4px;">
                  ${customer.address}<br>
                  ${customer.city}, ${customer.state}<br>
                  <strong>Contact Phone:</strong> ${customer.phone}
                </div>
              </div>

              <!-- Packed Items Table -->
              <table class="paper-table">
                <thead>
                  <tr>
                    <th style="width: 25px;">#</th>
                    <th>ITEM & DESCRIPTION</th>
                    <th>SKU</th>
                    <th class="text-right">ORDERED</th>
                    <th class="text-right">PACKED</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${(selectedPkg.items || (so && so.items) || [
                    { name: 'Orijen Six Fish Dog_Large_11.4 Kg', sku: 'F1F100411K11400', orderedQty: 1, packedQty: 1 }
                  ]).map((it, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>
                        <strong>${it.name}</strong>
                        <div style="font-size: 11px; color: #64748B;">${it.weight || '11.4 Kg'}</div>
                      </td>
                      <td style="font-family: var(--font-mono); font-size: 11px;">${it.sku}</td>
                      <td class="text-right">${it.orderedQty || it.qty || 1} Nos.</td>
                      <td class="text-right" style="font-weight: 700; color: #16A34A;">${it.packedQty || it.qty || 1} Nos.</td>
                      <td>
                        <span class="badge badge-delivered">100% PACKED</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Barcode Simulation & Sign-off -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 20px;">
                <div>
                  <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">Package Barcode / AWB Trace:</div>
                  <div class="barcode-sim">
                    ${[3,1,4,2,5,1,3,2,4,1,2,5,2,3,1,4,2,1,3,5,2,1,4].map(w => `
                      <span class="barcode-bar" style="width: ${w * 2}px;"></span>
                    `).join('')}
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 10px; color: #64748B; margin-top: 2px;">
                    PKG*${selectedPkg.packageNumber}*IN
                  </div>
                </div>

                <div style="text-align: right; font-size: 11.5px;">
                  <div style="color: #64748B; font-size: 11px;">Verified & Packed by:</div>
                  <div style="font-weight: 700; color: #0F172A; margin-top: 4px;">Deepti Agarwal</div>
                  <div style="font-size: 11px; color: #475569;">Software Developer / Logistics Ops</div>
                  <div style="margin-top: 8px; border-top: 1px dashed #CBD5E1; padding-top: 4px; color: #94A3B8; font-size: 10px;">
                    Quality Inspection Signature
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
    const searchBox = container.querySelector('#pkg-search-box');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    container.querySelectorAll('.split-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const pkgNum = row.getAttribute('data-pkg');
        selectedPkg = d.packages.find(p => p.packageNumber === pkgNum) || selectedPkg;
        render();
      });
    });

    const printBtn = container.querySelector('#btn-pkg-print-slip');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        openPrintDocument('PACKAGE_SLIP', selectedPkg, d.company);
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

// Edit Package Form (Matching Screenshot 2026-10-13 141840.png)
function renderEditPackageForm(container, existingPkgNum = null, sourceSoNum = null) {
  const d = store.data;

  let pkg = existingPkgNum
    ? JSON.parse(JSON.stringify(d.packages.find(p => p.packageNumber === existingPkgNum || p.id === existingPkgNum) || d.packages[0]))
    : null;

  let sourceSo = sourceSoNum
    ? d.salesOrders.find(s => s.soNumber === sourceSoNum || s.id === sourceSoNum)
    : null;

  const isEdit = !!pkg;

  let pkgSlipNum = isEdit ? pkg.packageNumber : String(19319 + d.packages.length);
  let soNum = isEdit ? pkg.soNumber : (sourceSo ? sourceSo.soNumber : 'SON/26-27-4567');
  let customerName = isEdit ? pkg.customerName : (sourceSo ? sourceSo.customerName : 'House of Pets Enterprises');
  let dateVal = isEdit ? pkg.date : '13-10-2026';
  let netWtVal = isEdit ? (pkg.netWeight || 11.4) : 11.4;
  let grossWtVal = isEdit ? (pkg.grossWeight || 12.0) : 12.0;
  let dimsVal = isEdit ? (pkg.dimensions || '45 x 35 x 30 cm') : '45 x 35 x 30 cm';
  let carrierVal = isEdit ? (pkg.carrier || 'Courier_Delhivery B2C') : 'Courier_Delhivery B2C';
  let whLocation = isEdit ? (pkg.warehouseName || 'Noida') : (sourceSo ? sourceSo.warehouseLocation : 'Noida');

  // Items in package
  let items = [];
  if (isEdit && pkg.items) {
    items = pkg.items.map(it => ({ ...it }));
  } else if (sourceSo && sourceSo.items) {
    items = sourceSo.items.map(it => ({
      sku: it.sku,
      name: it.name,
      orderedQty: it.orderedQty || it.qty || 1,
      packedQty: 0,
      qtyToPack: it.orderedQty || it.qty || 1,
      location: sourceSo.warehouseLocation || 'Noida'
    }));
  } else {
    items = [
      {
        sku: "F1F100311K11400",
        name: "Orijen Six Fish Dog_Large_11.4 Kg",
        orderedQty: 1,
        packedQty: 0,
        qtyToPack: 1,
        location: "Kolkata"
      }
    ];
  }

  container.innerHTML = `
    <div class="form-page-container">
      <div class="form-header-bar">
        <div class="form-title">
          <i data-lucide="box" style="color: var(--primary-blue);"></i>
          <span>${isEdit ? 'Edit Package — Slip#' + pkgSlipNum : 'Edit Package (Slip#' + pkgSlipNum + ')'}</span>
        </div>
        <button class="btn btn-ghost" onclick="window.location.hash='#packages'">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Top Fields Grid -->
      <div class="form-grid-row">
        <div class="form-field">
          <label class="form-field-label">Package Slip# <span class="req">*</span></label>
          <input type="text" id="pkg-slip-input" class="form-input" value="${pkgSlipNum}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Date <span class="req">*</span></label>
          <input type="text" id="pkg-date-input" class="form-input" value="${dateVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Package Type</label>
          <select id="pkg-type-select" class="form-select">
            <option value="Carton Box">Carton Box</option>
            <option value="Bag">Bag</option>
            <option value="Pallet">Pallet</option>
          </select>
        </div>

        <div class="form-field">
          <label class="form-field-label">Net Weight (kg)</label>
          <input type="number" step="0.1" id="pkg-net-wt" class="form-input" value="${netWtVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Gross Weight (kg)</label>
          <input type="number" step="0.1" id="pkg-gross-wt" class="form-input" value="${grossWtVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Dimensions (L x W x H cm)</label>
          <input type="text" id="pkg-dims-input" class="form-input" value="${dimsVal}">
        </div>

        <div class="form-field">
          <label class="form-field-label">Carrier</label>
          <select id="pkg-carrier-select" class="form-select">
            <option value="Courier_Delhivery B2C" ${carrierVal === 'Courier_Delhivery B2C' ? 'selected' : ''}>Courier_Delhivery B2C</option>
            <option value="Local_Porter" ${carrierVal === 'Local_Porter' ? 'selected' : ''}>Local_Porter</option>
            <option value="Local_Self Pickup" ${carrierVal === 'Local_Self Pickup' ? 'selected' : ''}>Local_Self Pickup</option>
            <option value="Courier_Ashrey_Movin" ${carrierVal === 'Courier_Ashrey_Movin' ? 'selected' : ''}>Courier_Ashrey_Movin</option>
          </select>
        </div>

        <div class="form-field">
          <label class="form-field-label">Warehouse Location</label>
          <select id="pkg-wh-select" class="form-select">
            ${d.warehouses.map(w => `
              <option value="${w.name}" ${w.name === whLocation ? 'selected' : ''}>${w.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Items to Pack Table -->
      <h4 style="font-size: 13.5px; font-weight: 700; color: #0F172A; margin-top: 20px; margin-bottom: 8px;">
        Items to Pack
      </h4>

      <table class="item-edit-table">
        <thead>
          <tr>
            <th style="width: 50%;">ITEMS & DESCRIPTION</th>
            <th style="width: 15%;">ORDERED</th>
            <th style="width: 15%;">PACKED</th>
            <th style="width: 20%;">QUANTITY TO PACK</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => `
            <tr>
              <td>
                <strong style="color: #0F172A;">${it.name}</strong>
                <br><small style="color: #64748B;">SKU: ${it.sku}</small>
                <br><span style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">Location: ${whLocation}</span>
              </td>
              <td>${it.orderedQty} Nos.</td>
              <td>${it.packedQty || 0}</td>
              <td>
                <input type="number" min="0" max="${it.orderedQty}" class="item-input pkg-qty-pack" data-idx="${idx}" value="${it.qtyToPack}">
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Bottom Actions -->
      <div class="form-bottom-actions">
        <button id="btn-save-pkg" class="btn btn-primary">
          <i data-lucide="check"></i> Save
        </button>
        <button class="btn btn-ghost" onclick="window.location.hash='#packages'">
          Cancel
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelectorAll('.pkg-qty-pack').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      items[idx].qtyToPack = Math.max(0, parseInt(e.target.value, 10) || 0);
    });
  });

  container.querySelector('#btn-save-pkg').addEventListener('click', () => {
    const slipNum = document.getElementById('pkg-slip-input').value.trim() || pkgSlipNum;
    const date = document.getElementById('pkg-date-input').value.trim() || dateVal;
    const netWt = parseFloat(document.getElementById('pkg-net-wt').value) || netWtVal;
    const grossWt = parseFloat(document.getElementById('pkg-gross-wt').value) || grossWtVal;
    const dims = document.getElementById('pkg-dims-input').value.trim() || dimsVal;
    const carrier = document.getElementById('pkg-carrier-select').value;
    const wh = document.getElementById('pkg-wh-select').value;

    const pkgData = {
      id: `PKG-${slipNum}`,
      packageNumber: slipNum,
      date,
      soNumber: soNum,
      gnvNumber: isEdit ? pkg.gnvNumber : (sourceSo ? sourceSo.gnvNumber : 'GNV-2026-000001'),
      customerName,
      warehouseName: wh,
      packageType: document.getElementById('pkg-type-select').value,
      netWeight: netWt,
      grossWeight: grossWt,
      dimensions: dims,
      carrier,
      status: "Packed",
      items
    };

    store.savePackage(pkgData);
    alert(`Package ${slipNum} saved successfully!`);
    window.location.hash = '#packages';
  });
}
