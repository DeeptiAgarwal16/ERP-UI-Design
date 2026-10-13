/**
 * GNV COMMODITIES PVT. LTD. — OPERATIONAL DASHBOARD
 * Premium Modern Soft UI & Dark Canvas Aesthetic
 * Matching the executive tablet/rounded dashboard design reference
 */

import { store } from '../store.js';

export function renderDashboard(container) {
  const d = store.data;

  // Calculate dynamic totals from store
  const totalSalesAmount = d.salesOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const totalInvoicedAmount = d.invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
  const totalStockUnits = d.batches.reduce((sum, b) => sum + (Number(b.qty) || 0), 0);
  const totalOrdersCount = d.salesOrders.length;

  // Format currency
  const formatINR = (val) => '₹ ' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  container.innerHTML = `
    <div class="dash-viewport">

      <!-- SECTION: DASHBOARD HEADING & TOP ROW -->
      <div class="dash-grid-top">
        
        <!-- LEFT: KPI METRIC CARDS -->
        <div class="dash-kpi-column">
          <div class="dash-section-header">
            <h2 class="dash-section-title">Dashboard</h2>
          </div>

          <div class="dash-kpi-row">
            
            <!-- KPI 1: SALES -->
            <div class="modern-kpi-card" onclick="window.location.hash='#sales-orders'">
              <div class="kpi-card-header">
                <div class="kpi-icon-squircle icon-peach">
                  <i data-lucide="trending-up"></i>
                </div>
                <button class="kpi-kebab-btn" title="Options">
                  <i data-lucide="more-vertical"></i>
                </button>
              </div>
              <div class="kpi-value-amount">${formatINR(totalSalesAmount > 0 ? totalSalesAmount : 89254)}</div>
              <div class="kpi-label-text">Sales</div>
            </div>

            <!-- KPI 2: BALANCE -->
            <div class="modern-kpi-card" onclick="window.location.hash='#inventory'">
              <div class="kpi-card-header">
                <div class="kpi-icon-squircle icon-aqua">
                  <i data-lucide="wallet"></i>
                </div>
                <button class="kpi-kebab-btn" title="Options">
                  <i data-lucide="more-vertical"></i>
                </button>
              </div>
              <div class="kpi-value-amount">${formatINR(7254)}</div>
              <div class="kpi-label-text">Balance</div>
            </div>

            <!-- KPI 3: PAYOUT / DISPATCHED -->
            <div class="modern-kpi-card" onclick="window.location.hash='#invoices'">
              <div class="kpi-card-header">
                <div class="kpi-icon-squircle icon-lavender">
                  <i data-lucide="arrow-up-circle"></i>
                </div>
                <button class="kpi-kebab-btn" title="Options">
                  <i data-lucide="more-vertical"></i>
                </button>
              </div>
              <div class="kpi-value-amount">${formatINR(totalInvoicedAmount > 0 ? totalInvoicedAmount : 82000)}</div>
              <div class="kpi-label-text">Payout</div>
            </div>

          </div>
        </div>

        <!-- RIGHT: SLEEK DARK "EARNINGS" ANALYTICS CARD -->
        <div class="dash-earnings-column">
          <div class="earnings-dark-card">
            
            <div class="earnings-header">
              <span class="earnings-title">Earnings</span>
              <div class="earnings-dropdown-pill">
                <span>Weekly</span>
                <i data-lucide="chevron-down"></i>
              </div>
            </div>

            <!-- Glowing Area SVG Wave Chart -->
            <div class="earnings-chart-area">
              
              <!-- Y Axis Scale -->
              <div class="chart-y-axis">
                <span>100k</span>
                <span>50k</span>
                <span>10k</span>
                <span>0</span>
              </div>

              <!-- SVG Wave Curve with Glowing Gradient -->
              <div class="chart-svg-container">
                <svg viewBox="0 0 420 130" class="earnings-wave-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#FF7043" stop-opacity="0.45"/>
                      <stop offset="70%" stop-color="#FF7043" stop-opacity="0.08"/>
                      <stop offset="100%" stop-color="#FF7043" stop-opacity="0"/>
                    </linearGradient>
                    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                  </defs>

                  <!-- Horizontal dashed grid guidelines -->
                  <line x1="0" y1="15" x2="420" y2="15" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4"/>
                  <line x1="0" y1="50" x2="420" y2="50" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4"/>
                  <line x1="0" y1="85" x2="420" y2="85" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4"/>
                  <line x1="0" y1="120" x2="420" y2="120" stroke="rgba(255,255,255,0.08)"/>

                  <!-- Smooth Area Fill -->
                  <path d="M 0 120 
                           L 0 108 
                           C 25 108, 45 60, 68 62 
                           C 90 64, 105 82, 125 72 
                           C 145 62, 160 96, 185 92 
                           C 210 88, 230 65, 255 76 
                           C 275 85, 290 20, 310 22 
                           C 330 24, 345 55, 365 65 
                           C 385 75, 400 68, 420 70 
                           L 420 120 Z" 
                        fill="url(#waveGlowGrad)" />

                  <!-- Glowing Line Stroke -->
                  <path d="M 0 108 
                           C 25 108, 45 60, 68 62 
                           C 90 64, 105 82, 125 72 
                           C 145 62, 160 96, 185 92 
                           C 210 88, 230 65, 255 76 
                           C 275 85, 290 20, 310 22 
                           C 330 24, 345 55, 365 65 
                           C 385 75, 400 68, 420 70" 
                        fill="none" 
                        stroke="#FF7043" 
                        stroke-width="3" 
                        stroke-linecap="round" 
                        filter="url(#glowEffect)" />

                  <!-- Peak Indicator Point -->
                  <circle cx="310" cy="22" r="4.5" fill="#FFFFFF" stroke="#FF7043" stroke-width="2.5" />
                </svg>

                <!-- X Axis Days -->
                <div class="chart-x-axis">
                  <span>mon</span>
                  <span>tue</span>
                  <span>wed</span>
                  <span>thu</span>
                  <span>fri</span>
                  <span>sat</span>
                  <span>sun</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      <!-- SECTION: BOTTOM ROW (LATEST ORDERS & TOP SELLING) -->
      <div class="dash-grid-bottom">
        
        <!-- LEFT: LATEST ORDER LIST -->
        <div class="dash-orders-column">
          
          <div class="dash-section-header with-filter">
            <h2 class="dash-section-title">Latest Order</h2>
            <div class="date-filter-pill">
              <i data-lucide="calendar"></i>
              <span>01.10.2026 - 14.10.2026</span>
            </div>
          </div>

          <!-- Table Header Columns -->
          <div class="latest-orders-table-head">
            <div class="th-cell th-ordered">Ordered</div>
            <div class="th-cell th-date">Date</div>
            <div class="th-cell th-qty">Quantity</div>
            <div class="th-cell th-customer">Customer</div>
            <div class="th-cell th-total">Total</div>
            <div class="th-cell th-action"></div>
          </div>

          <!-- Floating Order Row Cards -->
          <div class="latest-orders-list">
            
            <!-- Row 1 -->
            <div class="order-floating-row" onclick="window.location.hash='#sales-orders/view-SO-10025'">
              <div class="order-cell-ordered">
                <div class="product-thumb-squircle thumb-bag1">
                  <i data-lucide="package"></i>
                </div>
                <div class="order-number-text"># 10025</div>
              </div>
              <div class="order-cell-date">13 Oct, 2026</div>
              <div class="order-cell-qty">10</div>
              <div class="order-cell-customer">Suprita Enterprise</div>
              <div class="order-cell-total">₹ 8,360.00</div>
              <div class="order-cell-action">
                <button class="row-kebab-btn"><i data-lucide="more-vertical"></i></button>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="order-floating-row" onclick="window.location.hash='#sales-orders/view-SO-10026'">
              <div class="order-cell-ordered">
                <div class="product-thumb-squircle thumb-bag2">
                  <i data-lucide="shopping-bag"></i>
                </div>
                <div class="order-number-text"># 10026</div>
              </div>
              <div class="order-cell-date">10 Oct, 2026</div>
              <div class="order-cell-qty">9</div>
              <div class="order-cell-customer">Paws & Claws Retail</div>
              <div class="order-cell-total">₹ 1,295.00</div>
              <div class="order-cell-action">
                <button class="row-kebab-btn"><i data-lucide="more-vertical"></i></button>
              </div>
            </div>

            <!-- Row 3 -->
            <div class="order-floating-row" onclick="window.location.hash='#sales-orders'">
              <div class="order-cell-ordered">
                <div class="product-thumb-squircle thumb-bag3">
                  <i data-lucide="box"></i>
                </div>
                <div class="order-number-text"># 10024</div>
              </div>
              <div class="order-cell-date">08 Oct, 2026</div>
              <div class="order-cell-qty">16</div>
              <div class="order-cell-customer">Bark & Purr Supplies</div>
              <div class="order-cell-total">₹ 4,990.00</div>
              <div class="order-cell-action">
                <button class="row-kebab-btn"><i data-lucide="more-vertical"></i></button>
              </div>
            </div>

          </div>

        </div>

        <!-- RIGHT: TOP SELLING FLOATING CARD (WITH OVERLAPPING LAYER) -->
        <div class="dash-selling-column">
          
          <div class="dash-section-header with-filter">
            <h2 class="dash-section-title">Top Selling</h2>
            <div class="earnings-dropdown-pill light-pill">
              <span>Month</span>
              <i data-lucide="chevron-down"></i>
            </div>
          </div>

          <!-- Layered Container -->
          <div class="top-selling-stage">
            
            <!-- Underlayer backdrop container -->
            <div class="top-selling-backdrop"></div>

            <!-- Crisp Floating White Card with Progress Bars -->
            <div class="top-selling-floating-card">
              
              <!-- Item 1 -->
              <div class="perf-bar-row">
                <div class="perf-label">Orijen Adult (11.4 Kg)</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-lavender" style="width: 88%;"></div>
                </div>
                <div class="perf-percent">88%</div>
              </div>

              <!-- Item 2 -->
              <div class="perf-bar-row">
                <div class="perf-label">Acana Puppy Large</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-aqua" style="width: 74%;"></div>
                </div>
                <div class="perf-percent">74%</div>
              </div>

              <!-- Item 3 -->
              <div class="perf-bar-row">
                <div class="perf-label">Whiskas Ocean Mackerel</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-pink" style="width: 55%;"></div>
                </div>
                <div class="perf-percent">55%</div>
              </div>

              <!-- Item 4 -->
              <div class="perf-bar-row">
                <div class="perf-label">Pedigree Meat Jerky</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-peach" style="width: 64%;"></div>
                </div>
                <div class="perf-percent">64%</div>
              </div>

              <!-- Item 5 -->
              <div class="perf-bar-row">
                <div class="perf-label">Royal Canin Maxi Adult</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-coral" style="width: 90%;"></div>
                </div>
                <div class="perf-percent">90%</div>
              </div>

              <!-- Item 6 -->
              <div class="perf-bar-row">
                <div class="perf-label">Taste of the Wild Prairie</div>
                <div class="perf-bar-track">
                  <div class="perf-bar-fill bar-yellow" style="width: 25%;"></div>
                </div>
                <div class="perf-percent">25%</div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- SECTION: 4 REGIONAL HUBS QUICK STATUS & ALLOCATION DEMO -->
      <div class="dash-hubs-footer">
        <div class="hubs-footer-card">
          <div class="hubs-footer-header">
            <div class="hubs-title-group">
              <span class="hubs-badge">4 Hubs Active</span>
              <strong>Regional Warehouse Operations: Chennai &bull; Mumbai &bull; Kolkata &bull; Noida</strong>
            </div>
            <div class="hubs-actions-group">
              <button class="btn-demo-scenario" id="btn-dash-demo">
                <i data-lucide="play"></i> 10-Unit Multi-Hub Demo
              </button>
              <button class="btn-goto-alloc" onclick="window.location.hash='#allocation'">
                <span>Go to Allocation Hub</span>
                <i data-lucide="arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-dash-demo')?.addEventListener('click', () => {
    store.runStandard10UnitScenario();
    window.location.hash = '#gnv-group/GNV-2026-000002';
  });
}
