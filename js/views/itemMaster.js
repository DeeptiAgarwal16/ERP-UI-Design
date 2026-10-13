/**
 * GNV COMMODITIES PVT. LTD. — ITEM MASTER MODULE
 */

import { store } from '../store.js';
import { exportToCSV } from '../pdfGenerator.js';

export function renderItemMaster(container) {
  let selectedBrand = 'ALL';
  let searchTerm = '';

  function render() {
    const d = store.data;
    let list = [...d.products];

    if (selectedBrand !== 'ALL') {
      list = list.filter(p => p.brand === selectedBrand);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">GNV Commodities</span>
            <span>/</span>
            <span class="breadcrumb-current">Item Master</span>
          </div>
          <h1 class="page-title">Central Product Catalogue</h1>
          <div class="page-desc">Comprehensive item registry covering Acana, Orijen, Inaba, Fabled, and GroomEssence.</div>
        </div>
        <div class="page-actions">
          <button id="btn-export-items" class="btn btn-outline">
            <i data-lucide="download"></i> Export CSV
          </button>
          <button id="btn-add-item" class="btn btn-primary">
            <i data-lucide="plus"></i> Add New Product
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-wrap">
            <input type="text" id="item-search" class="table-search-input" placeholder="Search by SKU, product name, category..." value="${searchTerm}">
          </div>
          <select id="brand-filter" class="form-select">
            <option value="ALL">All Brands (${d.products.length})</option>
            ${d.brands.map(b => `
              <option value="${b}" ${selectedBrand === b ? 'selected' : ''}>${b} (${d.products.filter(p => p.brand === b).length})</option>
            `).join('')}
          </select>
        </div>
        <div style="font-size: 12px; color: var(--secondary-text);">
          Showing <strong>${list.length}</strong> of ${d.products.length} products
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th style="width: 50px;">Icon</th>
                <th>SKU</th>
                <th>Product Name & Brand</th>
                <th>Weight / Pack</th>
                <th>Category</th>
                <th class="number-cell">MRP</th>
                <th class="number-cell">Selling Rate</th>
                <th class="number-cell">GST %</th>
                <th>HSN Code</th>
                <th>Batch Tracked</th>
                <th style="text-align: center;">Total Stock</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => {
                const totalStock = d.batches.filter(b => b.sku === p.sku).reduce((a, b) => a + b.availableQty, 0);

                return `
                  <tr>
                    <td style="font-size: 20px; text-align: center;">${p.image || '📦'}</td>
                    <td><strong>${p.sku}</strong></td>
                    <td>
                      <strong style="color: var(--deep-navy);">${p.name}</strong>
                      <br><small style="color: var(--secondary-text);">Brand: <strong>${p.brand}</strong></small>
                    </td>
                    <td>${p.weight}</td>
                    <td><span class="badge badge-draft">${p.category}</span></td>
                    <td class="number-cell">₹${p.mrp.toLocaleString('en-IN')}</td>
                    <td class="number-cell" style="font-weight: 700; color: var(--primary-blue);">
                      ₹${p.sellingRate.toLocaleString('en-IN')}
                    </td>
                    <td class="number-cell">${p.taxRate}%</td>
                    <td><code style="font-size: 11px;">${p.hsn}</code></td>
                    <td>
                      <span class="badge ${p.batchTracking ? 'badge-completed' : 'badge-draft'}">
                        ${p.batchTracking ? 'FEFO Active' : 'No'}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <strong style="color: ${totalStock > 0 ? 'var(--deep-navy)' : 'var(--error-red)'};">
                        ${totalStock}
                      </strong>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    const searchInput = container.querySelector('#item-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    const brandSelect = container.querySelector('#brand-filter');
    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        selectedBrand = e.target.value;
        render();
      });
    }

    const exportBtn = container.querySelector('#btn-export-items');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportToCSV('GNV_Item_Master.csv', d.products);
      });
    }

    const addBtn = container.querySelector('#btn-add-item');
    if (addBtn) {
      addBtn.addEventListener('click', openAddItemModal);
    }
  }

  function openAddItemModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalTitle = document.getElementById('global-modal-title');
    const modalBody = document.getElementById('global-modal-body');
    const modalFooter = document.getElementById('global-modal-footer');

    const d = store.data;

    modalTitle.innerHTML = `<i data-lucide="plus-circle" style="color: var(--primary-blue);"></i> Add New Product to Master`;
    modalBody.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">SKU Code <span class="req">*</span></label>
          <input type="text" id="new-item-sku" class="form-control" placeholder="e.g. ORJ-DOG-006">
        </div>
        <div class="form-group">
          <label class="form-label">Brand <span class="req">*</span></label>
          <select id="new-item-brand" class="form-control">
            ${d.brands.map(b => `<option value="${b}">${b}</option>`).join('')}
          </select>
        </div>
        <div class="form-group form-col-full">
          <label class="form-label">Product Name <span class="req">*</span></label>
          <input type="text" id="new-item-name" class="form-control" placeholder="e.g. Orijen Senior Dog Food — 2 kg">
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <input type="text" id="new-item-cat" class="form-control" value="Pet Food">
        </div>
        <div class="form-group">
          <label class="form-label">Weight / Pack Size</label>
          <input type="text" id="new-item-weight" class="form-control" placeholder="e.g. 2 kg">
        </div>
        <div class="form-group">
          <label class="form-label">MRP (₹)</label>
          <input type="number" id="new-item-mrp" class="form-control" value="3500">
        </div>
        <div class="form-group">
          <label class="form-label">Selling Rate (₹) <span class="req">*</span></label>
          <input type="number" id="new-item-rate" class="form-control" value="2800">
        </div>
        <div class="form-group">
          <label class="form-label">GST Tax Rate (%)</label>
          <select id="new-item-tax" class="form-control">
            <option value="5">5% (Merchandise)</option>
            <option value="12">12% (Treats / Bags)</option>
            <option value="18" selected>18% (Pet Food / Grooming)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">HSN Code</label>
          <input type="text" id="new-item-hsn" class="form-control" value="23091000">
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="document.getElementById('global-modal-backdrop').classList.remove('open')">Cancel</button>
      <button id="modal-confirm-add-item" class="btn btn-primary">Save Product</button>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalFooter.querySelector('#modal-confirm-add-item').addEventListener('click', () => {
      const sku = document.getElementById('new-item-sku').value.trim();
      const name = document.getElementById('new-item-name').value.trim();
      const brand = document.getElementById('new-item-brand').value;
      const rate = parseFloat(document.getElementById('new-item-rate').value) || 0;
      const mrp = parseFloat(document.getElementById('new-item-mrp').value) || 0;
      const taxRate = parseFloat(document.getElementById('new-item-tax').value) || 18;
      const weight = document.getElementById('new-item-weight').value || '1 kg';
      const cat = document.getElementById('new-item-cat').value || 'General';
      const hsn = document.getElementById('new-item-hsn').value || '23091000';

      if (!sku || !name) {
        alert("SKU and Name are mandatory.");
        return;
      }

      // Check unique SKU
      if (d.products.some(p => p.sku === sku)) {
        alert("SKU code already exists in catalog. Please use a unique SKU.");
        return;
      }

      const newProd = {
        sku,
        name,
        brand,
        category: cat,
        subcategory: "General",
        weight,
        barcode: `890${Date.now().toString().slice(-9)}`,
        mrp,
        sellingRate: rate,
        purchaseRate: Math.round(rate * 0.75),
        taxRate,
        hsn,
        reorderLevel: 30,
        batchTracking: true,
        expiryTracking: true,
        description: "New catalog product entry.",
        image: "📦"
      };

      d.products.unshift(newProd);
      store.logActivity("New Item Created in Master", sku, "N/A", "None", "Active", `Created ${name} (${brand})`);
      store.save(true);

      modalBackdrop.classList.remove('open');
      render();
    });

    modalBackdrop.classList.add('open');
  }

  render();
}
