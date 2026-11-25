/**
 * Manajemen penyimpanan lokal (localStorage), Export CSV, dan Backup/Restore JSON.
 */
window.APP_STORAGE = (() => {
  const STORAGE_KEY = 'catatan_uang_pwa_v1';
  const { DEFAULT_BUDGET, ALL_CATEGORIES, ALL_PAYMENT_METHODS } = window.APP_CONSTANTS;
  const { escapeCSV, getTodayISO, generateId } = window.APP_UTILS;

  const validCategoryIds = new Set(ALL_CATEGORIES.map((c) => c.id));
  const validPaymentIds = new Set(ALL_PAYMENT_METHODS.map((p) => p.id));

  function sanitizeTransaction(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const amount = Math.round(Number(raw.amount) || 0);
    if (amount <= 0) return null;

    const type = raw.type === 'income' ? 'income' : 'expense';
    const category = validCategoryIds.has(raw.category) ? raw.category : 'Lainnya';
    const paymentMethod = validPaymentIds.has(raw.paymentMethod) ? raw.paymentMethod : 'Tunai';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date || ''))
      ? String(raw.date)
      : getTodayISO();

    return {
      id: String(raw.id || generateId()),
      type,
      amount,
      category,
      paymentMethod,
      date,
      note: String(raw.note || '').trim().slice(0, 80),
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          transactions: [],
          monthlyBudget: DEFAULT_BUDGET,
          lastSavedAt: null
        };
      }
      const parsed = JSON.parse(raw);
      const txs = Array.isArray(parsed.transactions)
        ? parsed.transactions.map(sanitizeTransaction).filter(Boolean)
        : [];
      const budget = Number(parsed.monthlyBudget) > 0 ? Math.round(Number(parsed.monthlyBudget)) : DEFAULT_BUDGET;

      return {
        transactions: txs,
        monthlyBudget: budget,
        lastSavedAt: parsed.lastSavedAt || null
      };
    } catch (err) {
      console.error('Gagal membaca localStorage:', err);
      return {
        transactions: [],
        monthlyBudget: DEFAULT_BUDGET,
        lastSavedAt: null
      };
    }
  }

  function saveState(state) {
    const payload = {
      version: 1,
      monthlyBudget: state.monthlyBudget,
      transactions: state.transactions,
      lastSavedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return payload.lastSavedAt;
    } catch (err) {
      console.error('Gagal menyimpan ke localStorage:', err);
      return null;
    }
  }

  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportTransactionsCSV(transactions) {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Metode Pembayaran', 'Nominal', 'Catatan'];
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    const rows = sorted.map((tx) => [
      escapeCSV(tx.id),
      escapeCSV(tx.date),
      escapeCSV(tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      escapeCSV(tx.category),
      escapeCSV(tx.paymentMethod),
      escapeCSV(tx.amount),
      escapeCSV(tx.note)
    ].join(','));

    // BOM UTF-8 agar Microsoft Excel membaca karakter & pemisah dengan benar
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const filename = `catatan-uang-${getTodayISO()}.csv`;
    triggerDownload(filename, csvContent, 'text/csv;charset=utf-8;');
    return filename;
  }

  function backupStateJSON(state) {
    const payload = {
      app: 'Catatan Uang',
      version: 1,
      exportedAt: new Date().toISOString(),
      monthlyBudget: state.monthlyBudget,
      transactions: state.transactions
    };
    const filename = `catatan-uang-backup-${getTodayISO()}.json`;
    triggerDownload(filename, JSON.stringify(payload, null, 2), 'application/json');
    return filename;
  }

  function parseBackupJSON(jsonText) {
    const parsed = JSON.parse(jsonText);
    const rawList = Array.isArray(parsed) ? parsed : parsed.transactions;
    if (!Array.isArray(rawList)) {
      throw new Error('Format file backup tidak valid (daftar transaksi tidak ditemukan).');
    }

    const transactions = rawList.map(sanitizeTransaction).filter(Boolean);
    const monthlyBudget = Number(parsed.monthlyBudget) > 0
      ? Math.round(Number(parsed.monthlyBudget))
      : null;

    return { transactions, monthlyBudget };
  }

  return {
    loadState,
    saveState,
    exportTransactionsCSV,
    backupStateJSON,
    parseBackupJSON
  };
})();
