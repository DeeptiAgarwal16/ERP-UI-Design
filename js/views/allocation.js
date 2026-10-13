/**
 * GNV COMMODITIES PVT. LTD. — ORDER ALLOCATION & FULFILMENT WORKSPACE
 * Executive Stacked Multi-Product Allocation across 4 Regional Hubs
 * (Chennai, Mumbai, Kolkata, Noida) with Auto-Best-FEFO Pre-Allocation.
 */

import { store } from '../store.js';

export function renderAllocation(container, targetOrderId = null) {
  const d = store.data;

  // Selected Order
  let selectedOrderId = targetOrderId || "SO-10025";
  let selectedOrder = d.salesOrders.find(o => o.id === selectedOrderId || o.soNumber === selectedOrderId)
    || d.salesOrders[0];

  if (!selectedOrder) {
    container.innerHTML = `<div class="card" style="padding: 30px; text-align: center;">No orders available for allocation.</div>`;
    return;
  }

  const hubs = ["Mumbai", "Chennai", "Noida", "Kolkata"];

  // Allocation state: { [sku]: { [hubName]: allocatedQty } }
  let allocationMatrix = {};
  let searchTerm = '';

  // Find customer
  function getCustomer() {
    return d.customers.find(c => c.id === selectedOrder.customerId) || {
      name: selectedOrder.customerName || "Customer",
      city: selectedOrder.city || "Mumbai",
      state: selectedOrder.state || "Maharashtra",
      billingAddress: selectedOrder.billingAddress || (selectedOrder.city + ", " + selectedOrder.state),
      creditLimit: 500000,
      currentCreditUsed: 185000,
      paymentTerms: selectedOrder.paymentTerms || "PostPaid 30D",
      gstin: "27AABCM8821K1Z3",
      contactPerson: "Ramesh Parekh",
      phone: "+91 98201 11223"
    };
  }

  // Get items for selected order (ensuring at least items exist)
  function getOrderItems() {
    if (selectedOrder.items && selectedOrder.items.length > 0) {
      return selectedOrder.items;
    }
    return [
      {
        sku: "ORJ-DOG-001",
        name: "Orijen Original Dog Food — 2 kg",
        weight: "2 kg",
        orderedQty: 5,
        unitRate: 3200
      }
    ];
  }

  // Automatically calculate the optimal FEFO + proximity allocation
  function calculateBestCombination() {
    allocationMatrix = {};
    const items = getOrderItems();
    const cust = getCustomer();
    const rankedHubs = store.getWarehouseRankings(cust.city || "Mumbai");

    items.forEach(item => {
      const demand = Number(item.orderedQty || item.qty || 1);
      allocationMatrix[item.sku] = {
        "Mumbai": 0,
        "Chennai": 0,
        "Noida": 0,
        "Kolkata": 0
      };

      let remainingDemand = demand;

      // Prioritize closest warehouses first
      for (const ranked of rankedHubs) {
        if (remainingDemand <= 0) break;
        const hubName = ranked.name || ranked.city;
        const batches = store.getBatchesForProduct(item.sku, hubName);
        const avail = batches.reduce((sum, b) => sum + (Number(b.availableQty) || 0), 0);

        if (avail > 0) {
          const alloc = Math.min(remainingDemand, avail);
          allocationMatrix[item.sku][hubName] = alloc;
          remainingDemand -= alloc;
        }
      }

      // If still demand remains, fallback to any available hub
      if (remainingDemand > 0) {
        for (const h of hubs) {
          if (remainingDemand <= 0) break;
          const batches = store.getBatchesForProduct(item.sku, h);
          const avail = batches.reduce((sum, b) => sum + (Number(b.availableQty) || 0), 0);
          const currentAlloc = allocationMatrix[item.sku][h] || 0;
          const canTake = Math.max(0, avail - currentAlloc);
          if (canTake > 0) {
            const alloc = Math.min(remainingDemand, canTake);
            allocationMatrix[item.sku][h] += alloc;
            remainingDemand -= alloc;
          }
        }
      }
    });
  }

  // Initialize with best combination on load
  calculateBestCombination();

  function render() {
    const cust = getCustomer();
    const items = getOrderItems();
    const rankedHubs = store.getWarehouseRankings(cust.city || "Mumbai");
    const closestHubName = rankedHubs[0]?.name || "Mumbai";

    // Global totals across all products
    let totalOrderDemand = 0;
    let totalAllocatedAcrossAll = 0;

    items.forEach(it => {
      const dem = Number(it.orderedQty || it.qty || 1);
      totalOrderDemand += dem;
      const allocMap = allocationMatrix[it.sku] || {};
      const allocSum = Object.values(allocMap).reduce((a, b) => a + Number(b || 0), 0);
      totalAllocatedAcrossAll += allocSum;
    });

    const totalBalanceSSO = Math.max(0, totalOrderDemand - totalAllocatedAcrossAll);
    const allocPct = totalOrderDemand > 0 ? Math.round((totalAllocatedAcrossAll / totalOrderDemand) * 100) : 0;

    // Credit metrics
    const creditLimit = Number(cust.creditLimit || 500000);
    const creditUsed = Number(cust.currentCreditUsed || 185000);
    const creditAvail = Math.max(0, creditLimit - creditUsed);
    const creditPct = Math.min(100, Math.round((creditUsed / creditLimit) * 100));

    // Child Orders Breakdown
    const childOrdersMap = {};
    hubs.forEach(h => {
      let qty = 0;
      let amt = 0;
      items.forEach(it => {
        const q = allocationMatrix[it.sku]?.[h] || 0;
        if (q > 0) {
          qty += q;
          amt += q * Number(it.unitRate || 1000);
        }
      });
      if (qty > 0) {
        childOrdersMap[h] = { qty, amt };
      }
    });

    const filteredOrders = d.salesOrders.filter(so =>
      so.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (so.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (so.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    container.innerHTML = `
      <div class="split-view-container">
        
        <!-- Left List Column: Sales Orders Selection Panel -->
        <div class="split-list-pane">
          <div class="split-list-header">
            <div>
              <div class="split-list-title">Sales Orders (${d.salesOrders.length})</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Select order to allocate</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#sales-orders/new'" title="Create new sales order">
              <i data-lucide="plus"></i> New
            </button>
          </div>

          <div class="split-list-search">
            <input type="text" id="alloc-so-search" class="split-search-input" placeholder="Search orders, customers..." value="${searchTerm}">
          </div>

          <div class="split-list-body">
            ${filteredOrders.map(so => `
              <div class="split-item-row ${so.id === selectedOrder.id || so.soNumber === selectedOrder.soNumber ? 'active' : ''}" data-so-id="${so.id}">
                <div class="split-item-top">
                  <span class="split-item-customer">${so.customerName}</span>
                  <span class="split-item-amount">₹${Number(so.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
                <div class="split-item-meta">
                  <span>${so.soNumber} &bull; ${(so.items || []).length} Products</span>
                  <span class="badge ${so.overallStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-draft'}">
                    ${so.overallStatus ? so.overallStatus.toUpperCase() : 'CONFIRMED'}
                  </span>
                </div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 5px; display: flex; justify-content: space-between;">
                  <span>Hub: <strong style="color: #475569;">${so.city || 'Mumbai'}</strong></span>
                  <span style="color: var(--primary-blue); font-weight: 700;">${so.totalQty || 10} Units</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Allocation Detail Column -->
        <div class="split-detail-pane">
          
          <!-- Detail Top Action Toolbar -->
          <div class="detail-top-toolbar">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="gnv-tag" onclick="window.location.hash='#gnv-group/${selectedOrder.gnvNumber}'" title="GNV Batch Group">${selectedOrder.gnvNumber}</span>
              <div>
                <strong style="font-size: 15px; color: #0F172A;">${selectedOrder.soNumber}</strong>
                <span style="font-size: 12.5px; color: #64748B; margin-left: 6px;">&bull; ${selectedOrder.customerName}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-outline btn-sm" id="btn-recalc-best">
                <i data-lucide="zap" style="color: #F59E0B;"></i> Auto Best-FEFO Split
              </button>
              <button class="btn btn-outline btn-sm" id="btn-reset-alloc">
                <i data-lucide="rotate-ccw"></i> Reset to 0
              </button>
              <button class="btn btn-primary btn-sm" id="btn-execute-alloc">
                <i data-lucide="check-circle-2"></i> Confirm & Execute (${totalAllocatedAcrossAll} Units)
              </button>
            </div>
          </div>

          <!-- Scrollable Allocation Deck -->
          <div class="detail-scroll-area">
            
            <!-- TOP TWO PANELS: CUSTOMER DETAILS (LEFT) & ORDER OVERVIEW (RIGHT) -->
            <div class="alloc-top-deck">
              
              <!-- LEFT PANEL: CUSTOMER PROFILE & CREDIT DETAILS -->
              <div class="alloc-customer-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <span class="badge badge-delivered" style="font-size: 10px; margin-bottom: 4px;">Verified Customer Account</span>
                    <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 2px 0;">${cust.name}</h3>
                    <div style="font-size: 12px; color: #64748B;">
                      <i data-lucide="map-pin" style="width: 13px; height: 13px; display: inline-block; vertical-align: middle;"></i>
                      ${cust.billingAddress || (cust.city + ", " + cust.state)}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <span class="badge badge-progress" style="font-size: 11px;">${cust.paymentTerms || 'PostPaid 30D'}</span>
                    <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">GST: ${cust.gstin || 'Unregistered'}</div>
                  </div>
                </div>

                <!-- Credit Limit Indicator -->
                <div class="customer-credit-bar-wrap">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span style="color: #475569;">Credit Exposure: <strong style="color: #0F172A;">₹${creditUsed.toLocaleString('en-IN')}</strong> used</span>
                    <span style="color: #10B981;">Available: ₹${creditAvail.toLocaleString('en-IN')} / Limit: ₹${creditLimit.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="credit-bar-track">
                    <div class="credit-bar-fill" style="width: ${creditPct}%;"></div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 10px; margin-top: 12px; font-size: 12px; color: #64748B;">
                  <div>Contact: <strong style="color: #1E293B;">${cust.contactPerson || 'Purchasing Team'}</strong> (${cust.phone || 'N/A'})</div>
                  <div>Destination Hub: <strong style="color: var(--primary-blue);">${closestHubName}</strong></div>
                </div>
              </div>

              <!-- RIGHT PANEL: ORDER SUMMARY & COUNTERS -->
              <div class="alloc-control-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Active Order Selected</span>
                  <span class="badge badge-delivered" style="font-size: 10px;">Ready to Allocate</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px;">
                  <div>
                    <strong style="color: var(--primary-blue); font-size: 14.5px;">${selectedOrder.soNumber}</strong>
                    <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                      ${selectedOrder.customerName} &bull; ${(selectedOrder.items || []).length} Products &bull; Total: ₹${Number(selectedOrder.grandTotal || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span class="badge ${selectedOrder.overallStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-draft'}" style="font-size: 11px;">
                    ${selectedOrder.overallStatus ? selectedOrder.overallStatus.toUpperCase() : 'CONFIRMED'}
                  </span>
                </div>

                <!-- 3 Allocation Counters -->
                <div class="alloc-counters-row">
                  <div class="alloc-counter-box">
                    <div class="alloc-counter-label">Total Demand</div>
                    <div class="alloc-counter-num">${totalOrderDemand} <span style="font-size: 12px; font-weight: 600; color: #64748B;">Units</span></div>
                  </div>
                  <div class="alloc-counter-box" style="border-color: #A7F3D0; background: #F0FDF4;">
                    <div class="alloc-counter-label" style="color: #065F46;">Allocated across 4 Hubs</div>
                    <div class="alloc-counter-num" style="color: #10B981;">${totalAllocatedAcrossAll} <span style="font-size: 12px; font-weight: 600;">(${allocPct}%)</span></div>
                  </div>
                  <div class="alloc-counter-box" style="${totalBalanceSSO > 0 ? 'border-color: #FDE68A; background: #FFFDF5;' : ''}">
                    <div class="alloc-counter-label" style="${totalBalanceSSO > 0 ? 'color: #B45309;' : ''}">Draft Balance SSO</div>
                    <div class="alloc-counter-num" style="${totalBalanceSSO > 0 ? 'color: #D97706;' : ''}">${totalBalanceSSO} <span style="font-size: 12px; font-weight: 600; color: #64748B;">Units</span></div>
                  </div>
                </div>
              </div>

            </div>

        <!-- MAIN SECTION: WAREHOUSE-WISE PRODUCT ALLOCATION -->
        <div class="alloc-warehouses-stack">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h2 style="font-size: 17px; font-weight: 800; color: #1E293B; letter-spacing: -0.3px; margin: 0;">
                Warehouse-wise Product Allocation
              </h2>
              <div style="font-size: 12px; color: #64748B; margin-top: 3px;">
                Fulfillment centers across 4 regional hubs with FEFO batch assignment.
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="badge badge-primary" style="font-size: 11px;">${hubs.length} Regional Hubs</span>
              <span class="badge badge-delivered" style="font-size: 11px;">${items.length} Order Products</span>
            </div>
          </div>

          <!-- Order Items Overall Fulfilment Status -->
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px 18px; margin-bottom: 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="layers" style="color: var(--primary-blue); width: 17px; height: 17px;"></i>
              <span style="font-size: 13px; font-weight: 700; color: #1E293B;">Order Items Fulfilment Status:</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${items.map(it => {
                const itDemand = Number(it.orderedQty || it.qty || 1);
                const itAllocMap = allocationMatrix[it.sku] || {};
                const itAllocSum = Object.values(itAllocMap).reduce((a, b) => a + Number(b || 0), 0);
                const isDone = itAllocSum === itDemand;
                const isOver = itAllocSum > itDemand;
                return `
                  <div style="display: inline-flex; align-items: center; gap: 6px; background: #F8FAFC; border: 1px solid ${isDone ? '#A7F3D0' : isOver ? '#FECACA' : '#E2E8F0'}; border-radius: 8px; padding: 4px 10px; font-size: 11.5px;">
                    <strong style="color: #1E293B;">${it.name.split('—')[0].trim()}</strong>
                    <span class="badge ${isDone ? 'badge-delivered' : isOver ? 'badge-cancelled' : 'badge-pending'}" style="font-size: 10px; padding: 2px 6px;">
                      ${itAllocSum}/${itDemand}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${hubs.map(hubName => {
            const whObj = d.warehouses?.find(w => w.name === hubName || w.city === hubName) || {};
            const isPrimary = hubName === closestHubName;

            // Total units allocated from this hub across all products
            let hubTotalAlloc = 0;
            items.forEach(it => {
              hubTotalAlloc += Number(allocationMatrix[it.sku]?.[hubName] || 0);
            });

            const hubCode = hubName.slice(0, 3).toUpperCase();

            return `
              <!-- WAREHOUSE CARD -->
              <div class="alloc-warehouse-card ${hubTotalAlloc > 0 ? 'active-hub' : ''}">
                
                <!-- Warehouse Header (No Distance) -->
                <div class="alloc-warehouse-header" style="background: ${hubTotalAlloc > 0 ? '#F8FAFC' : '#FCFDFE'};">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 42px; height: 42px; border-radius: 12px; background: ${hubTotalAlloc > 0 ? '#EFF6FF' : '#F1F5F9'}; color: ${hubTotalAlloc > 0 ? 'var(--primary-blue)' : '#64748B'}; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                      <i data-lucide="building-2"></i>
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <h3 style="font-size: 15.5px; font-weight: 800; color: #0F172A; margin: 0;">${hubName} Regional Hub</h3>
                        ${isPrimary ? '<span class="badge badge-delivered" style="font-size: 10px; padding: 2px 7px;">Primary Hub</span>' : ''}
                        <span class="gnv-tag" style="font-size: 10px; padding: 2px 6px;">${whObj.code || `WH-${hubCode}`}</span>
                      </div>
                      <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">
                        ${whObj.displayName || (hubName + ' Central Hub')} &bull; In-charge: <strong>${whObj.manager || 'Operations Lead'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 6px 12px; font-size: 12px; text-align: right;">
                      <span style="color: #64748B;">Allocated from this Hub:</span>
                      <strong style="color: ${hubTotalAlloc > 0 ? 'var(--primary-blue)' : '#64748B'}; font-size: 14px; margin-left: 6px;">${hubTotalAlloc} Units</strong>
                    </div>

                    ${hubTotalAlloc > 0 ? `
                      <span class="badge badge-progress" style="font-size: 11px; padding: 6px 10px;">
                        <i data-lucide="check" style="width: 12px; height: 12px; margin-right: 4px;"></i> Child SO: ${selectedOrder.soNumber}-${hubCode}
                      </span>
                    ` : `
                      <span style="font-size: 11.5px; color: #94A3B8;">0 units</span>
                    `}
                  </div>
                </div>

                <!-- Products Table inside this Warehouse -->
                <div class="table-responsive">
                  <table class="alloc-locations-table">
                    <thead>
                      <tr>
                        <th style="width: 28%;">PRODUCT & SPECIFICATION</th>
                        <th style="width: 16%;">BATCH NUMBER</th>
                        <th style="width: 14%;">EXPIRY & DAYS</th>
                        <th style="width: 12%; text-align: center;">ORDER DEMAND</th>
                        <th style="width: 10%; text-align: center;">AVAILABLE</th>
                        <th style="width: 12%; text-align: center;">ALLOCATED QTY</th>
                        <th style="width: 8%; text-align: right;">REMAINING</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.map(item => {
                        const batches = store.getBatchesForProduct(item.sku, hubName);
                        const primaryBatch = batches[0] || {
                          batchNumber: `${hubCode}-LOT-2601`,
                          expiryDate: '15-10-2027',
                          daysToExpiry: 365,
                          rackLocation: 'Section A-1'
                        };

                        const availStock = batches.reduce((sum, b) => sum + (Number(b.availableQty) || 0), 0);
                        const currentAlloc = Number(allocationMatrix[item.sku]?.[hubName] || 0);
                        const remainingInHub = Math.max(0, availStock - currentAlloc);
                        const itemDemand = Number(item.orderedQty || item.qty || 1);

                        // Total allocated across all hubs for this product
                        const itemTotalAlloc = Object.values(allocationMatrix[item.sku] || {}).reduce((a, b) => a + Number(b || 0), 0);

                        // Expiry days & tiers (SE <= 180, NSE 181-270, FRS > 270)
                        const days = Number(primaryBatch.daysToExpiry) || 200;
                        const isShortExpiry = days <= 180;

                        let tierCode = "FRS";
                        let tierColor = "#15803D";
                        let tierBg = "#DCFCE7";
                        let tierBorder = "#86EFAC";

                        if (days <= 180) {
                          tierCode = "SE";
                          tierColor = "#DC2626";
                          tierBg = "#FEE2E2";
                          tierBorder = "#FCA5A5";
                        } else if (days <= 270) {
                          tierCode = "NSE";
                          tierColor = "#B45309";
                          tierBg = "#FEF3C7";
                          tierBorder = "#FDE68A";
                        }

                        return `
                          <tr class="${isShortExpiry ? 'short-expiry-row' : (currentAlloc > 0 ? 'active-alloc-row' : '')}">
                            
                            <!-- Product Details -->
                            <td>
                              <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${item.name}</div>
                              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                                SKU: <strong style="color: #334155;">${item.sku}</strong> &bull; Size: <strong>${item.weight || 'Standard'}</strong>
                              </div>
                            </td>

                            <!-- Batch Number -->
                            <td>
                              <span style="font-weight: 700; color: var(--primary-blue); font-size: 12.5px;">${primaryBatch.batchNumber}</span>
                              <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">Rack: ${primaryBatch.rackLocation || 'Bay A-01'}</div>
                            </td>

                            <!-- Expiry Date & Days with SE, NSE, FRS -->
                            <td>
                              <div style="font-weight: 600; font-size: 12px; color: #1E293B;">${primaryBatch.expiryDate}</div>
                              <div style="margin-top: 3px;">
                                <span style="font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: ${tierBg}; color: ${tierColor}; border: 1px solid ${tierBorder}; display: inline-block;">
                                  ${days} Days &bull; ${tierCode}
                                </span>
                              </div>
                            </td>

                            <!-- Order Demand -->
                            <td style="text-align: center;">
                              <span style="font-size: 13px; font-weight: 800; color: #1E293B;">
                                ${itemDemand} Units
                              </span>
                              <div style="font-size: 10.5px; color: ${itemTotalAlloc === itemDemand ? '#10B981' : itemTotalAlloc > itemDemand ? '#EF4444' : '#64748B'};">
                                (Total: ${itemTotalAlloc}/${itemDemand})
                              </div>
                            </td>

                            <!-- Available Stock -->
                            <td style="text-align: center;">
                              <span style="font-size: 13.5px; font-weight: 800; color: ${availStock > 0 ? '#10B981' : '#94A3B8'};">
                                ${availStock}
                              </span>
                              <div style="font-size: 10px; color: #94A3B8;">Units</div>
                            </td>

                            <!-- Stepper Input (Clean - / + without +1, +2, Fill pills) -->
                            <td style="text-align: center;">
                              <div class="stepper-control">
                                <button type="button" class="stepper-btn btn-dec" data-sku="${item.sku}" data-hub="${hubName}" ${currentAlloc <= 0 ? 'disabled' : ''}>-</button>
                                <input type="number" min="0" max="${availStock}" class="stepper-input alloc-input-box" data-sku="${item.sku}" data-hub="${hubName}" value="${currentAlloc}">
                                <button type="button" class="stepper-btn btn-inc" data-sku="${item.sku}" data-hub="${hubName}" ${currentAlloc >= availStock ? 'disabled' : ''}>+</button>
                              </div>
                            </td>

                            <!-- Remaining Stock -->
                            <td style="text-align: right;">
                              <strong style="color: ${remainingInHub > 0 ? '#0F172A' : '#EF4444'}; font-size: 13px;">
                                ${remainingInHub}
                              </strong>
                              <div style="font-size: 10.5px; color: #94A3B8;">Left</div>
                            </td>

                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- BOTTOM PREVIEW DRAWER: GENERATED CHILD ORDERS -->
        <div class="card" style="margin-top: 24px; padding: 22px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i data-lucide="git-branch" style="color: var(--primary-blue);"></i>
              <strong style="font-size: 15px; color: #0F172A;">Generated Child Sales Orders Preview</strong>
            </div>
            <span class="badge badge-delivered" style="font-size: 11px;">Live Calculation</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            ${Object.keys(childOrdersMap).map(hubName => {
              const info = childOrdersMap[hubName];
              const code = hubName.slice(0, 3).toUpperCase();
              return `
                <div class="child-so-preview-card">
                  <div>
                    <strong style="color: var(--primary-blue); font-size: 13.5px;">${selectedOrder.soNumber}-${code}</strong>
                    <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">${hubName} Regional Hub</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 14px; color: #0F172A;">${info.qty} Units</div>
                    <div style="font-size: 11.5px; color: #10B981; font-weight: 700;">₹${Math.round(info.amt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              `;
            }).join('')}

            ${totalBalanceSSO > 0 ? `
              <div class="child-so-preview-card is-bal">
                <div>
                  <strong style="color: #B45309; font-size: 13.5px;">${selectedOrder.soNumber}-BAL</strong>
                  <div style="font-size: 11.5px; color: #92400E; margin-top: 2px;">Balance Backorder SSO</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 14px; color: #B45309;">${totalBalanceSSO} Units</div>
                  <div style="font-size: 11px; color: #B45309;">Awaiting Inward</div>
                </div>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px; border-top: 1px solid #F1F5F9; padding-top: 14px;">
            <button class="btn btn-outline" onclick="window.location.hash='#sales-orders'">Back to Sales Orders</button>
            <button class="btn btn-primary" id="btn-execute-alloc-bottom">
              <i data-lucide="check"></i> Confirm & Execute Allocation (${totalAllocatedAcrossAll} Units)
            </button>
          </div> <!-- end detail-scroll-area -->
        </div> <!-- end split-detail-pane -->
      </div> <!-- end split-view-container -->
    `;

    if (window.lucide) window.lucide.createIcons();

    // Bind Left List Row Clicks (Order Selection)
    container.querySelectorAll('.split-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const soId = row.getAttribute('data-so-id');
        selectedOrderId = soId;
        selectedOrder = d.salesOrders.find(o => o.id === soId || o.soNumber === soId) || selectedOrder;
        calculateBestCombination();
        render();
      });
    });

    // Bind Search in Left Panel
    const searchInput = container.querySelector('#alloc-so-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        const listBody = container.querySelector('.split-list-body');
        if (listBody) {
          const matches = d.salesOrders.filter(so =>
            so.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (so.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (so.city || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
          listBody.innerHTML = matches.map(so => `
            <div class="split-item-row ${so.id === selectedOrder.id || so.soNumber === selectedOrder.soNumber ? 'active' : ''}" data-so-id="${so.id}">
              <div class="split-item-top">
                <span class="split-item-customer">${so.customerName}</span>
                <span class="split-item-amount">₹${Number(so.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
              </div>
              <div class="split-item-meta">
                <span>${so.soNumber} &bull; ${(so.items || []).length} Products</span>
                <span class="badge ${so.overallStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-draft'}">
                  ${so.overallStatus ? so.overallStatus.toUpperCase() : 'CONFIRMED'}
                </span>
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 5px; display: flex; justify-content: space-between;">
                <span>Hub: <strong style="color: #475569;">${so.city || 'Mumbai'}</strong></span>
                <span style="color: var(--primary-blue); font-weight: 700;">${so.totalQty || 10} Units</span>
              </div>
            </div>
          `).join('');

          listBody.querySelectorAll('.split-item-row').forEach(row => {
            row.addEventListener('click', () => {
              const soId = row.getAttribute('data-so-id');
              selectedOrderId = soId;
              selectedOrder = d.salesOrders.find(o => o.id === soId || o.soNumber === soId) || selectedOrder;
              calculateBestCombination();
              render();
            });
          });
        }
      });
    }

    // Bind Recalculate Best FEFO
    container.querySelector('#btn-recalc-best')?.addEventListener('click', () => {
      calculateBestCombination();
      store.addToast(`Applied optimal FEFO + proximity allocation for ${items.length} products!`);
      render();
    });

    // Bind Reset
    container.querySelector('#btn-reset-alloc')?.addEventListener('click', () => {
      items.forEach(it => {
        allocationMatrix[it.sku] = { "Mumbai": 0, "Chennai": 0, "Noida": 0, "Kolkata": 0 };
      });
      render();
    });

    // Steppers: Decrement (-)
    container.querySelectorAll('.btn-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const hub = btn.getAttribute('data-hub');
        if (allocationMatrix[sku] && allocationMatrix[sku][hub] > 0) {
          allocationMatrix[sku][hub] -= 1;
          render();
        }
      });
    });

    // Steppers: Increment (+)
    container.querySelectorAll('.btn-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const hub = btn.getAttribute('data-hub');
        const batches = store.getBatchesForProduct(sku, hub);
        const avail = batches.reduce((sum, b) => sum + (Number(b.availableQty) || 0), 0);
        if (!allocationMatrix[sku]) allocationMatrix[sku] = { "Mumbai": 0, "Chennai": 0, "Noida": 0, "Kolkata": 0 };
        if (allocationMatrix[sku][hub] < avail) {
          allocationMatrix[sku][hub] += 1;
          render();
        }
      });
    });

    // Stepper Input change
    container.querySelectorAll('.alloc-input-box').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const sku = inp.getAttribute('data-sku');
        const hub = inp.getAttribute('data-hub');
        const batches = store.getBatchesForProduct(sku, hub);
        const avail = batches.reduce((sum, b) => sum + (Number(b.availableQty) || 0), 0);
        let val = Math.max(0, parseInt(e.target.value) || 0);
        val = Math.min(val, avail);
        if (!allocationMatrix[sku]) allocationMatrix[sku] = { "Mumbai": 0, "Chennai": 0, "Noida": 0, "Kolkata": 0 };
        allocationMatrix[sku][hub] = val;
      });
      inp.addEventListener('change', () => {
        render();
      });
    });

    // Confirm & Execute Allocation
    const handleExecute = () => {
      // Execute multi-item multi-hub allocation in store
      const allocSummary = {};
      items.forEach(it => {
        hubs.forEach(h => {
          const q = allocationMatrix[it.sku]?.[h] || 0;
          if (q > 0) {
            allocSummary[h] = (allocSummary[h] || 0) + q;
          }
        });
      });

      store.executeAllocation(selectedOrder.id, allocSummary);
      store.addToast(`Successfully allocated ${totalAllocatedAcrossAll} units across regional hubs! Child SOs generated.`);
      window.location.hash = `#gnv-group/${selectedOrder.gnvNumber}`;
    };

    container.querySelector('#btn-execute-alloc')?.addEventListener('click', handleExecute);
    container.querySelector('#btn-execute-alloc-bottom')?.addEventListener('click', handleExecute);
  }

  render();
}
