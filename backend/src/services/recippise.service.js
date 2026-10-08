const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * data (champs du modèle Utilisateur + dossier) :
 * {
 *   numero_dossier, centre, date_inscription,
 *   nud, nom, prenom, telephone, date_naissance, lieux_naissance,
 *   prenom_pere, prenom_mere, profession, genre,
 *   numero_acte, commune_acte, date_acte,
 *   numero_certificat, tribunal,
 *   qr
 * }
 */
const generateReceipt = async (data, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    info: {
      Title: `Recipisse_${data.numero_dossier}`,
      Author: "DNEC Mali"
    }
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=recipisse_${data.numero_dossier}.pdf`);
  doc.pipe(res);

  const W = doc.page.width;
  const H = doc.page.height;
  const M = 40;
  const black = "#1a1a1a";
  const gray = "#666666";
  const lightGray = "#f2f2f2";
  const banner = "#8c8c8c";
  const dash = (v) => (v === undefined || v === null || String(v).trim() === "" ? "—" : String(v));
  // Prisma renvoie des objets Date pour les champs DateTime
  const fmtDate = (d) => {
    if (!d) return "—";
    if (typeof d === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
    const x = new Date(d);
    return isNaN(x) ? String(d) : x.toLocaleDateString("fr-FR");
  };

  // Colonnes
  const leftX = M;
  const leftW = 150;
  const labelX = 205;
  const valX = 330;

  // Filigrane
  doc.save();
  doc.opacity(0.05).fillColor(black).font("Helvetica-Bold").fontSize(150);
  doc.rotate(-30, { origin: [W / 2, H / 2] });
  doc.text("DNEC", 0, H / 2 - 90, { width: W, align: "center" });
  doc.restore();

  // En-tête
  doc.fillColor(black).fontSize(9).font("Helvetica-Bold").text("RÉPUBLIQUE DU MALI", 0, 22, { align: "center" });
  doc.fillColor(gray).fontSize(7).font("Helvetica").text("Un Peuple - Un But - Une Foi", 0, 33, { align: "center" });
  doc.fillColor(black).fontSize(8).font("Helvetica-Bold").text("DNEC", 0, 44, { align: "center" });
  doc.fillColor(gray).fontSize(7.5).font("Helvetica").text("Direction Nationale de l'État Civil", 0, 55, { align: "center" });

  // Bandeau titre
  doc.rect(M, 74, W - 2 * M, 24).fill(banner);
  doc.fillColor("white").fontSize(15).font("Helvetica-Bold")
    .text("Récépissé d'Enrôlement", M, 79, { width: W - 2 * M, align: "center" });
  doc.fillColor(gray).fontSize(7).font("Helvetica")
    .text("Carte d'Identité Biométrique - Mali Kura Biométrie", 0, 104, { align: "center" });

  // Colonne gauche
  const leftBlock = (label, value, y, bold = false) => {
    doc.fillColor(gray).font("Helvetica").fontSize(8.5).text(label, leftX, y, { width: leftW, align: "center" });
    doc.fillColor(black).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 10.5 : 9)
      .text(dash(value), leftX, y + 13, { width: leftW, align: "center" });
  };

  let ly = 135;
  leftBlock("N° dossier", data.numero_dossier || "N/A", ly, true); ly += 40;
  leftBlock("NUD", data.nud, ly, true); ly += 40;
  leftBlock("Enrôlé le", fmtDate(data.date_inscription), ly); ly += 40;
  leftBlock("Centre", data.centre, ly, true); ly += 44;

  const qrData = JSON.stringify(data.qr);
  const qr = await QRCode.toDataURL(qrData, { margin: 1, width: 240, color: { dark: black, light: "#fff" } });
  doc.image(qr, leftX + 30, ly, { width: 90, height: 90 });
  doc.fillColor(gray).fontSize(6).font("Helvetica").text("Scannez", leftX, ly + 94, { width: leftW, align: "center" });

  // Colonne droite
  let y = 135;
  const rowH = 26;

  const row = (label, value, extra) => {
    doc.fillColor(black).font("Helvetica").fontSize(9).text(label, labelX, y, { width: 120 });
    doc.fillColor(black).font("Helvetica-Bold").fontSize(10.5).text(dash(value), valX, y, { width: 120 });
    if (extra) {
      doc.fillColor(black).font("Helvetica").fontSize(9).text(extra.label, 460, y);
      doc.font("Helvetica-Bold").fontSize(10.5).text(dash(extra.value), 495, y);
    }
    y += rowH;
  };

  row("NOM", data.nom);
  row("PRÉNOM(S)", data.prenom);
  row("DATE DE NAISSANCE", fmtDate(data.date_naissance), { label: "SEXE", value: data.genre });
  row("LIEU DE NAISSANCE", data.lieux_naissance);
  row("PROFESSION", data.profession);
  row("TÉLÉPHONE", data.telephone);

  // Blocs avec barre verticale
  const block = (title, lines) => {
    const startY = y;
    doc.fillColor(black).font("Helvetica").fontSize(9).text(title, labelX, y, { width: 105 });
    lines.forEach(([k, v]) => {
      doc.fillColor(gray).font("Helvetica").fontSize(8.5).text(k, valX, y, { width: 120 });
      doc.fillColor(black).font("Helvetica-Bold").fontSize(10.5).text(dash(v), 455, y, { width: W - 455 - M });
      y += 19;
    });
    doc.moveTo(valX - 10, startY - 2).lineTo(valX - 10, y - 4).lineWidth(0.8).strokeColor(black).stroke();
    y += 12;
  };

  block("PARENT(S)", [
    ["Prénom du père", data.prenom_pere],
    ["Prénom de la mère", data.prenom_mere],
  ]);

  block("ACTE DE\nNAISSANCE", [
    ["Numéro", data.numero_acte],
    ["Commune", data.commune_acte],
    ["Date", fmtDate(data.date_acte)],
  ]);

  block("CERTIFICAT DE\nNATIONALITÉ", [
    ["Numéro", data.numero_certificat],
    ["Tribunal", data.tribunal],
  ]);

  // Consignes
  const boxY = H - 48 - 85;
  doc.rect(M, boxY, W - 2 * M, 16).fill(lightGray);
  doc.fillColor(black).fontSize(8).font("Helvetica-Bold").text("CONSIGNES", M + 8, boxY + 4);
  const consignes = [
    "Récépissé provisoire - ne remplace pas la carte d'identité",
    "À conserver jusqu'à retrait de la carte définitive",
    "Vérifiable via QR code ci-contre"
  ];
  consignes.forEach((c, i) => {
    doc.fillColor(black).fontSize(8).font("Helvetica").text(`${i + 1}. ${c}`, M + 12, boxY + 24 + i * 12);
  });

  // Pied de page
  const footerY = H - 48;
  doc.moveTo(M, footerY).lineTo(W - M, footerY).lineWidth(0.5).strokeColor("#ccc").stroke();
  doc.fillColor(black).fontSize(8).font("Helvetica-Bold").text("DNEC MALI", 0, footerY + 8, { align: "center" });
  doc.fillColor(gray).fontSize(7).font("Helvetica").text(
    `Généré le ${new Date().toLocaleDateString("fr-FR")} - Document authentique`,
    0, footerY + 20, { align: "center" }
  );

  doc.end();
};

module.exports = generateReceipt;