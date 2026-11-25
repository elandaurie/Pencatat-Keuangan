/**
 * Konstanta aplikasi: Kategori Pengeluaran & Pemasukan, Metode Pembayaran & Sumber Dana,
 * Ikon SVG, dan Data Contoh.
 */
window.APP_CONSTANTS = (() => {
  const EXPENSE_CATEGORIES = [
    {
      id: 'Makan & Minum',
      label: 'Makan & Minum',
      color: '#9E4A33',
      bg: '#F2DFD5',
      fg: '#8C3E29',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`
    },
    {
      id: 'Bensin & Transport',
      label: 'Bensin & Transport',
      color: '#A5834B',
      bg: '#F2EAD9',
      fg: '#7A5E31',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
    },
    {
      id: 'Hobi & Komponen',
      label: 'Hobi & Komponen',
      color: '#8D6F7D',
      bg: '#EFE4EA',
      fg: '#6E515F',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>`
    },
    {
      id: 'Kebutuhan Harian',
      label: 'Kebutuhan Harian',
      color: '#5D7356',
      bg: '#E2EAD9',
      fg: '#43583D',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    },
    {
      id: 'Bulanan',
      label: 'Bulanan',
      color: '#5D7C7B',
      bg: '#E0ECEB',
      fg: '#3E5B5A',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`
    },
    {
      id: 'Lainnya',
      label: 'Lainnya',
      color: '#847B73',
      bg: '#EAE4DC',
      fg: '#5C544D',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
    }
  ];

  const INCOME_CATEGORIES = [
    {
      id: 'Gaji',
      label: 'Gaji',
      color: '#4A6343',
      bg: '#E2EAD9',
      fg: '#3D5437',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 10h.01M18 14h.01"/></svg>`
    },
    {
      id: 'Uang Saku / Kiriman',
      label: 'Uang Saku / Kiriman',
      color: '#5D7C7B',
      bg: '#E0ECEB',
      fg: '#3E5B5A',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`
    },
    {
      id: 'Proyek / Freelance / Jasa',
      label: 'Proyek / Freelance / Jasa',
      color: '#5A7B94',
      bg: '#E2EAF0',
      fg: '#3D586D',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
    },
    {
      id: 'Bonus / Hadiah / Refund',
      label: 'Bonus / Hadiah / Refund',
      color: '#A5834B',
      bg: '#F2EAD9',
      fg: '#7A5E31',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`
    },
    {
      id: 'Lainnya',
      label: 'Lainnya',
      color: '#847B73',
      bg: '#EAE4DC',
      fg: '#5C544D',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
    }
  ];

  const EXPENSE_PAYMENT_METHODS = [
    { id: 'QRIS', label: 'QRIS', color: '#9E4A33' },
    { id: 'Transfer Bank', label: 'Transfer Bank', color: '#A5834B' },
    { id: 'GoPay', label: 'GoPay', color: '#5D7356' },
    { id: 'DANA', label: 'DANA', color: '#5A7B94' },
    { id: 'ShopeePay', label: 'ShopeePay', color: '#C46D45' },
    { id: 'Tunai', label: 'Tunai', color: '#7D736B' }
  ];

  const INCOME_SOURCES = [
    { id: 'Transfer Bank', label: 'Transfer Bank', color: '#4A6343' },
    { id: 'Tunai', label: 'Tunai', color: '#7D736B' },
    { id: 'GoPay', label: 'GoPay', color: '#5D7356' },
    { id: 'DANA', label: 'DANA', color: '#5A7B94' },
    { id: 'ShopeePay', label: 'ShopeePay', color: '#C46D45' },
    { id: 'Lainnya', label: 'Lainnya', color: '#847B73' }
  ];

  function dedupeById(list) {
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  const ALL_CATEGORIES = dedupeById([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]);
  const ALL_PAYMENT_METHODS = dedupeById([...EXPENSE_PAYMENT_METHODS, ...INCOME_SOURCES]);

  const DEFAULT_BUDGET = 3000000;

  function getCategoriesForType(type) {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }

  function getPaymentMethodsForType(type) {
    return type === 'income' ? INCOME_SOURCES : EXPENSE_PAYMENT_METHODS;
  }

  function getCategoryMeta(id) {
    return ALL_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  }

  function getPaymentMeta(id) {
    return ALL_PAYMENT_METHODS.find((p) => p.id === id) || EXPENSE_PAYMENT_METHODS[EXPENSE_PAYMENT_METHODS.length - 1];
  }

  function buildDemoTransactions(todayISO) {
    const ym = todayISO.slice(0, 7);
    const day = Number(todayISO.slice(8, 10));
    const clampDay = (d) => `${ym}-${String(Math.max(1, Math.min(d, day))).padStart(2, '0')}`;

    return [
      {
        id: 'demo-1',
        type: 'income',
        amount: 6500000,
        category: 'Gaji',
        paymentMethod: 'Transfer Bank',
        date: `${ym}-01`,
        note: 'Gaji bulanan',
        createdAt: Date.now() - 86400000 * 10
      },
      {
        id: 'demo-2',
        type: 'expense',
        amount: 850000,
        category: 'Bulanan',
        paymentMethod: 'QRIS',
        date: clampDay(3),
        note: 'Listrik, air & internet',
        createdAt: Date.now() - 86400000 * 8
      },
      {
        id: 'demo-3',
        type: 'expense',
        amount: 145000,
        category: 'Kebutuhan Harian',
        paymentMethod: 'ShopeePay',
        date: clampDay(7),
        note: 'Belanja sabun & kebutuhan rumah',
        createdAt: Date.now() - 86400000 * 6
      },
      {
        id: 'demo-4',
        type: 'expense',
        amount: 210000,
        category: 'Hobi & Komponen',
        paymentMethod: 'DANA',
        date: clampDay(12),
        note: 'Beli modul sensor & kabel jumper',
        createdAt: Date.now() - 86400000 * 4
      },
      {
        id: 'demo-5',
        type: 'expense',
        amount: 65000,
        category: 'Bensin & Transport',
        paymentMethod: 'Transfer Bank',
        date: clampDay(Math.max(1, day - 2)),
        note: 'Isi bensin & parkir',
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id: 'demo-6',
        type: 'expense',
        amount: 42000,
        category: 'Makan & Minum',
        paymentMethod: 'GoPay',
        date: clampDay(Math.max(1, day - 1)),
        note: 'Makan siang & es kopi',
        createdAt: Date.now() - 86400000
      },
      {
        id: 'demo-7',
        type: 'expense',
        amount: 28000,
        category: 'Makan & Minum',
        paymentMethod: 'Tunai',
        date: todayISO,
        note: 'Sarapan bubur ayam',
        createdAt: Date.now()
      }
    ];
  }

  return {
    CATEGORIES: EXPENSE_CATEGORIES,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    ALL_CATEGORIES,
    PAYMENT_METHODS: EXPENSE_PAYMENT_METHODS,
    EXPENSE_PAYMENT_METHODS,
    INCOME_SOURCES,
    ALL_PAYMENT_METHODS,
    DEFAULT_BUDGET,
    getCategoriesForType,
    getPaymentMethodsForType,
    getCategoryMeta,
    getPaymentMeta,
    buildDemoTransactions
  };
})();
