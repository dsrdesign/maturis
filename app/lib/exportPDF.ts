import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Organization } from './types';

type AIRecommendation = {
  domain: string;
  domainName: string;
  score: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actions: Array<{
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  quickWins: string[];
};

type AIRecommendationsResponse = {
  recommendations: AIRecommendation[];
  summary: string;
  maturityAnalysis: string;
};

type AuditType = Organization['audits'][0];

// ─── Palette corporate sobre ─────────────────────────────────────────
const C = {
  black: [20, 24, 33] as [number, number, number],
  dark: [45, 50, 65] as [number, number, number],
  text: [60, 65, 80] as [number, number, number],
  muted: [130, 135, 145] as [number, number, number],
  border: [200, 203, 210] as [number, number, number],
  bg: [245, 246, 248] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: [40, 70, 140] as [number, number, number],
  accentLight: [235, 240, 250] as [number, number, number],
};

const DOMAIN_NAMES: Record<string, string> = {
  EDM: 'Évaluer, Diriger et Surveiller',
  APO: 'Aligner, Planifier et Organiser',
  BAI: 'Bâtir, Acquérir et Implémenter',
  DSS: 'Délivrer, Servir et Supporter',
  MEA: 'Surveiller, Évaluer et Apprécier',
};

// ─── Helpers ─────────────────────────────────────────────────────────
function txt(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function fill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}

function line(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, c: [number, number, number] = C.border, w = 0.3) {
  doc.setDrawColor(c[0], c[1], c[2]);
  doc.setLineWidth(w);
  doc.line(x1, y1, x2, y2);
}

function checkPage(doc: jsPDF, y: number, need: number): number {
  if (y + need > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); return 20; }
  return y;
}

function fmtDate(d: string): string {
  try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

function priorityTxt(p: string) {
  return p === 'critical' ? 'Critique' : p === 'high' ? 'Haute' : p === 'medium' ? 'Moyenne' : 'Basse';
}

function effortTxt(e: string) {
  return e === 'low' ? 'Facile' : e === 'medium' ? 'Modéré' : 'Important';
}

function footer(doc: jsPDF, org: Organization) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = (doc as any).internal.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    line(doc, 15, ph - 12, pw - 15, ph - 12, C.border, 0.2);
    doc.setFontSize(7); txt(doc, C.muted);
    doc.text(`Maturis — Rapport COBIT 2019 · ${org.name}`, 15, ph - 7);
    doc.text(`${i}/${n}`, pw - 15, ph - 7, { align: 'right' });
  }
}

// ─── Section header ──────────────────────────────────────────────────
function sectionTitle(doc: jsPDF, y: number, title: string): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
  doc.text(title.toUpperCase(), 15, y);
  line(doc, 15, y + 1.5, w - 15, y + 1.5, C.accent, 0.5);
  return y + 7;
}

