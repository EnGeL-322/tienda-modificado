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
  journalNumber?: number;
  description?: string;  // glosa (tomada del primer detalle)
}

interface CashBankRow {
  correlativo: number;
  date: string;
  description?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
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

  // Vista agrupada de asientos (para "Asientos" y "Libro diario")
  journalEntries: AccountingJournalEntry[] = [];

  // Libro caja y bancos
  cashBankRows: CashBankRow[] = [];

  // Qué vista está activa
  selectedBook: 'ASIENTOS' | 'DIARIO' | 'CAJA_BANCOS' = 'ASIENTOS';

  // Resumen general
  summary: AccountingSummaryResponse | null = null;
  summaryLoading = false;
  summaryError: string | null = null;

  // Saldo por cuenta
  accountName = 'Resultados';
  accountBalance: AccountBalanceResponse | null = null;
  accountLoading = false;
  accountError: string | null = null;

  // Asientos crudos
  entries: AccountingEntry[] = [];
  filteredEntries: AccountingEntry[] = [];
  entriesLoading = false;
  entriesError: string | null = null;

  filter: EntryFilter = {
    search: '',
    minAmount: null,
    maxAmount: null,
  };

  // Mapa simple de nombres a números de cuenta
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
    'Resultados': '89',
  };

  // Botones rápidos
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

    this.from = monthStart.toISOString().slice(0, 10);
    this.to = today.toISOString().slice(0, 10);

    this.loadAll();
  }

  // === Helpers ===

  getAccountCode(name?: string | null): string {
    if (!name) return '—';
    const key = name.trim();
    return this.accountCodes[key] ?? '—';
  }

  // Totales para asientos agrupados
  get totalEntriesCount(): number {
    return this.filteredEntries.length;
  }

  get totalEntriesAmount(): number {
    return this.filteredEntries.reduce((acc, e) => {
      const amount = Number(e.amount) || 0;
      return acc + amount;
    }, 0);
  }

  // Totales libro caja y bancos
  get totalCashDebits(): number {
    return this.cashBankRows.reduce((sum, r) => sum + (r.debit || 0), 0);
  }

  get totalCashCredits(): number {
    return this.cashBankRows.reduce((sum, r) => sum + (r.credit || 0), 0);
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

  setQuickAccount(name: string): void {
    this.accountName = name;
    this.loadAccountBalance();
  }

  onFilterChange(): void {
    this.applyEntryFilter();
  }

  selectBook(book: 'ASIENTOS' | 'DIARIO' | 'CAJA_BANCOS'): void {
    this.selectedBook = book;
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

    this.accountingService
      .getEntries(this.from, this.to, typeParam)
      .subscribe({
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

  // === Procesar filtros y vistas ===

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

    // reconstruir vistas
    this.rebuildJournalView();
    this.buildCashBankRows();
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
          lines: [],
          description: e.description || undefined,
        };
        groups.set(key, g);
      }

      const touchAccount = (
        account: string | null | undefined,
        side: 'debit' | 'credit',
        amount: number
      ) => {
        if (!account) return;
        let line = g!.lines.find((l) => l.account === account);
        if (!line) {
          line = { account, debit: 0, credit: 0 };
          g!.lines.push(line);
        }
        line[side] += amount;
      };

      touchAccount(e.debitAccount, 'debit', e.amount);
      touchAccount(e.creditAccount, 'credit', e.amount);
    }

    const list = Array.from(groups.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    list.forEach((j, idx) => {
      j.journalNumber = idx + 1;
    });

    this.journalEntries = list;
  }

  // === Libro caja y bancos ===

  private isCashOrBank(account?: string | null): boolean {
    if (!account) return false;
    const a = account.toLowerCase();
    // Ajusta esto a tus nombres reales de cuenta
    return (
      a.startsWith('101') ||       // 101 Caja
      a.startsWith('10 ') ||       // 10 Bancos
      a.includes('caja') ||
      a.includes('banco')
    );
  }

  private buildCashBankRows(): void {
    const rows: CashBankRow[] = [];
    let runningBalance = 0;

    const cashEntries = this.filteredEntries
      .filter(
        (e) =>
          this.isCashOrBank(e.debitAccount) ||
          this.isCashOrBank(e.creditAccount)
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    cashEntries.forEach((e, idx) => {
      const cashInDebit = this.isCashOrBank(e.debitAccount);
      const cashInCredit = this.isCashOrBank(e.creditAccount);

      let debit = 0;
      let credit = 0;
      let counterpart = '';

      if (cashInDebit) {
        debit = e.amount;
        counterpart = e.creditAccount || '';
      } else if (cashInCredit) {
        credit = e.amount;
        counterpart = e.debitAccount || '';
      }

      runningBalance += debit - credit;

      const parts = counterpart.split(' ');
      const accountCode = parts[0] || '';
      const accountName = parts.slice(1).join(' ').trim() || counterpart;

      rows.push({
        correlativo: idx + 1,
        date: e.date,
        description: e.description || '',
        accountCode,
        accountName,
        debit,
        credit,
        balance: runningBalance,
      });
    });

    this.cashBankRows = rows;
  }
}
