const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateReceipt = async (data, res) => {
  const doc = new PDFDocument({ 
    size: "A6", 
    layout: "landscape", 
    margin: 0,
    info: {
      Title: `Recipisse_${data.numero_dossier}`,
      Author: "ONI Burkina Faso"
    }
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=recipisse_${data.numero_dossier}.pdf`);
  doc.pipe(res);


  const pageWidth = doc.page.width;   
  const pageHeight = doc.page.height; 
  const margin = 15;
  const black = "#1a1a1a";
  const gray = "#666666";
  const lightGray = "#f5f5f5";
  const blak = "#1a1a1a";

  // Bordures
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16).lineWidth(1).strokeColor(blak).stroke();


  let yPos = 18;
  
  doc.fillColor(blak).fontSize(8).font("Helvetica-Bold").text("BURKINA FASO", 0, yPos, { align: "center" });
  yPos += 10;
  doc.fillColor(gray).fontSize(6).font("Helvetica").text("Unité - Progrès - Justice", 0, yPos, { align: "center" });
  yPos += 10;
  doc.fillColor(black).fontSize(7).font("Helvetica-Bold").text("MINISTÈRE DE LA SÉCURITÉ", 0, yPos, { align: "center" });
  yPos += 9;
  doc.fillColor(gray).fontSize(6.5).font("Helvetica").text("Office National d'Identification", 0, yPos, { align: "center" });
  yPos += 12;

  doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).lineWidth(0.5).strokeColor("#ccc").stroke();
  yPos += 6;


  const qrData = JSON.stringify( data.qr );
  const qr = await QRCode.toDataURL(qrData, { margin: 1, width: 150, color: { dark: blak, light: "#fff" } });
  doc.image(qr, pageWidth - margin - 45, 12, { width: 42, height: 42 });
  doc.fillColor(gray).fontSize(4.5).font("Helvetica").text("Scannez", pageWidth - margin - 45, 56, { width: 42, align: "center" });


  doc.fillColor(blak).fontSize(11).font("Helvetica-Bold").text("RÉCÉPISSÉ D'ENRÔLEMENT", 0, yPos - 2, { align: "center" });
  yPos += 10;
  doc.fillColor(gray).fontSize(6).font("Helvetica").text("Carte Nationale d'Identité Burkinabè", 0, yPos, { align: "center" });
  yPos += 10;

  doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).lineWidth(0.5).strokeColor("#ccc").stroke();
  yPos += 6;

  doc.rect(margin, yPos, pageWidth - (margin * 2), 14).fill(lightGray).stroke();
  doc.fillColor(blak).fontSize(6).font("Helvetica-Bold").text("N° DOSSIER", margin + 6, yPos + 3);
  doc.fillColor(black).fontSize(8).font("Helvetica-Bold").text(data.numero_dossier || "N/A", margin + 6, yPos + 3, { align: "right", width: pageWidth - (margin * 2) - 12 });
  yPos += 16;


  const colW = (pageWidth - (margin * 2)) / 2;
  

  doc.fillColor(gray).fontSize(5.5).font("Helvetica").text("TYPE", margin + 6, yPos);
  doc.fillColor(black).fontSize(7).font("Helvetica-Bold").text(data.concours || "CNIB", margin + 6, yPos + 8);
  

  doc.fillColor(gray).fontSize(5.5).font("Helvetica").text("CENTRE", margin + colW + 6, yPos);
  doc.fillColor(black).fontSize(7).font("Helvetica-Bold").text(data.centre || "—", margin + colW + 6, yPos + 8);
  yPos += 22;


  doc.fillColor(gray).fontSize(5.5).font("Helvetica").text("DATE INSCRIPTION", margin + 6, yPos);
  doc.fillColor(black).fontSize(7).font("Helvetica-Bold").text(data.date_inscription || "—", margin + 6, yPos + 8);
  yPos += 18;


  doc.rect(margin, yPos, pageWidth - (margin * 2), 14).fill(blak);
  doc.fillColor("white").fontSize(7).font("Helvetica-Bold").text("IDENTITÉ DU DEMANDEUR", margin + 6, yPos + 3);
  yPos += 14;


  const fields = [
    ["NOM", data.nom],
    ["PRÉNOM(S)", data.prenom],
    ["DATE NAISS.", data.date_naissance],
    ["LIEU NAISS.", data.lieu_naissance],
    ["TÉLÉPHONE", data.telephone],
    ["SEXE", data.genre || "—"]
  ];

  const rowH = 18;
  let colX = margin;
  
  fields.forEach((field, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + (col * colW);
    const y = yPos + (row * rowH);
    

    if ((row + col) % 2 === 0) {
      doc.rect(x, y, colW, rowH).fill("#ffffff");
    } else {
      doc.rect(x, y, colW, rowH).fill(lightGray);
    }
    doc.rect(x, y, colW, rowH).lineWidth(0.3).strokeColor("#ddd").stroke();
    
    doc.fillColor(gray).fontSize(5).font("Helvetica").text(field[0], x + 5, y + 3);
    doc.fillColor(black).fontSize(7).font("Helvetica-Bold").text(field[1] || "—", x + 5, y + 10, { width: colW - 10 });
  });

  yPos += (Math.ceil(fields.length / 2) * rowH) + 8;


  doc.rect(margin, yPos, pageWidth - (margin * 2), 12).fill(lightGray);
  doc.fillColor(blak).fontSize(5.5).font("Helvetica-Bold").text("⚠️ CONSIGNES", margin + 6, yPos + 3);
  yPos += 12;

  const consignes = [
    "Récépissé provisoire - ne remplace pas la CNIB",
    "À conserver jusqu'à retrait de la carte définitive",
    "Vérifiable via QR code ci-contre"
  ];
  
  consignes.forEach((c, i) => {
    doc.fillColor(black).fontSize(5).font("Helvetica").text(`${i+1}. ${c}`, margin + 10, yPos + (i * 9));
  });
  
  yPos += 28;


  const footerY = pageHeight - 24;
  doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).lineWidth(0.5).strokeColor("#ccc").stroke();
  
  doc.fillColor(blak).fontSize(5.5).font("Helvetica-Bold").text("ONI BURKINA FASO", 0, footerY + 5, { align: "center" });
  doc.fillColor(gray).fontSize(4.5).font("Helvetica").text(
    `Généré le ${new Date().toLocaleDateString("fr-FR")} - Document authentique`,
    0, footerY + 12, { align: "center" }
  );

  doc.end();
};

module.exports = generateReceipt;