import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { CountSession } from '../models';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private fontData: string | null = null;
  private fontLoading: Promise<string | null> | null = null;

  async generateSessionReport(session: CountSession): Promise<void> {
    const doc = new jsPDF();
    await this.ensureFont(doc);

    const total = session.items.reduce((sum, item) => sum + item.count, 0);
    const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const finishedAt = session.finishedAt ?? '—';

    doc.setFontSize(15);
    doc.text('Неофициален протокол - Паралелно преброяване', 14, 20);
    doc.setFontSize(10);
    doc.text(`Вид: ${session.mode === 'ballots' ? 'Броене на бюлетини' : 'Броене на преференции'}`, 14, 30);
    doc.text(`Сесия ID: ${session.id}`, 14, 36);
    doc.text(`Старт: ${session.startedAt.replace('T', ' ').slice(0, 19)}`, 14, 42);
    doc.text(`Край: ${finishedAt.replace('T', ' ').slice(0, 19)}`, 14, 48);

    autoTable(doc, {
      startY: 58,
      head: [['№', 'Позиция', 'Гласове']],
      body: session.items.map((item) => [item.ballotNumber, item.label, item.count]),
      foot: [['', 'ОБЩО', total]],
      theme: 'grid',
      styles: {
        font: this.fontData ? 'DejaVuSans' : 'helvetica',
        fontStyle: 'normal',
      },
      headStyles: {
        fillColor: [16, 72, 89],
        fontStyle: 'normal',
      },
      footStyles: {
        fillColor: [230, 236, 239],
        textColor: [17, 24, 39],
        fontStyle: 'normal',
      },
    });

    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 58;
    doc.text(`Генерирано на: ${generatedAt}`, 14, finalY + 12);
    doc.text('Внимание: Неофициален документ.', 14, finalY + 18);
    doc.text('Само за целите на паралелното преброяване.', 14, finalY + 24);

    doc.save(`broene-${session.id}.pdf`);
  }

  private async ensureFont(doc: jsPDF): Promise<void> {
    if (!this.fontLoading) {
      this.fontLoading = fetch('assets/fonts/DejaVuSans.ttf')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Missing DejaVu Sans font asset');
          }

          const buffer = await response.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';

          bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
          });

          return btoa(binary);
        })
        .catch(() => {
          return null;
        });
    }

    this.fontData = await this.fontLoading;

    if (this.fontData) {
      doc.addFileToVFS('DejaVuSans.ttf', this.fontData);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'bold');
      doc.setFont('DejaVuSans', 'normal');
    } else {
      doc.setFont('helvetica');
    }
  }
}
