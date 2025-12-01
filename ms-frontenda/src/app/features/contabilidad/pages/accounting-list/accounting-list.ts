import { Component, OnInit } from '@angular/core';
import {
  AccountingEntry,
  AccountingSummaryResponse,
  AccountBalanceResponse,
} from '../../../../models/accounting.model';
import { AccountingService } from '../../../../services/accounting';

interface EntryFilter {
  search: string;
  minAmount: number | null;
  maxAmount: number | null;
}

interface AccountingJournalLine {
  account: string;
  debit: number;
  credit: number;
}

interface AccountingJournalEntry {
  date: string;
  type: string;          // COMPRA, VENTA, AJUSTE
  referenceType?: string;
  referenceId?: number;
  lines: AccountingJournalLine[];
  journalNumber?: number; // 👈 nuevo
}

@Component({
  selector: 'app-accounting-list',
  standalone: false,
  templateUrl: './accounting-list.html',
  styleUrl: './accounting-list.scss',
})
export class AccountingList implements OnInit {
  // Filtros de fecha / tipo
  from = '';
  to = '';
  type: string = ''; // COMPRA | VENTA | AJUSTE | ''
  journalEntries: AccountingJournalEntry[] = [];

  // 👉 NUEVO: selector de vista/libro
  // ASIENTOS = lista normal
  selectedBook: 'ASIENTOS' | 'DIARIO' | 'CAJA_BANCOS' = 'ASIENTOS';

  // Resumen general
  summary: AccountingSummaryResponse | null = null;
  summaryLoading = false;
  summaryError: string | null = null;

  // Saldo por cuenta
  accountName = 'Resultados'; // p.ej. Inventarios, Caja, Ventas
  accountBalance: AccountBalanceResponse | null = null;
  accountLoading = false;
  accountError: string | null = null;

  // Asientos
  entries: AccountingEntry[] = [];
  filteredEntries: AccountingEntry[] = [];
  entriesLoading = false;
  entriesError: string | null = null;

  filter: EntryFilter = {
    search: '',
    minAmount: null,
    maxAmount: null,
  };

  // 👉 Mapa simple de nombres a números de cuenta (PCGE Perú aprox)
  private accountCodes: Record<string, string> = {
    'Caja': '10',
    'Bancos': '10',
    'Clientes': '12',
    'Inventarios': '20',
    'Mercaderías': '20',
    'Proveedores': '42',
    'Compras': '60',
    'Costo de ventas': '69',
    'Ventas': '70',
    'Resultados': '89', // resultado del ejercicio (aprox)
  };

  // 👉 Botones rápidos de cuentas frecuentes
  quickAccounts: string[] = [
    'Caja',
    'Bancos',
    'Inventarios',
    'Compras',
    'Ventas',
    'Proveedores',
    'Clientes',
    'Resultados',
  ];

  constructor(private accountingService: AccountingService) {}

  ngOnInit(): void {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    this.from = monthStart.toISOString().slice(0, 10); // yyyy-MM-dd
    this.to = today.toISOString().slice(0, 10);

    this.loadAll();
  }

  // === Helpers ===

  // 👉 cambia entre Asientos / Diario / Caja y bancos
  selectBook(book: 'ASIENTOS' | 'DIARIO' | 'CAJA_BANCOS'): void {
    this.selectedBook = book;
    // Más adelante aquí conectamos generación de libro diario / caja y bancos.
  }

  getAccountCode(name?: string | null): string {
    if (!name) return '—';
    const key = name.trim();
    return this.accountCodes[key] ?? '—';
  }

  // Totales para mostrar debajo de la tabla
  get totalEntriesCount(): number {
    return this.filteredEntries.length;
  }

  get totalEntriesAmount(): number {
    return this.filteredEntries.reduce((acc, e) => {
      const amount = Number(e.amount) || 0;
      return acc + amount;
    }, 0);
  }

  // === Cargas principales ===

  loadAll(): void {
    this.loadSummary();
    this.loadEntries();
    this.loadAccountBalance();
  }

  onDatesChange(): void {
    this.loadAll();
  }

