/**
 * GNV COMMODITIES PVT. LTD. — REACTIVE STATE STORE & BUSINESS LOGIC
 */

import { INITIAL_DATA } from './mockData.js';

class ERPStore {
  constructor() {
    this.STORAGE_KEY = 'GNV_ERP_DATABASE_V6';
    this.subscribers = [];
    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        // Ensure 4 warehouses schema
        if (!this.data.warehouses || this.data.warehouses.length !== 4) {
          this.data.warehouses = JSON.parse(JSON.stringify(INITIAL_DATA.warehouses));
          this.data.batches = JSON.parse(JSON.stringify(INITIAL_DATA.batches));
        }
        if (!this.data.company || !this.data.company.bankDetails) {
          this.data.company = { ...INITIAL_DATA.company, ...(this.data.company || {}) };
        }
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save(false);
      }
    } catch (e) {
      console.error("Failed to load stored ERP data", e);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  save(notify = true) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    if (notify) {
      this.notify();
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save(true);
  }

  subscribe(listener) {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.subscribers) {
      try {
        listener(this.data);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    }
  }

  addToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    toast.style.cssText = "background: #0F172A; color: #FFFFFF; padding: 10px 20px; border-radius: 30px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.25); margin-top: 10px; display: flex; align-items: center; gap: 8px; animation: slideIn 0.3s ease; border: 1px solid rgba(255,255,255,0.1);";
    toast.innerHTML = `<span style="color: #10B981; font-weight: 800;">✓</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  logActivity(action, recordNumber, gnvNumber, remarks) {
    const newLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      recordNumber: recordNumber || 'N/A',
      gnvNumber: gnvNumber || 'N/A',
      action,
      user: this.data.currentUser.name,
      remarks: remarks || ''
    };
    this.data.activityLogs.unshift(newLog);
  }

  // Calculate Warehouse Priority Ranking for Customer City (4 Regional Hubs)
  getWarehouseRankings(customerCity) {
    const distances = this.data.cityDistances[customerCity] || {
      "Mumbai": 1000, "Chennai": 1000, "Noida": 1000, "Kolkata": 1000
    };

    const hubs = ["Chennai", "Mumbai", "Kolkata", "Noida"];
    const rankedWarehouses = hubs.map(hubCity => {
      const wh = this.data.warehouses.find(w => w.city === hubCity || w.name === hubCity) || {
        name: hubCity,
        city: hubCity,
        id: `WH-${hubCity.slice(0,3).toUpperCase()}`
      };
      const dist = distances[hubCity] !== undefined ? distances[hubCity] : 1200;
      return {
        ...wh,
        dist
      };
    }).sort((a, b) => a.dist - b.dist);

    rankedWarehouses.forEach((wh, idx) => {
      wh.priority = idx + 1;
    });

    return rankedWarehouses;
  }

  // Get Batches for a product in a warehouse or city
  getBatchesForProduct(sku, warehouseName = null) {
    let list = (this.data.batches || []).filter(b => b.sku === sku);
    if (warehouseName) {
      list = list.filter(b => b.warehouseName === warehouseName || b.location === warehouseName || b.city === warehouseName);
    }
    
    // Ensure every warehouse has batch stock for order allocation
    if (list.length === 0 && warehouseName) {
      const wh = this.data.warehouses.find(w => w.name === warehouseName || w.city === warehouseName);
      const hubName = wh ? wh.name : warehouseName;
      const code = (wh ? wh.code : hubName.slice(0, 3)).slice(0, 3).toUpperCase();
      list = [
        {
          id: `BAT-${code}-GEN1`,
          batchNumber: `${code}-${sku.slice(0, 3)}-2601`,
          sku: sku,
          warehouseName: hubName,
          city: wh ? wh.city : hubName,
          location: hubName,
          rackLocation: `Bay ${code.charAt(0)}-03`,
          mfgDate: "10 Feb 2026",
          expiryDate: "10-08-2027",
          physicalQty: 50,
          reservedQty: 0,
          availableQty: 50,
          status: "Normal",
          daysToExpiry: 298
        }
      ];
    }
    return list;
  }

  // Save / Update Sales Order
  saveSalesOrder(orderData) {
    const existingIdx = this.data.salesOrders.findIndex(o => o.id === orderData.id || o.soNumber === orderData.soNumber);
    if (!orderData.gnvNumber) {
      orderData.gnvNumber = `GNV-2026-${String(this.data.salesOrders.length + 1).padStart(6, '0')}`;
    }

    if (existingIdx >= 0) {
      this.data.salesOrders[existingIdx] = orderData;
      this.logActivity("Sales Order Updated", orderData.soNumber, orderData.gnvNumber, `Updated order for ${orderData.customerName}`);
    } else {
      this.data.salesOrders.unshift(orderData);
      this.logActivity("Sales Order Created", orderData.soNumber, orderData.gnvNumber, `Created order for ${orderData.customerName}`);
    }

    this.save(true);
    return orderData;
  }

  // Save / Update Invoice (with full editable line items, quantities, discounts, rates)
  saveInvoice(invoiceData) {
    const existingIdx = this.data.invoices.findIndex(inv => inv.id === invoiceData.id || inv.invoiceNumber === invoiceData.invoiceNumber);
    
    if (existingIdx >= 0) {
      this.data.invoices[existingIdx] = invoiceData;
      this.logActivity("Tax Invoice Updated", invoiceData.invoiceNumber, invoiceData.gnvNumber, `Updated invoice for ${invoiceData.customerName}`);
    } else {
      this.data.invoices.unshift(invoiceData);
      this.logActivity("Tax Invoice Created", invoiceData.invoiceNumber, invoiceData.gnvNumber, `Created invoice for ${invoiceData.customerName}`);
      
      // Update linked sales order if applicable
      const linkedSo = this.data.salesOrders.find(s => s.soNumber === invoiceData.soNumber);
      if (linkedSo) {
        linkedSo.invoiceStatus = "Invoice Created";
      }
    }

    this.save(true);
    return invoiceData;
  }

  // Save / Update Package (fully editable mode)
  savePackage(pkgData) {
    const existingIdx = this.data.packages.findIndex(p => p.id === pkgData.id || p.packageNumber === pkgData.packageNumber);
    
    if (existingIdx >= 0) {
      this.data.packages[existingIdx] = pkgData;
      this.logActivity("Package Updated", pkgData.packageNumber, pkgData.gnvNumber, `Updated package slip #${pkgData.packageNumber}`);
    } else {
      this.data.packages.unshift(pkgData);
      this.logActivity("Package Created", pkgData.packageNumber, pkgData.gnvNumber, `Packed order ${pkgData.soNumber}`);
    }

    this.save(true);
    return pkgData;
  }

  // Save / Update Shipment (fully editable mode)
  saveShipment(shipmentData) {
    const existingIdx = this.data.shipments.findIndex(s => s.id === shipmentData.id || s.shipmentNumber === shipmentData.shipmentNumber);
    
    if (existingIdx >= 0) {
      this.data.shipments[existingIdx] = shipmentData;
      this.logActivity("Shipment Updated", shipmentData.shipmentNumber, shipmentData.gnvNumber, `Updated consignment ${shipmentData.shipmentNumber}`);
    } else {
      this.data.shipments.unshift(shipmentData);
      this.logActivity("Shipment Created", shipmentData.shipmentNumber, shipmentData.gnvNumber, `Dispatched via ${shipmentData.carrier}`);
    }

    this.save(true);
    return shipmentData;
  }

  // Execute Allocation across the 4 Regional Hubs (Chennai, Mumbai, Kolkata, Noida)
  executeAllocation(parentOrderId, allocationPlan) {
    const order = this.data.salesOrders.find(o => o.id === parentOrderId || o.soNumber === parentOrderId);
    if (!order) throw new Error("Order not found");

    const gnvNumber = order.gnvNumber;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let totalAllocated = 0;
    const generatedChildren = [];

    // Normalize allocations list
    let allocationsList = [];
    if (allocationPlan && Array.isArray(allocationPlan.warehouseAllocations)) {
      allocationsList = allocationPlan.warehouseAllocations;
    } else if (Array.isArray(allocationPlan)) {
      allocationsList = allocationPlan;
    } else if (allocationPlan && typeof allocationPlan === 'object') {
      allocationsList = Object.entries(allocationPlan).map(([name, qty]) => ({
        warehouseName: name,
        allocatedQty: Number(qty) || 0
      }));
    }

    for (const alloc of allocationsList) {
      if (alloc.allocatedQty <= 0) continue;
      totalAllocated += alloc.allocatedQty;

      const code = (alloc.warehouseCode || alloc.warehouseName.slice(0, 3)).toUpperCase();
      const childSoNumber = `${order.soNumber}-${code}`;

      const childOrder = {
        id: childSoNumber,
        parentOrderId: order.soNumber,
        gnvNumber: gnvNumber,
        soNumber: childSoNumber,
        warehouseCity: alloc.cityName || alloc.warehouseName,
        warehouseName: alloc.warehouseName,
        customerName: order.customerName,
        customerId: order.customerId,
        orderDate: nowStr,
        allocatedQty: alloc.allocatedQty,
        amount: (order.grandTotal / (order.totalQty || 1)) * alloc.allocatedQty,
        batchDetails: alloc.batchNumber || "FEFO Assigned",
        expiryDate: alloc.expiryDate || "15-10-2027",
        status: "Allocated",
        invoiceStatus: "Pending",
        shipmentStatus: "Pending",
        isBalanceSSO: false
      };

      const existingIdx = this.data.childSalesOrders.findIndex(c => c.soNumber === childSoNumber);
      if (existingIdx >= 0) {
        this.data.childSalesOrders[existingIdx] = childOrder;
      } else {
        this.data.childSalesOrders.push(childOrder);
      }
      generatedChildren.push(childOrder);
    }

    // Balance SSO if remaining
    const unallocatedQty = (order.totalQty || 10) - totalAllocated;
    if (unallocatedQty > 0) {
      const balanceSoNumber = `${order.soNumber}-BAL`;
      const balanceOrder = {
        id: balanceSoNumber,
        parentOrderId: order.soNumber,
        gnvNumber: gnvNumber,
        soNumber: balanceSoNumber,
        warehouseCity: "Unassigned",
        warehouseName: "None (Balance SSO)",
        customerName: order.customerName,
        customerId: order.customerId,
        orderDate: nowStr,
        allocatedQty: unallocatedQty,
        amount: (order.grandTotal / (order.totalQty || 1)) * unallocatedQty,
        batchDetails: "Awaiting Inward Stock",
        status: "Draft",
        invoiceStatus: "Not Applicable",
        shipmentStatus: "Not Applicable",
        isBalanceSSO: true
      };

      const balIdx = this.data.childSalesOrders.findIndex(c => c.soNumber === balanceSoNumber);
      if (balIdx >= 0) {
        this.data.childSalesOrders[balIdx] = balanceOrder;
      } else {
        this.data.childSalesOrders.push(balanceOrder);
      }
      generatedChildren.push(balanceOrder);
    }

    order.allocatedTotalQty = totalAllocated;
    order.overallStatus = unallocatedQty === 0 ? "Confirmed" : "Partially Allocated";
    order.allocationStatus = unallocatedQty === 0 ? "Fully Allocated" : "Partially Allocated";

    this.logActivity(
      "Order Allocation Executed",
      order.soNumber,
      gnvNumber,
      `Allocated ${totalAllocated} units across 4 hubs. ${unallocatedQty} units in Balance SSO.`
    );

    this.save(true);
    return { parentOrder: order, children: generatedChildren };
  }

  // Pre-configured 10-Unit Demo using the 4 Regional Warehouses
  runStandard10UnitScenario() {
    const allocPlan = {
      warehouseAllocations: [
        { cityName: "Chennai", warehouseName: "Chennai", warehouseCode: "CHN", allocatedQty: 2, batchNumber: "CHN-ORI-2601" },
        { cityName: "Mumbai", warehouseName: "Mumbai", warehouseCode: "MUM", allocatedQty: 2, batchNumber: "MUM-ORI-2601" },
        { cityName: "Kolkata", warehouseName: "Kolkata", warehouseCode: "KOL", allocatedQty: 2, batchNumber: "KOL-ORI-2601" },
        { cityName: "Noida", warehouseName: "Noida", warehouseCode: "NOI", allocatedQty: 2, batchNumber: "NOI-ORI-2601" }
      ]
    };
    return this.executeAllocation("SO-10025", allocPlan);
  }

  // Real-time Pricing & Dual Discount Engine
  calculateLineFinancials(sku, qty, custId) {
    const prod = this.data.products.find(p => p.sku === sku) || this.data.products[0];
    const cust = this.data.customers.find(c => c.id === custId) || this.data.customers[0];
    if (!prod) return null;

    const unitRate = prod.sellingRate || prod.mrp || 1000;
    const grossAmount = unitRate * qty;

    // Layer 1: Base Discount
    let baseDiscountPct = prod.defaultDiscount || 23.0;
    const baseRule = this.data.baseDiscounts.find(b => b.brand === prod.brand);
    if (baseRule) baseDiscountPct = baseRule.discountPct;

    const baseDiscountAmount = (grossAmount * baseDiscountPct) / 100;

    // Layer 2: Scheme Discounts
    let schemeDiscountPct = 0;
    let schemeDiscountAmount = 0;
    let freeQty = 0;

    const schemeRule = this.data.schemeDiscounts.find(s => s.brand === prod.brand);
    if (schemeRule) {
      if (schemeRule.type === 'BUY_X_GET_Y' && qty >= (schemeRule.minQty || 11)) {
        freeQty = Math.floor(qty / (schemeRule.minQty || 11)) * (schemeRule.freeQty || 1);
      } else if (schemeRule.type === 'PERCENTAGE') {
        schemeDiscountPct = schemeRule.discountPct || 5.0;
        schemeDiscountAmount = (grossAmount * schemeDiscountPct) / 100;
      }
    }

    const totalLineDiscount = baseDiscountAmount + schemeDiscountAmount;
    const taxableAmount = Math.max(0, grossAmount - totalLineDiscount);

    const isInterState = cust && cust.state !== this.data.company.state;
    const taxRate = prod.taxRate || 18;
    const totalTax = (taxableAmount * taxRate) / 100;
    const lineTotal = taxableAmount + totalTax;

    return {
      productName: prod.name,
      sku: prod.sku,
      brand: prod.brand,
      weight: prod.weight,
      orderedQty: qty,
      unitRate,
      grossAmount,
      baseDiscountPct,
      baseDiscountAmount,
      schemeDiscountPct,
      schemeDiscountAmount,
      freeQty,
      totalLineDiscount,
      taxableAmount,
      isInterState,
      igstRate: taxRate,
      cgstRate: taxRate / 2,
      sgstRate: taxRate / 2,
      totalTax,
      lineTotal
    };
  }
}

export const store = new ERPStore();
