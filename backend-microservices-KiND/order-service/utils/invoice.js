const PDFDocument = require('pdfkit');

function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Streams a simple, clean invoice PDF directly to `res`. Kept deliberately
// minimal (no logo/branding assets, since this service has no asset
// pipeline) — swap in your own header block if you want a branded invoice.
function generateInvoicePdf(order, res) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('Invoice', { align: 'right' });
  doc.fontSize(10).fillColor('#666').text(`Order #${order._id}`, { align: 'right' });
  doc.text(`Date: ${formatDate(order.createdAt)}`, { align: 'right' });
  doc.moveDown(2);

  doc.fillColor('#000').fontSize(12).text('Bill to:');
  doc.fontSize(10).fillColor('#333');
  const { deliveryInfo = {} } = order;
  doc.text(`${deliveryInfo.firstName || ''} ${deliveryInfo.lastName || ''}`.trim() || 'N/A');
  if (deliveryInfo.street) doc.text(deliveryInfo.street);
  if (deliveryInfo.city || deliveryInfo.zip) doc.text(`${deliveryInfo.city || ''} ${deliveryInfo.zip || ''}`.trim());
  if (deliveryInfo.country) doc.text(deliveryInfo.country);
  if (deliveryInfo.email) doc.text(deliveryInfo.email);
  if (deliveryInfo.phone) doc.text(deliveryInfo.phone);

  doc.moveDown(2);

  // Table header
  const tableTop = doc.y;
  doc.fontSize(10).fillColor('#000');
  doc.text('Product ID', 50, tableTop);
  doc.text('Qty', 280, tableTop);
  doc.text('Size', 340, tableTop);
  doc.text('Unit Price', 400, tableTop);
  doc.text('Total', 480, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.fillColor('#333');
  for (const item of order.items || []) {
    const lineTotal = (item.priceAtPurchase || 0) * (item.quantity || 0);
    doc.text(String(item.productId), 50, y, { width: 220, ellipsis: true });
    doc.text(String(item.quantity), 280, y);
    doc.text(item.size || '—', 340, y);
    doc.text(formatCurrency(item.priceAtPurchase), 400, y);
    doc.text(formatCurrency(lineTotal), 480, y);
    y += 20;
  }

  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  y += 15;

  doc.fontSize(12).fillColor('#000').text(`Total: ${formatCurrency(order.totalAmount)}`, 400, y);
  y += 20;
  doc.fontSize(10).fillColor('#666').text(`Payment method: ${(order.paymentMethod || '').toUpperCase()}`, 400, y);
  y += 15;
  doc.text(`Payment status: ${(order.paymentStatus || '').toUpperCase()}`, 400, y);

  doc.end();
}

module.exports = { generateInvoicePdf };
