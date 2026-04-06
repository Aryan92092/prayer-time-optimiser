import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { predictMoodAI } from './moodService';

// ─── Drawing Helpers ───────────────────────────────────────────────────────────

/**
 * Draws a smooth line chart of overall wellness scores.
 * @param {jsPDF} doc
 * @param {Array} checkins  - all check-in records
 * @param {number} originX  - left edge
 * @param {number} originY  - top edge
 * @param {number} width    - chart width
 * @param {number} height   - chart height
 */
const drawLineChart = (doc, checkins, originX, originY, width, height) => {
    const pC = [124, 58, 237];   // primary purple
    const aC = [245, 158, 11];   // accent saffron
    const mC = [100, 116, 139];  // muted

    // Background card
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(originX, originY, width, height, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(originX, originY, width, height, 4, 4, 'S');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Wellness Score Over Time', originX + 6, originY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mC);
    doc.text('Overall wellness % per check-in', originX + 6, originY + 13);

    const padL = 14, padR = 10, padT = 20, padB = 18;
    const chartX = originX + padL;
    const chartY = originY + padT;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    // Y-axis gridlines (0, 25, 50, 75, 100)
    [0, 25, 50, 75, 100].forEach(pct => {
        const y = chartY + chartH - (pct / 100) * chartH;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(chartX, y, chartX + chartW, y);
        doc.setFontSize(6);
        doc.setTextColor(...mC);
        doc.text(`${pct}`, originX + padL - 3, y + 1, { align: 'right' });
    });

    if (checkins.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...mC);
        doc.text('No data yet', chartX + chartW / 2, chartY + chartH / 2, { align: 'center' });
        return;
    }

    // Compute points
    const points = checkins.map((c, i) => {
        const mst = c.mood_score ?? c.mood ?? 0;
        const slp = c.sleep_score ?? c.sleep ?? 0;
        const spr = c.spiritual_score ?? c.spiritual ?? 0;
        const str = c.stress_score ?? c.stress ?? 0;
        const hp = c.hope_score ?? c.hope ?? 0;

        const avg = (mst + slp + spr + str + hp) / 5;
        const pct = (avg / 5) * 100;
        const x = chartX + (checkins.length === 1 ? chartW / 2 : i * (chartW / (checkins.length - 1)));
        const y = chartY + chartH - (pct / 100) * chartH;
        return { x, y, pct };
    });

    // Shaded area under line (fill)
    if (points.length > 1) {
        // Draw simple area via overlapping rects (simplified)
        for (let i = 0; i < points.length - 1; i++) {
            const x1 = points[i].x, y1 = points[i].y;
            const x2 = points[i + 1].x, y2 = points[i + 1].y;
            const bottom = chartY + chartH;
            doc.setFillColor(243, 232, 255); // Valid RGB light purple
            const minY = Math.min(y1, y2);
            const fillH = bottom - minY;
            doc.rect(x1, minY, x2 - x1, fillH, 'F');
        }
    }

    // Line segments
    doc.setDrawColor(...pC);
    doc.setLineWidth(1.2);
    for (let i = 0; i < points.length - 1; i++) {
        doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }

    // Data points + date labels
    points.forEach((p, i) => {
        // Outer ring
        doc.setFillColor(255, 255, 255);
        doc.circle(p.x, p.y, 2, 'F');
        // Inner dot
        doc.setFillColor(...pC);
        doc.circle(p.x, p.y, 1.2, 'F');

        // Value tooltip above dot
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...pC);
        doc.text(`${Math.round(p.pct)}%`, p.x, p.y - 3.5, { align: 'center' });

        // Date label below
        const dateStr = new Date(checkins[i].created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...mC);
        doc.text(dateStr, p.x, chartY + chartH + 6, { align: 'center' });
    });

    // If only 1 point, draw the single point
    if (points.length === 1) {
        doc.setFillColor(...aC);
        doc.circle(points[0].x, points[0].y, 2.5, 'F');
    }
};

/**
 * Draw a grouped bar chart comparing last two check-ins across 5 dimensions.
 */