  onTypeChange(): void {
    this.loadEntries();
  }

  onAccountChange(): void {
    this.loadAccountBalance();
  }

  // para botones rápidos de cuentas
  setQuickAccount(name: string): void {
    this.accountName = name;
    this.loadAccountBalance();
  }

  onFilterChange(): void {
    this.applyEntryFilter();
  }

  private loadSummary(): void {
    this.summaryLoading = true;
    this.summaryError = null;

    this.accountingService.getSummary(this.from, this.to).subscribe({
      next: (res) => {
        this.summary = res;
        this.summaryLoading = false;
      },
      error: (err) => {
        console.error('Error cargando resumen contable', err);
        this.summaryLoading = false;
        this.summary = null;
        this.summaryError = 'No se pudo cargar el resumen contable.';
      },
    });
  }

  private loadEntries(): void {
    this.entriesLoading = true;
    this.entriesError = null;

    const typeParam = this.type ? this.type : undefined;

    this.accountingService.getEntries(this.from, this.to, typeParam).subscribe({
      next: (res) => {
        this.entries = res;
        this.entriesLoading = false;
        this.applyEntryFilter();
      },
      error: (err) => {
        console.error('Error cargando asientos contables', err);
        this.entriesLoading = false;
        this.entries = [];
        this.filteredEntries = [];
        this.entriesError = 'No se pudieron cargar los asientos contables.';
      },
    });
  }

  private loadAccountBalance(): void {
    if (!this.accountName.trim()) {
      this.accountBalance = null;
      return;
    }

    this.accountLoading = true;
    this.accountError = null;

    this.accountingService
      .getAccountBalance(this.accountName.trim(), this.from, this.to)
      .subscribe({
        next: (res) => {
          this.accountBalance = res;
          this.accountLoading = false;
        },
        error: (err) => {
          console.error('Error cargando saldo de cuenta', err);
          this.accountLoading = false;
          this.accountBalance = null;
          this.accountError = 'No se pudo cargar el saldo de la cuenta.';
        },
      });
  }

  private applyEntryFilter(): void {
    const search = this.filter.search.toLowerCase().trim();
    const min = this.filter.minAmount;
    const max = this.filter.maxAmount;

    this.filteredEntries = this.entries.filter((e) => {
      const text =
        (e.debitAccount || '') +
        ' ' +
        (e.creditAccount || '') +
        ' ' +
        (e.type || '') +
        ' ' +
        (e.description || '');

      const matchesSearch = !search
        ? true
        : text.toLowerCase().includes(search);

      const amount = Number(e.amount) || 0;
      const matchesMin = min != null ? amount >= min : true;
      const matchesMax = max != null ? amount <= max : true;

      return matchesSearch && matchesMin && matchesMax;
    });

    // 👉 importante: reconstruir la vista agrupada por asiento
    this.rebuildJournalView();
  }

  private rebuildJournalView() {
    const groups = new Map<string, AccountingJournalEntry>();

    for (const e of this.filteredEntries) {
      const key = `${e.type}|${e.referenceType}|${e.referenceId}`;

      let g = groups.get(key);
      if (!g) {
        g = {
          date: e.date,
          type: e.type,
          referenceType: e.referenceType,
          referenceId: e.referenceId,
          lines: []
        };
        groups.set(key, g);
      }

      const touchAccount = (
        account: string | null | undefined,
        side: 'debit' | 'credit',
        amount: number
      ) => {
        if (!account) return;
        let line = g!.lines.find(l => l.account === account);
        if (!line) {
          line = {account, debit: 0, credit: 0};
          g!.lines.push(line);
        }
        line[side] += amount;
      };

      touchAccount(e.debitAccount, 'debit', e.amount);
      touchAccount(e.creditAccount, 'credit', e.amount);
    }

    // Pasar el map a array y ordenar por fecha
    const list = Array.from(groups.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    // Asignar número de asiento SOLO EN EL FRONT
    list.forEach((j, idx) => {
      j.journalNumber = idx + 1; // 1, 2, 3, ...
    });

    this.journalEntries = list;
  }
}
