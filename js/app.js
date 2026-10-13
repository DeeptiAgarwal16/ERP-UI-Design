/**
 * GNV COMMODITIES PVT. LTD. — APPLICATION ROOT & CLIENT ROUTER
 */

import { store } from './store.js?v=11';
import { renderDashboard } from './views/dashboard.js';
import { renderSalesOrders } from './views/salesOrders.js';
import { renderAllocation } from './views/allocation.js?v=15';
import { renderWarehouseOrders } from './views/warehouseOrders.js';
import { renderGnvGroupView } from './views/gnvGroupView.js';
import { renderItemMaster } from './views/itemMaster.js';
import { renderDiscounts } from './views/discounts.js';
import { renderInventory } from './views/inventory.js';
import { renderInward } from './views/inward.js';
import { renderTransfers } from './views/transfers.js';
import { renderWarehouses } from './views/warehouses.js';
import { renderInvoices } from './views/invoices.js';
import { renderPackages } from './views/packages.js';
import { renderShipments } from './views/shipments.js';
import { renderCustomers } from './views/customers.js';
import { renderActivity } from './views/activity.js';
import { renderSettings } from './views/settings.js';

class GNVApp {
  constructor() {
    this.contentContainer = document.getElementById('main-content');
    this.initSearch();
    this.initRouter();
    this.updateBadges();

    store.subscribe(() => {
      this.updateBadges();
    });
  }

  initSearch() {
    const searchInput = document.getElementById('topbar-search');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim().toUpperCase();
        if (!query) return;

        if (query.startsWith('GNV-')) {
          window.location.hash = `#gnv-group/${query}`;
          return;
        }

        if (query.startsWith('SO') || query.startsWith('SON/')) {
          const so = store.data.salesOrders.find(o => o.soNumber.toUpperCase() === query);
          if (so) {
            window.location.hash = `#sales-orders/view-${encodeURIComponent(so.soNumber)}`;
            return;
          }
        }

        if (query.startsWith('C26') || query.startsWith('INV')) {
          const inv = store.data.invoices.find(i => i.invoiceNumber.toUpperCase() === query);
          if (inv) {
            window.location.hash = `#invoices/edit-${encodeURIComponent(inv.invoiceNumber)}`;
            return;
          }
        }

        window.location.hash = '#sales-orders';
      }
    });
  }

  updateBadges() {
    const badgeSo = document.getElementById('badge-so-count');
    if (badgeSo) {
      badgeSo.textContent = store.data.salesOrders.length;
    }
  }

  initRouter() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  }

  route() {
    const rawHash = window.location.hash.slice(1) || 'dashboard';
    
    // Support paths like sales-orders/new, sales-orders/view-SON/26-27-4567, invoices/new-from-so/SO-10025
    let path = rawHash;
    let param = null;

    if (rawHash.includes('/')) {
      const slashIdx = rawHash.indexOf('/');
      path = rawHash.slice(0, slashIdx);
      param = rawHash.slice(slashIdx + 1);
    }

    // Update active nav link
    document.querySelectorAll('.menu-link').forEach(link => {
      link.classList.remove('active');
      const navTarget = link.getAttribute('data-nav');
      if (navTarget === path || (path === 'gnv-group' && navTarget === 'sales-orders')) {
        link.classList.add('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (path) {
      case 'dashboard':
        renderDashboard(this.contentContainer);
        break;

      case 'sales-orders':
        renderSalesOrders(this.contentContainer, param);
        break;

      case 'allocation':
        renderAllocation(this.contentContainer, param);
        break;

      case 'warehouse-orders':
        renderWarehouseOrders(this.contentContainer, param || 'ALL');
        break;

      case 'gnv-group':
        renderGnvGroupView(this.contentContainer, param || 'GNV-2026-000001');
        break;

      case 'item-master':
        renderItemMaster(this.contentContainer);
        break;

      case 'discounts':
        renderDiscounts(this.contentContainer);
        break;

      case 'inventory':
        renderInventory(this.contentContainer);
        break;

      case 'inward':
        renderInward(this.contentContainer);
        break;

      case 'transfers':
        renderTransfers(this.contentContainer);
        break;

      case 'warehouses':
        renderWarehouses(this.contentContainer);
        break;

      case 'invoices':
        renderInvoices(this.contentContainer, param);
        break;

      case 'packages':
        renderPackages(this.contentContainer, param);
        break;

      case 'shipments':
        renderShipments(this.contentContainer, param);
        break;

      case 'customers':
        renderCustomers(this.contentContainer);
        break;

      case 'activity':
        renderActivity(this.contentContainer);
        break;

      case 'settings':
        renderSettings(this.contentContainer);
        break;

      default:
        renderDashboard(this.contentContainer);
        break;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gnvApp = new GNVApp();
});
