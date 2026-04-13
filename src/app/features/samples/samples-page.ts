import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChildren,
} from '@angular/core';

interface InvoiceItem {
  desc: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface InvoiceData {
  id: string;
  label: string;
  supplier: { name: string; address: string; vat: string; phone: string };
  docNumber: string;
  date: string;
  customer: string;
  items: InvoiceItem[];
}

const INVOICES: InvoiceData[] = [
  {
    id: 'bolla-1-frutta-verdura',
    label: 'Bolla 1 — Frutta & Verdura',
    supplier: {
      name: 'ORTOFRUTTICOLA LOMBARDA S.R.L.',
      address: "Via dell'Agricoltura 14, 20090 Segrate (MI)",
      vat: 'IT08234561230',
      phone: '02 9876543',
    },
    docNumber: '2026/0394',
    date: '10/04/2026',
    customer: 'Ristorante La Cucina di Casa',
    items: [
      { desc: 'Pomodori San Marzano',         qty: 5,   unit: 'kg', unitPrice: 2.40 },
      { desc: 'Zucchine verdi',                qty: 3,   unit: 'kg', unitPrice: 1.80 },
      { desc: 'Patate gialle a pasta gialla',  qty: 10,  unit: 'kg', unitPrice: 0.95 },
      { desc: 'Cipolla bianca',                qty: 2,   unit: 'kg', unitPrice: 1.20 },
      { desc: 'Carote novelle',                qty: 3,   unit: 'kg', unitPrice: 1.50 },
      { desc: 'Basilico fresco',               qty: 0.5, unit: 'kg', unitPrice: 8.00 },
      { desc: 'Aglio bianco',                  qty: 1,   unit: 'kg', unitPrice: 5.60 },
      { desc: 'Limoni Sicilia non trattati',   qty: 2,   unit: 'kg', unitPrice: 2.10 },
      { desc: 'Insalata romana',               qty: 4,   unit: 'pz', unitPrice: 0.90 },
      { desc: 'Peperoni rossi',                qty: 2,   unit: 'kg', unitPrice: 3.20 },
    ],
  },
  {
    id: 'bolla-2-carni-salumi',
    label: 'Bolla 2 — Carni & Salumi',
    supplier: {
      name: 'MACELLERIA INDUSTRIA PADANA S.P.A.',
      address: 'Via Carnello 88, 46100 Mantova (MN)',
      vat: 'IT03451290233',
      phone: '0376 445566',
    },
    docNumber: '2026/1182',
    date: '11/04/2026',
    customer: 'Ristorante La Cucina di Casa',
    items: [
      { desc: 'Petto di pollo senza osso',  qty: 3,   unit: 'kg', unitPrice: 7.80  },
      { desc: 'Coscia di agnello',           qty: 2,   unit: 'kg', unitPrice: 14.50 },
      { desc: 'Filetto di manzo fassona',    qty: 1.5, unit: 'kg', unitPrice: 32.00 },
      { desc: 'Salsiccia di maiale fresca',  qty: 2,   unit: 'kg', unitPrice: 9.20  },
      { desc: 'Prosciutto crudo 24 mesi',    qty: 1,   unit: 'kg', unitPrice: 22.00 },
      { desc: 'Pancetta tesa',               qty: 0.5, unit: 'kg', unitPrice: 11.50 },
      { desc: 'Spalla di vitello',           qty: 2,   unit: 'kg', unitPrice: 10.80 },
      { desc: 'Guanciale affumicato',        qty: 0.8, unit: 'kg', unitPrice: 13.00 },
    ],
  },
  {
    id: 'bolla-3-latticini-secco',
    label: 'Bolla 3 — Latticini & Dispensa',
    supplier: {
      name: 'DISTRIBUZIONE AGROALIMENTARE CENTRO SUD S.R.L.',
      address: 'Via Mazzini 203, 81100 Caserta (CE)',
      vat: 'IT07812340611',
      phone: '0823 331122',
    },
    docNumber: '2026/0781',
    date: '12/04/2026',
    customer: 'Ristorante La Cucina di Casa',
    items: [
      { desc: 'Parmigiano Reggiano 24 mesi',   qty: 2,    unit: 'kg', unitPrice: 19.00 },
      { desc: 'Mozzarella di bufala DOP',        qty: 1.5,  unit: 'kg', unitPrice: 15.50 },
      { desc: 'Ricotta vaccina fresca',          qty: 1,    unit: 'kg', unitPrice: 5.80  },
      { desc: 'Burro non salato 82%',            qty: 1,    unit: 'kg', unitPrice: 8.40  },
      { desc: 'Olio extra vergine oliva DOP',    qty: 5,    unit: 'l',  unitPrice: 9.50  },
      { desc: 'Farina 00 tipo forte W320',       qty: 10,   unit: 'kg', unitPrice: 0.85  },
      { desc: 'Semolina rimacinata',             qty: 5,    unit: 'kg', unitPrice: 1.10  },
      { desc: 'Zucchero semolato',               qty: 3,    unit: 'kg', unitPrice: 1.25  },
      { desc: 'Sale fino marino',                qty: 2,    unit: 'kg', unitPrice: 0.60  },
      { desc: 'Aceto balsamico di Modena IGP',   qty: 0.75, unit: 'l',  unitPrice: 18.00 },
      { desc: 'Vino bianco secco per cucina',    qty: 1.5,  unit: 'l',  unitPrice: 4.20  },
    ],
  },
];

@Component({
  selector: 'app-samples-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Bolle di consegna campione</h1>
          <p class="page-subtitle">
            Scarica un PNG e caricalo in <strong>Documenti / OCR</strong> per testare il riconoscimento automatico
          </p>
        </div>
      </div>

      @for (inv of invoices; track inv.id; let i = $index) {
        <div class="sample-block card mb-6">
          <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
            <h2 class="card-title">{{ inv.label }}</h2>
            <button class="btn-primary" (click)="download(i)">⬇ Scarica PNG</button>
          </div>
          <div style="overflow-x:auto">
            <canvas #invoiceCanvas style="display:block;max-width:100%"></canvas>
          </div>
        </div>
      }
    </div>
  `,
})
export class SamplesPage implements AfterViewInit {
  readonly invoices = INVOICES;

  private readonly canvases = viewChildren<ElementRef<HTMLCanvasElement>>('invoiceCanvas');

  ngAfterViewInit(): void {
    const els = this.canvases();
    INVOICES.forEach((inv, i) => {
      const canvas = els[i]?.nativeElement;
      if (canvas) this.draw(canvas, inv);
    });
  }

  download(index: number): void {
    const canvas = this.canvases()[index]?.nativeElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = INVOICES[index].id + '.png';
    a.click();
  }

  private draw(canvas: HTMLCanvasElement, inv: InvoiceData): void {
    const W = 700;
    const H = 520 + inv.items.length * 28;
    canvas.width  = W * 2;
    canvas.height = H * 2;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Intestazione fornitore
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText(inv.supplier.name, 38, 50);
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#555555';
    ctx.fillText(inv.supplier.address, 38, 65);
    ctx.fillText('P.IVA: ' + inv.supplier.vat + '   Tel: ' + inv.supplier.phone, 38, 78);

    // Titolo documento
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillText('BOLLA DI CONSEGNA N. ' + inv.docNumber, 38, 108);
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#555555';
    ctx.fillText('Data: ' + inv.date + '    Destinatario: ' + inv.customer, 38, 122);

    ctx.strokeStyle = '#999999';
    ctx.beginPath(); ctx.moveTo(38, 130); ctx.lineTo(W - 38, 130); ctx.stroke();

    // Header tabella
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 10px "Courier New"';
    let y = 148;
    ctx.fillText('DESCRIZIONE PRODOTTO', 38,  y);
    ctx.fillText('QTÀ',                 370, y);
    ctx.fillText('U.M.',                420, y);
    ctx.fillText('PREZZO UNIT.',        468, y);
    ctx.fillText('IMPORTO',             574, y);
    ctx.beginPath(); ctx.moveTo(38, y + 6); ctx.lineTo(W - 38, y + 6); ctx.stroke();

    // Righe
    y += 24;
    ctx.font = '10px "Courier New"';
    for (const item of inv.items) {
      ctx.fillStyle = '#111111';
      ctx.fillText(item.desc,                                           38,  y);
      ctx.fillText(String(item.qty),                                   370, y);
      ctx.fillText(item.unit,                                          420, y);
      ctx.fillText(this.fmt(item.unitPrice) + ' €/' + item.unit,      468, y);
      ctx.fillText(this.fmt(item.qty * item.unitPrice) + ' €',        574, y);
      y += 28;
    }

    ctx.beginPath(); ctx.moveTo(38, y); ctx.lineTo(W - 38, y); ctx.stroke();
    y += 16;

    const grand = inv.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const iva   = grand * 0.1;

    ctx.font = 'bold 11px "Courier New"';
    ctx.fillStyle = '#111111';
    ctx.fillText('TOTALE MERCE:', 430, y);
    ctx.fillText(this.fmt(grand) + ' €', 574, y);
    y += 20;
    ctx.font = '10px "Courier New"';
    ctx.fillText('IVA 10%:', 430, y);
    ctx.fillText(this.fmt(iva) + ' €', 574, y);
    y += 20;
    ctx.font = 'bold 12px "Courier New"';
    ctx.fillText('TOTALE DA PAGARE:', 430, y);
    ctx.fillText(this.fmt(grand + iva) + ' €', 574, y);
    y += 32;

    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#777777';
    ctx.fillText('Pagamento: Bonifico bancario 30 gg data fattura', 38, y); y += 14;
    ctx.fillText('Trasporto: a carico del fornitore. Merce viaggia a rischio del destinatario.', 38, y); y += 14;
    ctx.fillText('Merci controllate e accettate dal destinatario alla consegna.', 38, y); y += 28;
    ctx.fillText('Firma destinatario: ________________________', 38, y);
    ctx.fillText('Firma autista: ________________', 430, y);
  }

  private fmt(n: number): string {
    return n.toFixed(2).replace('.', ',');
  }
}
