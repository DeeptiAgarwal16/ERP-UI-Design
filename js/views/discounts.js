/**
 * GNV COMMODITIES PVT. LTD. — DISCOUNT MANAGEMENT & SIMULATOR MODULE
 * Modern Zoho-accurate pricing rules and real-time simulator
 */

import { store } from '../store.js';

export function renderDiscounts(container) {
  let activeTab = 'BASE'; // 'BASE' | 'SCHEME' | 'SIMULATOR'

  function render() {
    const d = store.data;

    container.innerHTML = `
      <div class="page-top-bar">
        <div>
          <div class="page-title">
            <i data-lucide="percent" style="color: #1366D9;"></i>
            <span>Commercial Discounts & Pricing Engine</span>
          </div>
          <div class="page-desc">
            Contracted base discounts, promotional scheme rules (Buy X Get Y), and real-time simulator.
          </div>
        </div>

        <div class="page-actions">
          <button class="btn btn-outline" id="btn-toggle-sim" onclick="const b = document.querySelector('[data-disc-tab=SIMULATOR]'); if (b) b.click();">
            <i data-lucide="calculator" style="width: 14px; height: 14px;"></i> Test Simulator
          </button>
        </div>
      </div>

      <!-- Modern Tabs Navigation -->
      <div class="tabs-container">
        <button class="tab-btn ${activeTab === 'BASE' ? 'active' : ''}" data-disc-tab="BASE">
          <i data-lucide="tag" style="width: 15px; height: 15px;"></i> Base Contract Margins (${d.baseDiscounts.length})
        </button>
        <button class="tab-btn ${activeTab === 'SCHEME' ? 'active' : ''}" data-disc-tab="SCHEME">
          <i data-lucide="gift" style="width: 15px; height: 15px;"></i> Scheme & Promotional Rules (${d.schemeDiscounts.length})
        </button>
        <button class="tab-btn ${activeTab === 'SIMULATOR' ? 'active' : ''}" data-disc-tab="SIMULATOR">
          <i data-lucide="calculator" style="width: 15px; height: 15px;"></i> Interactive Pricing Simulator
        </button>
      </div>

      <!-- Tab Content Area -->
      ${activeTab === 'BASE' ? renderBaseDiscounts(d) : activeTab === 'SCHEME' ? renderSchemeDiscounts(d) : renderSimulator(d)}
    `;

    if (window.lucide) window.lucide.createIcons();

    // Tab bindings
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-disc-tab');
        render();
      });
    });

    if (activeTab === 'SIMULATOR') {
      bindSimulatorEvents(container, d);
    }
  }

  function renderBaseDiscounts(d) {
    return `
      <!-- Brief Info Banner -->
      <div class="instruction-panel">
        <div class="instruction-content">
          <div class="instruction-icon"><i data-lucide="shield-check" style="width: 18px; height: 18px;"></i></div>
          <div>
            <div class="instruction-title">Layer 1: Base Contract Margins</div>
            <div class="instruction-text">
              Contracted distributor base discounts applied automatically when creating Sales Orders and Invoices.
            </div>
          </div>
        </div>
        <span class="badge badge-delivered">Active Engine</span>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>RULE NAME</th>
                <th>TARGET CUSTOMER / TIER</th>
                <th>BRAND</th>
                <th class="text-right">CONTRACT MARGIN</th>
                <th>VALIDITY WINDOW</th>
                <th>STATUS</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              ${d.baseDiscounts.map(b => `
                <tr>
                  <td>
                    <strong style="color: #0F172A;">${b.name}</strong>
                  </td>
                  <td>
                    <span class="badge badge-draft">${b.customerGroup || 'All Distributors'}</span>
                  </td>
                  <td>
                    <span class="badge badge-progress">${b.brand}</span>
                  </td>
                  <td class="text-right" style="font-weight: 700; color: #16A34A; font-size: 13.5px;">
                    ${b.discountPct}%
                  </td>
                  <td style="font-size: 11.5px; color: #64748B;">
                    ${b.effectiveFrom || '01-04-2026'} &bull; ${b.effectiveTo || '31-03-2027'}
                  </td>
                  <td>
                    <span class="badge badge-delivered">${b.status}</span>
                  </td>
                  <td style="font-size: 12px; color: #475569;">
                    ${b.remarks || 'Standard Distributor Contract'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSchemeDiscounts(d) {
    return `
      <!-- Brief Info Banner -->
      <div class="instruction-panel">
        <div class="instruction-content">
          <div class="instruction-icon"><i data-lucide="sparkles" style="width: 18px; height: 18px;"></i></div>
          <div>
            <div class="instruction-title">Layer 2: Scheme & Promotional Rules</div>
            <div class="instruction-text">
              Special incentives like <strong>Buy 11 Get 1 Free</strong> or volume rebates stacked seamlessly onto base margins.
            </div>
          </div>
        </div>
        <span class="badge badge-confirmed">Promotional Stack</span>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="erp-table">
            <thead>
              <tr>
                <th>SCHEME NAME & CODE</th>
                <th>TYPE</th>
                <th>MIN BUY CONDITION</th>
                <th>SCHEME BENEFIT</th>
                <th>STACKABLE</th>
                <th>VALIDITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${d.schemeDiscounts.map(s => `
                <tr>
                  <td>
                    <strong style="color: #0F172A;">${s.name}</strong>
                    <br><code style="font-size: 11px;">${s.code}</code>
                  </td>
                  <td>
                    <span class="badge badge-draft">${s.type}</span>
                  </td>
                  <td style="font-weight: 600;">
                    Min ${s.minQty || s.buyQty || 11} units of ${s.brand}
                  </td>
                  <td>
                    <span class="badge badge-pending" style="font-weight: 700;">
                      +${s.freeQty || 1} Free Unit(s)
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-delivered">YES (Layer 2)</span>
                  </td>
                  <td style="font-size: 11.5px; color: #64748B;">
                    ${s.validUntil || '31-12-2026'}
                  </td>
                  <td>
                    <span class="badge badge-delivered">${s.status || 'Active'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSimulator(d) {
    return `
      <div style="display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start;">
        
        <!-- Controls Pane -->
        <div class="card" style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">
            <i data-lucide="sliders" style="color: #1366D9;"></i>
            <h3 style="font-size: 14px; font-weight: 700; color: #0F172A;">Pricing Engine Parameters</h3>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Customer Account</label>
            <select id="sim-customer" class="form-control">
              ${d.customers.map(c => `
                <option value="${c.id}">${c.name} (${c.city})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Product / Brand</label>
            <select id="sim-product" class="form-control">
              ${d.products.map(p => `
                <option value="${p.sku}">${p.brand}: ${p.name} (${p.weight})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 18px;">
            <label class="form-label">Order Quantity (Units)</label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="number" id="sim-qty" min="1" max="1000" class="form-control" value="11" style="font-size: 15px; font-weight: 700; width: 100px;">
              <button class="btn btn-sm btn-outline" onclick="document.querySelector('#sim-qty').value = 11; document.querySelector('#sim-qty').dispatchEvent(new Event('input'));">
                Test 11 (Buy 11 Get 1)
              </button>
            </div>
            <small style="color: #64748B; font-size: 11px; margin-top: 4px;">
              Select Inaba product & 11 units to test Buy 11 Get 1 Free scheme.
            </small>
          </div>

          <button id="sim-calculate-btn" class="btn btn-primary" style="width: 100%;">
            <i data-lucide="play" style="width: 14px; height: 14px;"></i> Run Pricing Engine
          </button>
        </div>

        <!-- Real-Time Output Pane -->
        <div id="sim-results-pane">
          <!-- Populated by JS -->
        </div>

      </div>
    `;
  }

  function bindSimulatorEvents(container, d) {
    const custSel = container.querySelector('#sim-customer');
    const prodSel = container.querySelector('#sim-product');
    const qtyInput = container.querySelector('#sim-qty');
    const calcBtn = container.querySelector('#sim-calculate-btn');
    const resultsPane = container.querySelector('#sim-results-pane');

    function executeSimulation() {
      const custId = custSel.value;
      const sku = prodSel.value;
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

      const res = store.calculateLineFinancials(sku, qty, custId);
      if (!res) return;

      resultsPane.innerHTML = `
        <div class="card" style="padding: 22px;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 14px;">
            <div>
              <span class="badge badge-delivered">CALCULATION VERIFIED</span>
              <h3 style="font-size: 17px; font-weight: 800; color: #0F172A; margin-top: 4px;">
                ${res.productName}
              </h3>
              <div style="font-size: 12px; color: #64748B;">
                SKU: <strong>${res.sku}</strong> &bull; Brand: <strong>${res.brand}</strong> &bull; Pack: <strong>${res.weight}</strong>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 600;">Ordered Units</div>
              <div style="font-size: 24px; font-weight: 800; color: #0F172A;">${res.orderedQty} Nos.</div>
            </div>
          </div>

          <!-- Applied Incentives Banner -->
          <div style="background: ${res.freeQty > 0 || res.totalLineDiscount > 0 ? '#F0FDF4' : '#F8FAFC'}; border: 1px solid ${res.freeQty > 0 || res.totalLineDiscount > 0 ? '#86EFAC' : '#E2E8F0'}; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px;">
            <div style="font-size: 12.5px; font-weight: 700; color: #166534; margin-bottom: 4px;">
              Applied Incentives Breakdown:
            </div>
            <ul style="padding-left: 18px; font-size: 12px; color: #15803D; line-height: 1.6;">
              ${res.baseDiscountPct > 0 ? `<li><strong>Layer 1 Base Margin:</strong> ${res.baseDiscountPct}% (Contract savings: ₹${res.baseDiscountAmount.toFixed(2)})</li>` : '<li>No base contract discount.</li>'}
              ${res.schemeDiscountPct > 0 ? `<li><strong>Layer 2 Scheme Margin:</strong> ${res.schemeDiscountPct}% (Promotional savings: ₹${res.schemeDiscountAmount.toFixed(2)})</li>` : ''}
              ${res.freeQty > 0 ? `<li><strong>Promotional Free Stock:</strong> <span class="badge badge-pending">+${res.freeQty} Free Units</span> awarded automatically!</li>` : ''}
            </ul>
          </div>

          <!-- Financial Breakdown Table -->
          <table class="erp-table" style="margin-bottom: 18px;">
            <tbody>
              <tr>
                <td>Catalog Selling Rate</td>
                <td class="text-right">₹${Number(res.unitRate).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Gross Total (${res.orderedQty} × ₹${res.unitRate})</td>
                <td class="text-right">₹${Number(res.grossAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="color: #16A34A; font-weight: 600;">
                <td>Total Commercial Discount Applied</td>
                <td class="text-right">- ₹${Math.round(res.totalLineDiscount).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="font-weight: 600;">
                <td>Taxable Subtotal</td>
                <td class="text-right">₹${Math.round(res.taxableAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>GST (${res.isInterState ? `IGST ${res.igstRate}%` : `CGST ${res.cgstRate}% + SGST ${res.sgstRate}%`})</td>
                <td class="text-right">₹${Math.round(res.totalTax).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="background: #F8FAFC; border-top: 2px solid #E2E8F0;">
                <td style="font-size: 14px; font-weight: 800; color: #0F172A;">Final Net Payable (INR)</td>
                <td class="text-right" style="font-size: 16px; font-weight: 800; color: #1366D9;">
                  ₹${Math.round(res.lineTotal).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 10px;">
            <div>
              Effective Billed Unit Rate: <strong style="color: #0F172A;">₹${(res.lineTotal / res.orderedQty).toFixed(2)}</strong>
            </div>
            ${res.freeQty > 0 ? `
              <div>
                Effective Unit Rate (with Free Units): <strong style="color: #16A34A;">₹${(res.lineTotal / (res.orderedQty + res.freeQty)).toFixed(2)}</strong>
              </div>
            ` : ''}
          </div>

        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }

    if (calcBtn) calcBtn.addEventListener('click', executeSimulation);
    if (custSel) custSel.addEventListener('change', executeSimulation);
    if (prodSel) prodSel.addEventListener('change', executeSimulation);
    if (qtyInput) qtyInput.addEventListener('input', executeSimulation);

    executeSimulation();
  }

  render();
}
