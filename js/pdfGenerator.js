/**
 * GNV COMMODITIES PVT. LTD. — OFFICIAL DOCUMENT & PDF ENGINE
 * Formatted with authentic GNV corporate branding, customer details, and discount columns
 */

export function openPrintDocument(type, record, company) {
  const printWindow = window.open('', '_blank', 'width=950,height=900');
  if (!printWindow) {
    alert("Please allow popups to view and print documents.");
    return;
  }

  let docTitle = "Document";
  let contentHtml = "";

  if (type === "SALES_ORDER") {
    docTitle = `Sales Order — ${record.soNumber}`;
    contentHtml = renderSalesOrderHtml(record, company);
  } else if (type === "INVOICE") {
    docTitle = `Tax Invoice — ${record.invoiceNumber}`;
    contentHtml = renderInvoiceHtml(record, company);
  } else if (type === "PACKAGE_SLIP") {
    docTitle = `Package Slip — ${record.packageNumber}`;
    contentHtml = renderPackageSlipHtml(record, company);
  } else if (type === "TRANSFER_NOTE") {
    docTitle = `Transfer Order — ${record.transferNumber}`;
    contentHtml = renderTransferNoteHtml(record, company);
  } else if (type === "INWARD_RECEIPT") {
    docTitle = `Goods Receipt — ${record.inwardRef}`;
    contentHtml = renderInwardReceiptHtml(record, company);
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${docTitle} — GNV Commodities Pvt. Ltd.</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 30px;
          color: #222;
          font-size: 13px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #2F80ED;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gnv-logo-boxes {
          display: inline-flex;
          gap: 2px;
        }
        .gnv-logo-box {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
          border-radius: 2px;
        }
        .box-g { background-color: #D32F2F; }
        .box-n { background-color: #212121; }
        .box-v { background-color: #388E3C; }
        .company-legal-name {
          font-size: 15px;
          font-weight: 800;
          color: #15345B;
          letter-spacing: 0.3px;
        }
        .company-meta {
          font-size: 11px;
          color: #555;
          margin-top: 2px;
        }
        .doc-header-right {
          text-align: right;
        }
        .doc-type-title {
          font-size: 22px;
          font-weight: 800;
          color: #15345B;
          text-transform: uppercase;
        }
        .doc-meta-line {
          font-size: 12px;
          color: #333;
          margin-top: 2px;
        }
        .gnv-pill {
          display: inline-block;
          background: #EAF3FF;
          color: #1769D2;
          border: 1px solid #BFDBFE;
          padding: 2px 7px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: bold;
          font-size: 11px;
          margin-top: 4px;
        }
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 20px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 14px;
        }
        .address-box-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .customer-name-prominent {
          font-size: 15px;
          font-weight: 800;
          color: #1769D2;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #F1F5F9;
          color: #1E293B;
          text-align: left;
          padding: 8px 10px;
          font-size: 11.5px;
          font-weight: 700;
          border: 1px solid #CBD5E1;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #E2E8F0;
          font-size: 12px;
        }
        .text-right { text-align: right; }
        .totals-block {
          width: 340px;
          margin-left: auto;
          margin-bottom: 20px;
        }
        .totals-block td {
          padding: 5px 8px;
        }
        .grand-total-row {
          background-color: #EAF3FF;
          font-weight: 800;
          font-size: 14px;
          color: #15345B;
        }
        .footer-note {
          margin-top: 35px;
          border-top: 1px solid #E2E8F0;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748B;
        }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; padding: 10px 14px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span><strong>Preview Mode</strong> — Click Print to generate actual paper copy or save PDF.</span>
        <button onclick="window.print()" style="background: #1769D2; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
          Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <div class="logo-wrap">
          <div class="gnv-logo-boxes">
            <div class="gnv-logo-box box-g">G</div>
            <div class="gnv-logo-box box-n">N</div>
            <div class="gnv-logo-box box-v">V</div>
          </div>
          <div>
            <div class="company-legal-name">${company.legalName}</div>
            <div class="company-meta">${company.address}, ${company.city}, ${company.state} - ${company.pinCode}, ${company.country}</div>
            <div class="company-meta"><strong>GSTIN:</strong> ${company.gstin} | <strong>PAN:</strong> ${company.pan}</div>
          </div>
        </div>
        <div class="doc-header-right">
          <div class="doc-type-title">${type.replace('_', ' ')}</div>
          <div class="doc-meta-line"><strong>${record.soNumber || record.invoiceNumber || record.packageNumber || record.transferNumber || record.inwardRef}</strong></div>
          ${record.gnvNumber ? `<div class="gnv-pill">GNV: ${record.gnvNumber}</div>` : ''}
        </div>
      </div>

      ${contentHtml}

      <div class="footer-note">
        <div>Authorized Signatory: <strong>Deepti Agarwal</strong></div>
        <div>Page 1 of 1</div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function renderSalesOrderHtml(order, company) {
  const itemsHtml = (order.items || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <strong>${item.name}</strong><br>
        <small style="color:#64748B;">SKU: ${item.sku} ${item.weight ? '| ' + item.weight : ''}</small>
      </td>
      <td>${item.location || order.warehouseLocation || 'Chennai'}</td>
      <td class="text-right"><strong>${item.orderedQty || item.qty}</strong> Nos.</td>
      <td class="text-right">₹${Number(item.mrp || item.unitRate).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(item.unitRate || item.rate).toLocaleString('en-IN')}</td>
      <td class="text-right" style="color:#16A34A; font-weight:bold;">${item.discountPct || 0}%</td>
      <td class="text-right">${item.taxRate}%</td>
      <td class="text-right"><strong>₹${Number(item.lineTotal || item.amount).toLocaleString('en-IN')}</strong></td>
    </tr>
  `).join('');

  return `
    <div class="address-grid">
      <div>
        <div class="address-box-title">Billing Address</div>
        <div class="customer-name-prominent">${order.customerName}</div>
        <div style="font-size:12px; margin-top:3px; color:#333;">
          ${order.billingAddress || order.city + ', ' + (order.state || '') + ' - ' + (order.pinCode || '')}
        </div>
        <div style="font-size:11.5px; margin-top:3px; color:#555;">
          <strong>Customer Code:</strong> ${order.customerCode || 'N/A'}<br>
          <strong>PO Number:</strong> ${order.customerPO || 'N/A'}
        </div>
      </div>
      <div>
        <div class="address-box-title">Order Information</div>
        <div style="font-size:12px; line-height:1.6;">
          <strong>Order Date:</strong> ${order.orderDate}<br>
          <strong>Dispatch Warehouse:</strong> <span style="font-weight:700; color:#1769D2;">${order.warehouseLocation || 'Noida'}</span><br>
          <strong>Payment Terms:</strong> ${order.paymentTerms || 'PostPaid 30D'}<br>
          <strong>Status:</strong> <span style="font-weight:700; color:#16A34A;">${order.overallStatus || 'CONFIRMED'}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:25px;">#</th>
          <th>Items & Description</th>
          <th>Location</th>
          <th class="text-right">Qty</th>
          <th class="text-right">MRP</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Discount</th>
          <th class="text-right">Tax</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table class="totals-block">
      <tr>
        <td>Sub Total:</td>
        <td class="text-right">₹${Number(order.subtotal || order.taxableAmount).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Total Discount:</td>
        <td class="text-right" style="color:#16A34A;">- ₹${Number(order.discountTotal || 0).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Taxable Amount:</td>
        <td class="text-right">₹${Number(order.taxableAmount || order.subtotal).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Tax (GST / IGST):</td>
        <td class="text-right">₹${Number((order.igst || 0) + (order.cgst || 0) + (order.sgst || 0)).toLocaleString('en-IN')}</td>
      </tr>
      ${order.roundOff ? `<tr><td>Round Off:</td><td class="text-right">₹${order.roundOff}</td></tr>` : ''}
      <tr class="grand-total-row">
        <td>Total Amount:</td>
        <td class="text-right">₹${Number(order.grandTotal).toLocaleString('en-IN')}</td>
      </tr>
    </table>
  `;
}

function renderInvoiceHtml(inv, company) {
  const itemsHtml = (inv.items || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <strong>${item.name}</strong><br>
        <small style="color:#64748B;">SKU: ${item.sku} | ${item.weight || ''}</small>
      </td>
      <td class="text-right">${item.qty} Nos.</td>
      <td class="text-right">₹${Number(item.mrp || item.rate).toLocaleString('en-IN')}</td>
      <td class="text-right" style="color:#16A34A; font-weight:bold;">${item.discountPct || 0}%</td>
      <td class="text-right">₹${Number(item.taxableAmount || item.rate).toLocaleString('en-IN')}</td>
      <td class="text-right">${item.taxRate || 18}%</td>
      <td class="text-right"><strong>₹${Number(item.lineTotal || item.rate * item.qty).toLocaleString('en-IN')}</strong></td>
    </tr>
  `).join('');

  return `
    <div class="address-grid">
      <div>
        <div class="address-box-title">Bill To & Ship To</div>
        <div class="customer-name-prominent">${inv.customerName}</div>
        <div style="font-size:12px; margin-top:3px; color:#333;">
          ${inv.billingAddress || 'India'}
        </div>
        <div style="font-size:11.5px; margin-top:3px; color:#555;">
          <strong>GSTIN:</strong> ${inv.customerGSTIN || 'Unregistered'}<br>
          <strong>Place Of Supply:</strong> ${inv.placeOfSupply || 'Rajasthan (08)'}
        </div>
      </div>
      <div>
        <div class="address-box-title">Invoice Details</div>
        <div style="font-size:12px; line-height:1.6;">
          <strong>Invoice Date:</strong> ${inv.invoiceDate}<br>
          <strong>Due Date:</strong> ${inv.dueDate || inv.invoiceDate}<br>
          <strong>Sales Order#:</strong> ${inv.soNumber}<br>
          <strong>Payment Terms:</strong> ${inv.paymentTerms || 'PrePaid 0D'}<br>
          <strong>Dispatch Warehouse:</strong> <span style="font-weight:700; color:#1769D2;">${inv.warehouseLocation || 'Chennai'}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:25px;">#</th>
          <th>Items & Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">MRP</th>
          <th class="text-right">Discount</th>
          <th class="text-right">Taxable</th>
          <th class="text-right">GST %</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table class="totals-block">
      <tr>
        <td>Taxable Amount:</td>
        <td class="text-right">₹${Number(inv.taxableAmount).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>IGST:</td>
        <td class="text-right">₹${Number(inv.igst || 0).toLocaleString('en-IN')}</td>
      </tr>
      <tr class="grand-total-row">
        <td>Invoice Total:</td>
        <td class="text-right">₹${Number(inv.grandTotal).toLocaleString('en-IN')}</td>
      </tr>
    </table>
  `;
}

function renderPackageSlipHtml(pkg, company) {
  const itemsHtml = (pkg.items || []).map((it, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${it.name}</strong><br><small>SKU: ${it.sku}</small></td>
      <td>${it.location || pkg.warehouseName}</td>
      <td class="text-right"><strong>${it.qtyToPack || it.orderedQty}</strong> Nos.</td>
    </tr>
  `).join('');

  return `
    <div class="address-grid">
      <div>
        <div class="address-box-title">Customer / Consignee</div>
        <div class="customer-name-prominent">${pkg.customerName || 'Customer'}</div>
        <div style="font-size:12px; margin-top:3px;">Linked SO: <strong>${pkg.soNumber}</strong></div>
      </div>
      <div>
        <div class="address-box-title">Packing Details</div>
        <div style="font-size:12px; line-height:1.6;">
          <strong>Date:</strong> ${pkg.date}<br>
          <strong>Warehouse:</strong> <span style="font-weight:700; color:#1769D2;">${pkg.warehouseName}</span><br>
          <strong>Package Type:</strong> ${pkg.packageType || 'Box'}<br>
          <strong>Gross Weight:</strong> ${pkg.grossWeight || pkg.weightKg || '12'} kg<br>
          <strong>Dimensions:</strong> ${pkg.dimensions || '40x30x30 cm'}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Details</th>
          <th>Warehouse Location</th>
          <th class="text-right">Quantity Packed</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  `;
}

function renderTransferNoteHtml(trf, company) {
  return `
    <div class="address-grid">
      <div>
        <div class="address-box-title">Source Warehouse</div>
        <div class="customer-name-prominent">${trf.sourceWarehouseName}</div>
        <div style="font-size:12px; margin-top:4px;">Date: ${trf.transferDate}</div>
      </div>
      <div>
        <div class="address-box-title">Destination Warehouse</div>
        <div class="customer-name-prominent">${trf.destWarehouseName}</div>
        <div style="font-size:12px; margin-top:4px;">Created By: <strong>Deepti Agarwal</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item & Description</th>
          <th>Batch Number</th>
          <th>Expiry Date</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${trf.productName}</strong><br><small>SKU: ${trf.sku}</small></td>
          <td>${trf.batchNumber}</td>
          <td>${trf.expiryDate}</td>
          <td class="text-right"><strong>${trf.transferQty}</strong> Nos.</td>
          <td class="text-right">₹${Number(trf.rate || 0).toLocaleString('en-IN')}</td>
          <td class="text-right"><strong>₹${Number(trf.amount || 0).toLocaleString('en-IN')}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderInwardReceiptHtml(inw, company) {
  return `
    <div class="address-grid">
      <div>
        <div class="address-box-title">Supplier Details</div>
        <div class="customer-name-prominent">${inw.supplier}</div>
        <div style="font-size:12px; margin-top:3px;">PO Ref: <strong>${inw.poRef}</strong></div>
      </div>
      <div>
        <div class="address-box-title">Receiving Warehouse</div>
        <div class="customer-name-prominent">${inw.warehouseName}</div>
        <div style="font-size:12px; margin-top:3px;">Receipt Date: ${inw.receiptDate}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Details</th>
          <th>Batch Number</th>
          <th>Expiry Date</th>
          <th class="text-right">Ordered Qty</th>
          <th class="text-right">Accepted Qty</th>
          <th class="text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${inw.productName}</strong><br><small>SKU: ${inw.sku}</small></td>
          <td>${inw.batchNumber}</td>
          <td>${inw.expiryDate}</td>
          <td class="text-right">${inw.orderedQty} Nos.</td>
          <td class="text-right" style="color:#16A34A; font-weight:bold;">${inw.acceptedQty} Nos.</td>
          <td><span style="color:#16A34A; font-weight:bold;">${inw.status}</span></td>
        </tr>
      </tbody>
    </table>
  `;
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