const drawBarChart = (doc, checkins, originX, originY, width, height) => {
    const prev = checkins.length >= 2 ? checkins[checkins.length - 2] : null;
    const curr = checkins.length >= 1 ? checkins[checkins.length - 1] : null;

    const pC = [124, 58, 237];
    const aC = [245, 158, 11];
    const mC = [100, 116, 139];
    const dimKeys = ['mood_score', 'sleep_score', 'spiritual_score', 'stress_score', 'hope_score'];
    const dimNames = ['Mood', 'Sleep', 'Spirit', 'Calm', 'Hope'];

    // Background card
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(originX, originY, width, height, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(originX, originY, width, height, 4, 4, 'S');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Dimension Comparison', originX + 6, originY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mC);
    doc.text('Previous vs Latest check-in (score /5)', originX + 6, originY + 13);

    // Legend
    doc.setFillColor(...mC);
    doc.rect(originX + width - 44, originY + 6, 4, 4, 'F');
    doc.setFontSize(6);
    doc.setTextColor(...mC);
    doc.text('Previous', originX + width - 38, originY + 10);
    doc.setFillColor(...pC);
    doc.rect(originX + width - 20, originY + 6, 4, 4, 'F');
    doc.setTextColor(...pC);
    doc.text('Latest', originX + width - 14, originY + 10);

    const padL = 14, padR = 8, padT = 20, padB = 18;
    const chartX = originX + padL;
    const chartY = originY + padT;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    if (!curr) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...mC);
        doc.text('No check-in data yet', chartX + chartW / 2, chartY + chartH / 2, { align: 'center' });
        return;
    }

    // Y gridlines (1-5 scale)
    [1, 2, 3, 4, 5].forEach(v => {
        const y = chartY + chartH - ((v / 5) * chartH);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(chartX, y, chartX + chartW, y);
        doc.setFontSize(6);
        doc.setTextColor(...mC);
        doc.text(`${v}`, chartX - 2, y + 1, { align: 'right' });
    });

    const groupW = chartW / dimKeys.length;
    const barW = groupW * 0.3;
    const gap = barW * 0.4;

    dimKeys.forEach((key, i) => {
        const groupX = chartX + i * groupW + groupW / 2;

        // Previous bar (muted grey)
        if (prev) {
            const prevVal = prev[key] ?? prev[key.replace('_score', '')] ?? 0;
            const barH = (prevVal / 5) * chartH;
            const bx = groupX - barW - gap / 2;
            const by = chartY + chartH - barH;
            doc.setFillColor(203, 213, 225);
            doc.roundedRect(bx, by, barW, barH, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.setTextColor(...mC);
            doc.text(`${prevVal}`, bx + barW / 2, by - 2, { align: 'center' });
        }

        // Current bar (primary purple)
        const currVal = curr[key] ?? curr[key.replace('_score', '')] ?? 0;
        const barH = (currVal / 5) * chartH;
        const bx = groupX + gap / 2;
        const by = chartY + chartH - barH;
        doc.setFillColor(...pC);
        doc.roundedRect(bx, by, barW, barH, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(...pC);
        doc.text(`${currVal}`, bx + barW / 2, by - 2, { align: 'center' });

        // Dimension label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(15, 23, 42);
        doc.text(dimNames[i], groupX, chartY + chartH + 6, { align: 'center' });
    });
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const generateMoodReport = (user, checkins) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const ai = predictMoodAI(checkins);

    const pC = [124, 58, 237];
    const aC = [245, 158, 11];
    const eC = [16, 185, 129];
    const darkText = [15, 23, 42];
    const muted = [100, 116, 139];
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── PAGE 1: HEADER + STATS + CHARTS ──────────────────────────────────────

    // Header gradient bg
    doc.setFillColor(...pC);
    doc.rect(0, 0, pageW, 50, 'F');
    doc.setFillColor(245, 158, 11);
    doc.circle(pageW - 15, -8, 36, 'F');
    doc.setFillColor(124, 58, 237);
    doc.circle(-8, 55, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Wellness & Mood Report', 14, 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('HopePath - AI-Powered Spiritual Wellness Companion', 14, 27);
    doc.setFillColor(255, 255, 255, 25);
    doc.roundedRect(14, 33, 150, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(
        `${user?.name || 'Seeker'}  |  ${user?.email || ''}  |  Generated ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        17, 39.5
    );

    // ── Stat boxes ──
    let y = 58;
    const avgByField = (f) => {
        if (!checkins.length) return '—';
        const sum = checkins.reduce((s, c) => {
            const val = c[f] ?? c[f.replace('_score', '')] ?? 0;
            return s + val;
        }, 0);
        return (sum / checkins.length).toFixed(1);
    };
    const stats = [
        { label: 'Check-ins', value: checkins.length },
        { label: 'Avg Mood', value: `${avgByField('mood_score')}/5` },
        { label: 'Avg Sleep', value: `${avgByField('sleep_score')}/5` },
        { label: 'Avg Calm', value: `${avgByField('stress_score')}/5` },
        { label: 'Avg Hope', value: `${avgByField('hope_score')}/5` },
    ];
    const bw = (pageW - 28 - 4 * 4) / 5;
    stats.forEach((s, i) => {
        const x = 14 + i * (bw + 4);
        doc.setFillColor(237, 233, 254);
        doc.roundedRect(x, y, bw, 20, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...pC);
        doc.text(String(s.value), x + bw / 2, y + 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...muted);
        doc.text(s.label.toUpperCase(), x + bw / 2, y + 17, { align: 'center' });
    });
    y += 28;

    // ── Charts (side by side) ──
    const chartH = 65;
    const chartW = (pageW - 28 - 6) / 2;
    drawLineChart(doc, checkins, 14, y, chartW, chartH);
    drawBarChart(doc, checkins, 14 + chartW + 6, y, chartW, chartH);
    y += chartH + 10;

    // ── Latest state banner ──
    if (checkins.length > 0) {
        const last = checkins[checkins.length - 1];
        const mst = last.mood_score ?? last.mood ?? 0;
        const slp = last.sleep_score ?? last.sleep ?? 0;
        const spr = last.spiritual_score ?? last.spiritual ?? 0;
        const str = last.stress_score ?? last.stress ?? 0;
        const hp = last.hope_score ?? last.hope ?? 0;

        const pct = Math.round(((mst + slp + spr + str + hp) / 25) * 100);
        const label = pct >= 80 ? 'Thriving' : pct >= 60 ? 'Balanced' : pct >= 40 ? 'Needs Care' : 'Struggling';
        doc.setFillColor(237, 233, 254);
        doc.roundedRect(14, y, pageW - 28, 16, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...pC);
        doc.text(`Latest State: ${label}  (${pct}%)`, 19, y + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...darkText);
        doc.text(pct >= 60 ? 'Keep nurturing your practice.' : 'Be gentle with yourself. Small steps forward.', 19, y + 13);
        y += 22;
    }

    // ── AI Prediction section ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.text('AI Wellness Prediction', 14, y);
    doc.setDrawColor(...aC);
    doc.setLineWidth(0.8);
    doc.line(14, y + 1.5, 62, y + 1.5);
    y += 8;

    // Trend + predicted score card
    const trendColors = { emerald: eC, primary: pC, yellow: aC, red: [239, 68, 68] };
    const tRgb = trendColors[ai.trendColor] || pC;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, y, pageW - 28, 38, 4, 4, 'F');
    doc.setDrawColor(...tRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, pageW - 28, 38, 4, 4, 'S');

    doc.setFillColor(...tRgb);
    doc.roundedRect(18, y + 4, 48, 7, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${ai.trend.toUpperCase()} TREND`, 42, y + 8.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...tRgb);
    doc.text(ai.predictedScore !== null ? `${ai.predictedScore}%` : '—', pageW - 18, y + 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text('PREDICTED WELLNESS SCORE', pageW - 18, y + 24, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.text(`Predicted State: ${ai.predictedState || '—'}`, 18, y + 20);

    if (ai.weakestDimension) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...muted);
        doc.text(`Needs attention: ${ai.weakestDimension}`, 18, y + 28);
        doc.setTextColor(...eC[0] ? eC : [16, 185, 129]);
        doc.setTextColor(16, 185, 129);
        doc.text(`Strongest area: ${ai.strongestDimension}`, 18, y + 34);
    }
    y += 45;

    // AI insights
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.text('AI Insights', 14, y);
    y += 5;
    ai.insights.forEach((ins) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkText);
        const lines = doc.splitTextToSize(`- ${ins}`, pageW - 32);
        doc.text(lines, 18, y);
        y += lines.length * 4.5 + 1.5;
    });
    y += 3;

    // Next step box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageW - 28, 20, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, y, pageW - 28, 20, 3, 3, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    doc.text('AI Recommended Next Step', 18, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkText);
    const stepLines = doc.splitTextToSize(ai.nextStep, pageW - 36);
    doc.text(stepLines, 18, y + 13);
    y += 27;

    // Action plan
    if (ai.dimensionAdvice?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...darkText);
        doc.text(`Focus Area Plan - Improve Your ${ai.weakestDimension}`, 14, y);
        y += 5;
        ai.dimensionAdvice.forEach((step, i) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...darkText);
            const lines = doc.splitTextToSize(`${i + 1}. ${step}`, pageW - 32);
            doc.text(lines, 18, y);
            y += lines.length * 4.5 + 1.5;
        });
        y += 3;
    }

    // PAGE BREAK check
    if (y > pageH - 60) {
        doc.addPage();
        y = 20;
    }

    // ── Check-in history table ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.text('Check-in History', 14, y);
    doc.setDrawColor(...aC);
    doc.setLineWidth(0.8);
    doc.line(14, y + 1.5, 52, y + 1.5);
    y += 7;

    if (checkins.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...muted);
        doc.text('No check-ins recorded yet.', 14, y);
    } else {
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Mood', 'Sleep', 'Spiritual', 'Calm', 'Hope', 'Overall']],
            body: checkins.map((c) => {
                const mst = c.mood_score ?? c.mood ?? 0;
                const slp = c.sleep_score ?? c.sleep ?? 0;
                const spr = c.spiritual_score ?? c.spiritual ?? 0;
                const str = c.stress_score ?? c.stress ?? 0;
                const hp = c.hope_score ?? c.hope ?? 0;
                const avg = ((mst + slp + spr + str + hp) / 5).toFixed(1);
                return [
                    new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    `${mst}/5`, `${slp}/5`, `${spr}/5`,
                    `${str}/5`, `${hp}/5`, `${avg}/5`,
                ];
            }),
            styles: { fontSize: 8, cellPadding: 3.5, font: 'helvetica', textColor: darkText },
            headStyles: { fillColor: pC, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 6: { fontStyle: 'bold', textColor: pC } },
            margin: { left: 14, right: 14 },
        });
    }

    // Footer on last page
    const footerY = pageH - 12;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, footerY - 3, pageW - 14, footerY - 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text('HopePath Wellness - AI predictions are for personal reflection only and do not constitute medical advice.', pageW / 2, footerY, { align: 'center' });

    doc.save(`hopepath_wellness_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
