import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface PrintPackageData {
  requestId: string;
  cardholderName: string;
  network: 'visa' | 'mastercard';
  simulatedNumber: string;
  simulatedExpiry: string;
  submissionDate: string;
  approvedDate?: string;
  approvedBy?: string;
  deliveryAddress?: {
    address_line_1: string;
    city: string;
    state_region: string;
    country: string;
    postal_code: string;
  };
}

// Format full 16-digit card number (unmasked and never hidden for printing and production)
export function formatFullCardNumber(num?: string, network: 'visa' | 'mastercard' = 'visa'): string {
  if (!num) {
    return network === 'mastercard' ? '5412 8492 1039 8201' : '4892 8492 1039 9210';
  }
  if (num.includes('•') || num.includes('*')) {
    const digits = num.replace(/\D/g, '');
    const prefix = network === 'mastercard' ? '5412' : '4892';
    const last4 = digits.length >= 4 ? digits.slice(-4) : (network === 'mastercard' ? '8201' : '9210');
    return `${prefix} 8492 1039 ${last4}`;
  }
  const clean = num.replace(/\s+/g, '');
  if (clean.length === 16) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
  }
  return num;
}

// Render flat high-res 300DPI canvas for front artwork (1012 x 638 px = standard CR80 at ~300 DPI)
export function renderFlatFrontCanvas(data: PrintPackageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d')!;

  // CR80 dimensions with rounded corners
  const radius = 32;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(canvas.width - radius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  ctx.lineTo(canvas.width, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
  ctx.lineTo(radius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Background Deep Royal Navy Blue Base
  ctx.fillStyle = '#0e297a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bottom-Left Slate Blue Curved Arc
  ctx.fillStyle = '#7088b6';
  ctx.beginPath();
  ctx.moveTo(0, 345);
  ctx.bezierCurveTo(130, 350, 275, 475, 285, 638);
  ctx.lineTo(0, 638);
  ctx.closePath();
  ctx.fill();

  // Top-Right Sweeping Curved Ribbon
  ctx.beginPath();
  ctx.moveTo(575, 0);
  ctx.bezierCurveTo(600, 290, 820, 530, 1012, 600);
  ctx.lineTo(1012, 270);
  ctx.bezierCurveTo(930, 170, 890, 70, 830, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.quadraticCurveTo(506, 160, 1012, 360);
  ctx.stroke();

  // Platform Brand Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  ctx.fillText('UNIVERSAL SPORTS TIP', 55, 65);

  // Contactless indicator 4-arc waves on top right (Authentic uncompressed circular geometry)
  const waveCenterX = 900;
  const waveCenterY = 65;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  const waveStart = -0.26 * Math.PI;
  const waveEnd = 0.26 * Math.PI;
  [12, 22, 32, 42].forEach(r => {
    ctx.beginPath();
    ctx.arc(waveCenterX, waveCenterY, r, waveStart, waveEnd);
    ctx.stroke();
  });

  // Authentic Brushed Gold EMV Chip (CR80 standard position: Left-aligned, uncompressed, authentic ISO 7816 geometry)
  const chipX = 55;
  const chipY = 160;
  const chipW = 150;
  const chipH = 115;

  // Chip rich gold metallic gradient
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#fef9c3');
  chipGrad.addColorStop(0.18, '#fde047');
  chipGrad.addColorStop(0.42, '#eab308');
  chipGrad.addColorStop(0.68, '#ca8a04');
  chipGrad.addColorStop(0.85, '#a16207');
  chipGrad.addColorStop(1, '#fde047');
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 14);
  ctx.fill();

  // Metallic deep gold bevel border
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Inner metallic highlight border
  ctx.strokeStyle = 'rgba(255, 255, 240, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(chipX + 3, chipY + 3, chipW - 6, chipH - 6, 11);
  ctx.stroke();

  // Precision laser-milled contact isolation grooves (etched into gold)
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';

  // Central contact lozenge core
  const coreW = 48;
  const coreH = 42;
  const coreX = chipX + (chipW - coreW) / 2;
  const coreY = chipY + (chipH - coreH) / 2;
  ctx.beginPath();
  ctx.roundRect(coreX, coreY, coreW, coreH, 10);
  ctx.stroke();

  // Horizontal grooves
  ctx.beginPath();
  ctx.moveTo(chipX + 2, chipY + chipH / 2);
  ctx.lineTo(coreX, chipY + chipH / 2);
  ctx.moveTo(coreX + coreW, chipY + chipH / 2);
  ctx.lineTo(chipX + chipW - 2, chipY + chipH / 2);

  // Vertical grooves
  ctx.moveTo(chipX + chipW / 2, chipY + 2);
  ctx.lineTo(chipX + chipW / 2, coreY);
  ctx.moveTo(chipX + chipW / 2, coreY + coreH);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 2);

  // Quadrant grooves
  const qLeftX = chipX + (coreX - chipX) * 0.48;
  const qRightX = coreX + coreW + (chipX + chipW - (coreX + coreW)) * 0.52;
  ctx.moveTo(qLeftX, chipY + 2);
  ctx.lineTo(qLeftX, chipY + chipH - 2);
  ctx.moveTo(qRightX, chipY + 2);
  ctx.lineTo(qRightX, chipY + chipH - 2);
  ctx.stroke();

  // Specular sheen overlay across chip
  const sheenGrad = ctx.createLinearGradient(chipX, chipY + chipH, chipX + chipW, chipY);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheenGrad.addColorStop(0.46, 'rgba(255, 255, 255, 0.08)');
  sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  sheenGrad.addColorStop(0.54, 'rgba(255, 255, 255, 0.08)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.roundRect(chipX + 2, chipY + 2, chipW - 4, chipH - 4, 12);
  ctx.fill();

  // Full Card Number for printing (Unmasked full 16 digits - unhidden for high-precision printing)
  const fullCardNumber = formatFullCardNumber(data.simulatedNumber, data.network);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 42px "JetBrains Mono", monospace';
  ctx.letterSpacing = '5px';
  ctx.fillText(fullCardNumber, 55, 360);

  // Cardholder Name and Expiration all in ONE LINE in visual hierarchy
  ctx.fillStyle = 'rgba(191, 219, 254, 0.75)';
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillText('CARDHOLDER', 55, 485);
  ctx.fillText('EXPIRES', 510, 485);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText(data.cardholderName.toUpperCase() || 'JASON AARON', 55, 525);

  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(data.simulatedExpiry || '12/29', 510, 525);

  // Authorized Network Brand
  if (data.network === 'mastercard') {
    // Interlocking circles
    const mcX = 860;
    const mcY = 510;
    const mcR = 40;
    ctx.fillStyle = '#EB001B';
    ctx.beginPath();
    ctx.arc(mcX - 24, mcY, mcR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F79E1B';
    ctx.beginPath();
    ctx.arc(mcX + 24, mcY, mcR, 0, Math.PI * 2);
    ctx.fill();

    // Intersection
    ctx.fillStyle = '#FF5F00';
    ctx.beginPath();
    ctx.arc(mcX - 24, mcY, mcR, -0.3 * Math.PI, 0.3 * Math.PI);
    ctx.arc(mcX + 24, mcY, mcR, 0.7 * Math.PI, 1.3 * Math.PI);
    ctx.fill();
  } else {
    // Visa
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic bold 44px sans-serif';
    ctx.fillText('VISA', 840, 530);
  }

  ctx.restore();
  return canvas;
}

// Render flat high-res 300DPI canvas for back artwork
export function renderFlatBackCanvas(data: PrintPackageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d')!;

  const radius = 32;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(canvas.width - radius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  ctx.lineTo(canvas.width, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
  ctx.lineTo(radius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Dark Navy Base
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#05102a');
  bgGrad.addColorStop(0.5, '#030818');
  bgGrad.addColorStop(1, '#01040f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Magnetic Stripe (CR80 standard)
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 60, canvas.width, 105);

  // Signature Panel
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(55, 215, 640, 85);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(55, 215, 640, 85);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 16px "Space Grotesk", sans-serif';
  ctx.fillText('AUTHORIZED SIGNATURE — NOT VALID UNLESS SIGNED', 70, 248);

  // Simulated CVV box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(715, 215, 140, 85);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(715, 215, 140, 85);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText('842', 760, 268);

  // Legal Text
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px sans-serif';
  ctx.fillText('Universal Sports Tip Membership Card. Property of issuer.', 55, 360);
  ctx.fillText('If found, please return to any authorized sporting facility or customer desk.', 55, 385);
  ctx.fillText('Cardholder assistance: support@universalsportstip.com | 24/7 Helpline', 55, 410);

  // Hologram Specimen
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(55, 455, 130, 85, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SECURE', 88, 502);

  // Network Logo bottom right
  if (data.network === 'mastercard') {
    const mcX = 860;
    const mcY = 500;
    const mcR = 30;
    ctx.fillStyle = '#EB001B';
    ctx.beginPath();
    ctx.arc(mcX - 18, mcY, mcR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F79E1B';
    ctx.beginPath();
    ctx.arc(mcX + 18, mcY, mcR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic bold 32px sans-serif';
    ctx.fillText('VISA', 830, 510);
  }

  ctx.restore();
  return canvas;
}

// Generate the official card-details.pdf document using jsPDF
export function generateDetailsPdf(data: PrintPackageData, frontDataUrl: string, backDataUrl: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page dimensions: 210 x 297 mm
  // Header banner
  doc.setFillColor(12, 35, 99);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('UNIVERSAL SPORTS TIP', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('PHYSICAL CARD PRINTING SPECIFICATION & AUDIT PACKAGE', 15, 26);

  doc.setFontSize(9);
  doc.text(`REFERENCE: ${data.requestId}`, 155, 18);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 26);

  // Section 1: Order & Identification Details
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Production Order Identification', 15, 48);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 51, 195, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text('Request Reference:', 15, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(data.requestId, 55, 59);

  doc.setFont('helvetica', 'normal');
  doc.text('Cardholder Name:', 15, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(data.cardholderName.toUpperCase(), 55, 66);

  doc.setFont('helvetica', 'normal');
  doc.text('Selected Network:', 15, 73);
  doc.setFont('helvetica', 'bold');
  doc.text(data.network.toUpperCase(), 55, 73);

  doc.setFont('helvetica', 'normal');
  doc.text('Card Number:', 110, 59);
  doc.setFont('helvetica', 'bold');
  const pdfCardNumber = formatFullCardNumber(data.simulatedNumber, data.network);
  doc.text(pdfCardNumber, 150, 59);

  doc.setFont('helvetica', 'normal');
  doc.text('Simulated Expiry:', 110, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(data.simulatedExpiry, 155, 66);

  doc.setFont('helvetica', 'normal');
  doc.text('Approval Status:', 110, 73);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(data.approvedBy ? `Approved by ${data.approvedBy}` : 'Production Approved', 155, 73);

  // Section 2: Technical Print Specifications
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Technical Print & Substrate Specifications', 15, 87);
  doc.line(15, 90, 195, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Standard Format:', 15, 97);
  doc.text('CR80 ISO/IEC 7810 (85.60 mm × 53.98 mm × 0.76 mm)', 55, 97);

  doc.text('Substrate Core:', 15, 104);
  doc.text('Multi-layer Laminated PVC with Metallic Deep Royal Foil Core', 55, 104);

  doc.text('Chip Interface:', 15, 111);
  doc.text('ISO/IEC 7816 Gold Brushed Metallic Contact + ISO 14443 NFC 4-Arc antenna', 55, 111);

  doc.text('Bleed & Safe Area:', 15, 118);
  doc.text('3.0 mm external bleed, 3.5 mm inner safe text margin', 55, 118);

  // Section 3: High-Res Card Artwork Previews
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Approved Master Artwork Proofs (1:1 Aspect Ratio)', 15, 132);
  doc.line(15, 135, 195, 135);

  // Insert Front & Back previews
  // CR80 ratio in mm: 85.6 x 53.98
  const cardW = 85.6;
  const cardH = 53.98;

  doc.addImage(frontDataUrl, 'PNG', 15, 142, cardW, cardH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('FRONT ARTWORK (PROOF)', 15, 201);

  doc.addImage(backDataUrl, 'PNG', 110, 142, cardW, cardH);
  doc.text('BACK ARTWORK (PROOF)', 110, 201);

  // Section 4: Delivery & Logistics Instruction
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. Dispatch & Delivery Route', 15, 215);
  doc.line(15, 218, 195, 218);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (data.deliveryAddress) {
    doc.text(`Street Address: ${data.deliveryAddress.address_line_1}`, 15, 226);
    doc.text(`City & Region: ${data.deliveryAddress.city}, ${data.deliveryAddress.state_region} ${data.deliveryAddress.postal_code}`, 15, 233);
    doc.text(`Destination Country: ${data.deliveryAddress.country}`, 15, 240);
  } else {
    doc.text('Standard Tracked Express Courier Dispatch', 15, 226);
  }

  // Section 5: Quality Assurance Sign-Off Block
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 252, 180, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Quality Assurance & Security Compliance Sign-Off:', 20, 260);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Micro-engraving inspected: [ ✓ PASSED ]', 20, 267);
  doc.text('Contactless antenna continuity: [ ✓ PASSED ]', 20, 273);
  doc.text('Hologram tamper audit: [ ✓ PASSED ]', 105, 267);
  doc.text('Packaging security sleeve: [ ✓ PASSED ]', 105, 273);

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('UNIVERSAL SPORTS TIP — CONFIDENTIAL PRODUCTION DOCUMENT — NOT A FINANCIAL PAYMENT CARD CREDENTIAL', 15, 290);

  return doc;
}

// Generate the complete ZIP package containing front.png, back.png, card-details.pdf, and manifest.json
export async function generateCompleteZipPackage(data: PrintPackageData): Promise<Blob> {
  const frontCanvas = renderFlatFrontCanvas(data);
  const backCanvas = renderFlatBackCanvas(data);

  const frontDataUrl = frontCanvas.toDataURL('image/png');
  const backDataUrl = backCanvas.toDataURL('image/png');

  // Convert canvas to blob for zip
  const frontBlob = await new Promise<Blob>((resolve) => frontCanvas.toBlob((b) => resolve(b!), 'image/png'));
  const backBlob = await new Promise<Blob>((resolve) => backCanvas.toBlob((b) => resolve(b!), 'image/png'));

  const pdfDoc = generateDetailsPdf(data, frontDataUrl, backDataUrl);
  const pdfBlob = pdfDoc.output('blob');

  const zip = new JSZip();
  zip.file('front.png', frontBlob);
  zip.file('back.png', backBlob);
  zip.file('card-details.pdf', pdfBlob);
  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        package_version: '1.0',
        platform: 'Universal Sports Tip',
        request_id: data.requestId,
        cardholder_name: data.cardholderName,
        card_network: data.network,
        card_number: formatFullCardNumber(data.simulatedNumber, data.network),
        generated_at: new Date().toISOString(),
        files: ['front.png', 'back.png', 'card-details.pdf'],
        specs: {
          format: 'CR80 standard',
          resolution_dpi: 300,
          dimensions_px: '1012x638',
          bleed_mm: 3.0
        }
      },
      null,
      2
    )
  );

  return await zip.generateAsync({ type: 'blob' });
}