// ─── Cover Page ──────────────────────────────────────────────────────
function drawCover(doc: jsPDF, org: Organization, audit: AuditType) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Bande supérieure fine
  fill(doc, C.black);
  doc.rect(0, 0, w, 48, 'F');

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); txt(doc, C.white);
  doc.text('MATURIS', 15, 16);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Gouvernance IT · COBIT 2019', 15, 22);

  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text("Rapport d'Évaluation de Maturité", 15, 38);

  // Infos organisation
  let y = 60;
  doc.setFontSize(18); doc.setFont('helvetica', 'bold'); txt(doc, C.black);
  doc.text(org.name, 15, y);
  y += 5;

  if (org.description) {
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); txt(doc, C.text);
    const dl = doc.splitTextToSize(org.description, w - 30);
    doc.text(dl.slice(0, 2), 15, y);
    y += dl.slice(0, 2).length * 4 + 2;
  }

  line(doc, 15, y, w - 15, y);
  y += 6;

  // Grille d'infos compacte
  const infos = [
    ['Secteur', org.sector || 'N/A'],
    ['Localisation', `${org.city || ''}${org.city && org.country ? ', ' : ''}${org.country || 'N/A'}`],
    ['Employés', org.employees ? org.employees.toLocaleString('fr-FR') : 'N/A'],
    ['Forme juridique', org.legalForm || 'N/A'],
    ['Date évaluation', fmtDate(audit.date)],
    ['CA annuel', org.revenue ? `${new Intl.NumberFormat('fr-FR').format(org.revenue)} FCFA` : 'N/A'],
  ];
  const cols = 3;
  const cw = (w - 30) / cols;
  infos.forEach((info, i) => {
    const cx = 15 + (i % cols) * cw;
    const cy = y + Math.floor(i / cols) * 14;
    doc.setFontSize(7); txt(doc, C.muted); doc.setFont('helvetica', 'normal');
    doc.text(info[0].toUpperCase(), cx, cy);
    doc.setFontSize(9); txt(doc, C.black); doc.setFont('helvetica', 'bold');
    doc.text(info[1], cx, cy + 5);
  });
  y += Math.ceil(infos.length / cols) * 14 + 4;

  line(doc, 15, y, w - 15, y);
  y += 8;

  // Score global
  fill(doc, C.bg);
  doc.rect(15, y, w - 30, 22, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); txt(doc, C.text);
  doc.text('SCORE GLOBAL DE MATURITÉ', 20, y + 8);
  doc.setFontSize(28); txt(doc, C.accent);
  doc.text(`${audit.score}%`, w - 20, y + 17, { align: 'right' });
  y += 28;

  // Scores domaines mini
  y += 2;
  const domains = ['EDM', 'APO', 'BAI', 'DSS', 'MEA'] as const;
  const scores = audit.domainScores || org.domainScores || { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 };
  const dw = (w - 30) / 5;
  domains.forEach((d, i) => {
    const dx = 15 + i * dw;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); txt(doc, C.muted);
    doc.text(d, dx + dw / 2, y, { align: 'center' });
    doc.setFontSize(12); txt(doc, C.black);
    doc.text(`${scores[d]}/5`, dx + dw / 2, y + 7, { align: 'center' });
  });

  // Pied de couverture
  doc.setFontSize(7); txt(doc, C.muted); doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${fmtDate(new Date().toISOString().slice(0, 10))} · Document confidentiel`, w / 2, h - 10, { align: 'center' });
}

// ─── Domain scores ───────────────────────────────────────────────────
function drawScores(doc: jsPDF, org: Organization, audit: AuditType, y: number): number {
  const w = doc.internal.pageSize.getWidth();
  y = sectionTitle(doc, y, 'Scores par domaine COBIT 2019');

  const scores = audit.domainScores || org.domainScores || { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 };
  const domains = ['EDM', 'APO', 'BAI', 'DSS', 'MEA'] as const;

  for (const d of domains) {
    y = checkPage(doc, y, 14);
    const s = scores[d] || 0;
    const pct = s / 5;

    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
    doc.text(d, 15, y + 4);
    doc.setFont('helvetica', 'normal'); txt(doc, C.text); doc.setFontSize(8);
    doc.text(DOMAIN_NAMES[d], 30, y + 4);

    // Barre
    const bx = 105, bw = w - 150;
    fill(doc, C.bg); doc.rect(bx, y + 1, bw, 4, 'F');
    if (pct > 0) {
      const fc: [number, number, number] = pct >= 0.7 ? [60, 130, 80] : pct >= 0.4 ? [180, 140, 50] : [180, 70, 60];
      fill(doc, fc); doc.rect(bx, y + 1, Math.max(bw * pct, 2), 4, 'F');
    }

    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); txt(doc, C.black);
    doc.text(`${s}/5`, w - 15, y + 4, { align: 'right' });

    line(doc, 15, y + 8, w - 15, y + 8, C.bg, 0.2);
    y += 11;
  }
  return y;
}

// ─── Responses ───────────────────────────────────────────────────────
function drawResponses(doc: jsPDF, audit: AuditType, y: number): number {
  if (!audit.responses || audit.responses.length === 0) return y;
  const w = doc.internal.pageSize.getWidth();

  y = checkPage(doc, y, 30);
  y = sectionTitle(doc, y, 'Réponses au questionnaire');

  const grouped: Record<string, typeof audit.responses> = {};
  for (const r of audit.responses) {
    if (!grouped[r.domain]) grouped[r.domain] = [];
    grouped[r.domain]!.push(r);
  }

  for (const [domain, responses] of Object.entries(grouped)) {
    y = checkPage(doc, y, 18);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
    doc.text(`${domain} — ${DOMAIN_NAMES[domain] || domain}`, 15, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [['#', 'Question', 'Réponse', 'Score']],
      body: responses!.map((r, i) => [
        (i + 1).toString(), r.questionText, r.selectedAnswer, `${r.answerValue}/${r.scaleMax}`,
      ]),
      theme: 'plain',
      headStyles: {
        fillColor: C.black, textColor: C.white, fontStyle: 'bold', fontSize: 7, cellPadding: 2.5,
      },
      bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 50 },
        3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      },
      styles: { lineColor: C.border, lineWidth: 0.1 },
      tableWidth: w - 30,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;
  }
  return y;
}

// ─── Recommendations ────────────────────────────────────────────────
function drawRecs(doc: jsPDF, ai: AIRecommendationsResponse, y: number): number {
  const w = doc.internal.pageSize.getWidth();

  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, y, 'Recommandations');

  // Synthèse + maturité côte à côte dans un bloc compact
  if (ai.summary || ai.maturityAnalysis) {
    y = checkPage(doc, y, 28);
    fill(doc, C.bg); doc.rect(15, y, w - 30, 24, 'F');
    const halfW = (w - 36) / 2;

    if (ai.summary) {
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
      doc.text('SYNTHÈSE', 18, y + 5);
      doc.setFont('helvetica', 'normal'); txt(doc, C.text); doc.setFontSize(7);
      const sl = doc.splitTextToSize(ai.summary, halfW);
      doc.text(sl.slice(0, 4), 18, y + 10);
    }
    if (ai.maturityAnalysis) {
      const mx = 18 + (w - 36) / 2 + 6;
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
      doc.text('ANALYSE DE MATURITÉ', mx, y + 5);
      doc.setFont('helvetica', 'normal'); txt(doc, C.text); doc.setFontSize(7);
      const ml = doc.splitTextToSize(ai.maturityAnalysis, halfW);
      doc.text(ml.slice(0, 4), mx, y + 10);
    }
    y += 28;
  }

  // Quick wins en tableau compact
  const qws = ai.recommendations.flatMap(r => r.quickWins.map(q => ({ d: r.domain, t: q })));
  if (qws.length > 0) {
    y = checkPage(doc, y, 15);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); txt(doc, C.accent);
    doc.text('ACTIONS RAPIDES (QUICK WINS)', 15, y); y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [['Domaine', 'Action']],
      body: qws.map(q => [q.d, q.t]),
      theme: 'plain',
      headStyles: { fillColor: C.accent, textColor: C.white, fontStyle: 'bold', fontSize: 7, cellPadding: 2 },
      bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' }, 1: { cellWidth: 'auto' } },
      styles: { lineColor: C.border, lineWidth: 0.1 },
      tableWidth: w - 30,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Actions par domaine
  for (const rec of ai.recommendations) {
    y = checkPage(doc, y, 25);

    // Ligne domaine
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); txt(doc, C.black);
    doc.text(`${rec.domain} · ${rec.domainName}`, 15, y);
    txt(doc, C.muted); doc.setFont('helvetica', 'normal');
    doc.text(`Score ${rec.score}/5 · Priorité : ${priorityTxt(rec.priority)}`, 15, y + 4);
    y += 7;

    if (rec.actions.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: 15, right: 15 },
        head: [['Action', 'Description', 'Impact', 'Effort', 'Délai']],
        body: rec.actions.map(a => [a.title, a.description, a.impact, effortTxt(a.effort), a.timeline]),
        theme: 'plain',
        headStyles: { fillColor: C.dark, textColor: C.white, fontStyle: 'bold', fontSize: 7, cellPadding: 2 },
        bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
        alternateRowStyles: { fillColor: [250, 250, 252] },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 25 },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
        },
        styles: { lineColor: C.border, lineWidth: 0.1, overflow: 'linebreak' },
        tableWidth: w - 30,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 6;
    }
  }
  return y;
}

// ─── Public exports ──────────────────────────────────────────────────

export function exportAuditToPDF(
  org: Organization,
  audit: AuditType,
  aiRecommendations?: AIRecommendationsResponse | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawCover(doc, org, audit);

  doc.addPage();
  let y = 20;
  y = drawScores(doc, org, audit, y);
  y += 4;
  y = drawResponses(doc, audit, y);
  if (aiRecommendations) { drawRecs(doc, aiRecommendations, y); }

  footer(doc, org);
  doc.save(`Maturis_Evaluation_${org.name.replace(/\s+/g, '_')}_${audit.date}.pdf`);
}

export function exportAllAuditsToPDF(
  org: Organization,
  aiRecommendations?: AIRecommendationsResponse | null
) {
  if (!org.audits || org.audits.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const latest = org.audits[0];

  drawCover(doc, org, latest);

  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, `Historique — ${org.audits.length} évaluations`);

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Date', 'Titre', 'Score', 'EDM', 'APO', 'BAI', 'DSS', 'MEA']],
    body: org.audits.map(a => [
      fmtDate(a.date), a.title, `${a.score}%`,
      a.domainScores?.EDM?.toString() || '-', a.domainScores?.APO?.toString() || '-',
      a.domainScores?.BAI?.toString() || '-', a.domainScores?.DSS?.toString() || '-',
      a.domainScores?.MEA?.toString() || '-',
    ]),
    theme: 'plain',
    headStyles: { fillColor: C.black, textColor: C.white, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2.5 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2, textColor: C.text },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    columnStyles: {
      0: { cellWidth: 30 }, 1: { cellWidth: 'auto' },
      2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' }, 6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 12, halign: 'center' },
    },
    styles: { lineColor: C.border, lineWidth: 0.1 },
    tableWidth: w - 30,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  y = drawScores(doc, org, latest, y);
  y += 4;

  for (const audit of org.audits) {
    if (audit.responses && audit.responses.length > 0) {
      y = checkPage(doc, y, 15);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); txt(doc, C.black);
      doc.text(`Réponses — ${fmtDate(audit.date)} (${audit.title})`, 15, y); y += 4;
      y = drawResponses(doc, audit, y);
    }
  }

  if (aiRecommendations) { y = drawRecs(doc, aiRecommendations, y); }

  footer(doc, org);
  doc.save(`Maturis_Rapport_Complet_${org.name.replace(/\s+/g, '_')}.pdf`);
}
