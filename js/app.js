/**
 * Logika utama aplikasi Catatan Uang (State, Render, Event Handler, PWA).
 */
(() => {
  const {
    ALL_CATEGORIES,
    ALL_PAYMENT_METHODS,
    getCategoriesForType,
    getPaymentMethodsForType,
    getCategoryMeta,
    buildDemoTransactions
  } = window.APP_CONSTANTS;
  const {
    formatRupiah,
    parseNumericInput,
    formatInputThousands,
    getTodayISO,
    getCurrentYearMonth,
    shiftYearMonth,
    formatMonthLabel,
    formatShortDate,
    formatGroupDate,
    generateId,
    escapeHTML
  } = window.APP_UTILS;
  const {
    loadState,
    saveState,
    exportTransactionsCSV,
    backupStateJSON,
    parseBackupJSON
  } = window.APP_STORAGE;
  const { renderBreakdown } = window.APP_CHARTS;

  // ==================== STATE APLIKASI ====================
  const stored = loadState();
  const state = {
    transactions: stored.transactions,
    monthlyBudget: stored.monthlyBudget,
    lastSavedAt: stored.lastSavedAt,
    activeTab: 'home',
    selectedMonth: getCurrentYearMonth(),
    activityAllMonths: false,
    filters: {
      search: '',
      type: 'all',
      category: 'all',
      payment: 'all'
    },
    breakdownMode: 'category',
    chartPeriod: 'weekly',
    selectedChartDay: null,
    deferredInstallPrompt: null
  };

  let toastTimer = null;

  // ==================== REFERENSI DOM ====================
  const views = {
    home: document.getElementById('view-home'),
    activity: document.getElementById('view-activity'),
    insights: document.getElementById('view-insights'),
    data: document.getElementById('view-data')
  };
  const navItems = document.querySelectorAll('.nav-item');

  // Home elements
  const homeMonthSelect = document.getElementById('home-month-select');
  const homeTotalBalance = document.getElementById('home-total-balance');
  const homeMonthIncome = document.getElementById('home-month-income');
  const homeMonthExpense = document.getElementById('home-month-expense');
  const homeBudgetRemaining = document.getElementById('home-budget-remaining');
  const homeBudgetStatusText = document.getElementById('home-budget-status-text');
  const homeBudgetBar = document.getElementById('home-budget-bar');
  const homeBudgetSpent = document.getElementById('home-budget-spent');
  const homeBudgetLimit = document.getElementById('home-budget-limit');
  const homeRecentList = document.getElementById('home-recent-list');

  // Activity elements
  const activityMonthLabel = document.getElementById('activity-month-label');
  const activityIncomeTotal = document.getElementById('activity-income-total');
  const activityExpenseTotal = document.getElementById('activity-expense-total');
  const filterSearch = document.getElementById('filter-search');
  const btnToggleFilters = document.getElementById('btn-toggle-filters');
  const advancedFilters = document.getElementById('advanced-filters');
  const filterCategory = document.getElementById('filter-category');
  const filterPayment = document.getElementById('filter-payment');
  const filterCountInfo = document.getElementById('filter-count-info');
  const activityList = document.getElementById('activity-list');

  // Insights elements
  const insightsMonthLabel = document.getElementById('insights-month-label');
  const insightsMonthExpense = document.getElementById('insights-month-expense');
  const insightsPeriodRange = document.getElementById('insights-period-range');
  const weeklyBarChart = document.getElementById('weekly-bar-chart');
  const dailyDetailBar = document.getElementById('daily-detail-bar');
  const breakdownGroupCount = document.getElementById('breakdown-group-count');
  const breakdownStackedBar = document.getElementById('breakdown-stacked-bar');
  const breakdownList = document.getElementById('breakdown-list');
  const insightCallout = document.getElementById('insight-callout');
  const insightCalloutTitle = document.getElementById('insight-callout-title');
  const insightCalloutDesc = document.getElementById('insight-callout-desc');

  // Data elements
  const dataTotalCount = document.getElementById('data-total-count');
  const dataLastSaved = document.getElementById('data-last-saved');
  const dataBudgetLabel = document.getElementById('data-budget-label');
  const inputRestoreJson = document.getElementById('input-restore-json');

  // Modals
  const txModal = document.getElementById('tx-modal');
  const txModalTitle = document.getElementById('tx-modal-title');
  const txForm = document.getElementById('tx-form');
  const txIdInput = document.getElementById('tx-id');
  const txAmountInput = document.getElementById('tx-amount');
  const txAmountError = document.getElementById('tx-amount-error');
  const txCategoryLabel = document.getElementById('tx-category-label');
  const txCategorySelect = document.getElementById('tx-category');
  const txPaymentLabel = document.getElementById('tx-payment-label');
  const txPaymentSelect = document.getElementById('tx-payment');
  const txDateInput = document.getElementById('tx-date');
  const txNoteInput = document.getElementById('tx-note');
  const btnDeleteTxModal = document.getElementById('btn-delete-tx-modal');
  const typeButtons = document.querySelectorAll('.type-btn');

  const budgetModal = document.getElementById('budget-modal');
  const budgetForm = document.getElementById('budget-form');
  const budgetInput = document.getElementById('budget-input');

  const pwaModal = document.getElementById('pwa-modal');
  const installBanner = document.getElementById('install-banner');
  const btnInstallPwa = document.getElementById('btn-install-pwa');
  const btnPwaModalInstall = document.getElementById('btn-pwa-modal-install');
  const pwaStatusText = document.getElementById('pwa-status-text');
  const toastEl = document.getElementById('toast');

  let currentTxType = 'expense';

  // ==================== INISIALISASI DROPDOWN ====================
  function populateSelects() {
    ALL_CATEGORIES.forEach((cat) => {
      filterCategory.add(new Option(cat.label, cat.id));
    });
    ALL_PAYMENT_METHODS.forEach((pm) => {
      filterPayment.add(new Option(pm.label, pm.id));
    });
    syncTxFormOptions('expense');
  }

  function syncTxFormOptions(type, preferredCategory = null, preferredPayment = null) {
    const isIncome = type === 'income';
    const categories = getCategoriesForType(type);
    const payments = getPaymentMethodsForType(type);

    txCategoryLabel.textContent = isIncome ? 'Kategori Pemasukan' : 'Kategori';
    txPaymentLabel.textContent = isIncome ? 'Masuk Ke / Sumber Dana' : 'Metode Pembayaran';
    txNoteInput.placeholder = isIncome
      ? 'Contoh: Gaji, Kiriman bulanan, Honor...'
      : 'Contoh: Kopi susu, Pertamax, Belanja...';

    const prevCat = preferredCategory !== null ? preferredCategory : txCategorySelect.value;
    const prevPay = preferredPayment !== null ? preferredPayment : txPaymentSelect.value;

    txCategorySelect.innerHTML = '';
    categories.forEach((cat) => {
      txCategorySelect.add(new Option(cat.label, cat.id));
    });
    txCategorySelect.value = categories.some((c) => c.id === prevCat)
      ? prevCat
      : categories[0].id;

    txPaymentSelect.innerHTML = '';
    payments.forEach((pm) => {
      txPaymentSelect.add(new Option(pm.label, pm.id));
    });
    txPaymentSelect.value = payments.some((p) => p.id === prevPay)
      ? prevPay
      : payments[0].id;
  }

  // ==================== TOAST & PENYIMPANAN ====================
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 2600);
  }

  function persistAndRender() {
    const savedAt = saveState(state);
    if (savedAt) state.lastSavedAt = savedAt;
    renderAll();
  }

  // ==================== NAVIGASI TAB ====================
  function switchTab(tabName) {
    state.activeTab = tabName;
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle('active', key === tabName);
    });
    navItems.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== KOMPONEN ITEM TRANSAKSI ====================
  function buildTransactionCardHTML(tx, showActions = true) {
    const meta = getCategoryMeta(tx.category);
    const title = tx.note ? tx.note : tx.category;
    const signClass = tx.type === 'income' ? 'income' : 'expense';
    const signedAmount = formatRupiah(tx.type === 'income' ? tx.amount : -tx.amount, true);
    const subtitleParts = [
      tx.category,
      tx.paymentMethod,
      formatShortDate(tx.date)
    ];

    return `
      <article class="tx-card" data-id="${escapeHTML(tx.id)}">
        <div class="tx-card-main" data-action="edit" data-id="${escapeHTML(tx.id)}" role="button" tabindex="0" aria-label="Edit transaksi ${escapeHTML(title)}">
          <div class="tx-icon-badge" style="background-color: ${meta.bg}; color: ${meta.fg};">
            ${meta.icon}
          </div>
          <div class="tx-info">
            <span class="tx-title">${escapeHTML(title)}</span>
            <div class="tx-meta">
              <span>${escapeHTML(subtitleParts.join(' · '))}</span>
            </div>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${signClass}">${signedAmount}</span>
          ${
            showActions
              ? `<div class="tx-actions">
                  <button type="button" class="tx-action-btn" data-action="edit" data-id="${escapeHTML(tx.id)}" aria-label="Edit transaksi" title="Edit">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button type="button" class="tx-action-btn delete" data-action="delete" data-id="${escapeHTML(tx.id)}" aria-label="Hapus transaksi" title="Hapus">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>`
              : ''
          }
        </div>
      </article>
    `;
  }

  // ==================== RENDER BERANDA ====================
  function populateHomeMonthSelect() {
    const currentYM = getCurrentYearMonth();
    const monthSet = new Set([state.selectedMonth, currentYM]);

    for (let i = -11; i <= 1; i++) {
      monthSet.add(shiftYearMonth(currentYM, i));
    }
    state.transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) monthSet.add(tx.date.slice(0, 7));
    });

    const sortedMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
    homeMonthSelect.innerHTML = '';
    sortedMonths.forEach((ym) => {
      homeMonthSelect.add(new Option(formatMonthLabel(ym), ym));
    });
    homeMonthSelect.value = state.selectedMonth;
  }

  function renderHome() {
    const ym = state.selectedMonth;
    populateHomeMonthSelect();

    let totalAllIncome = 0;
    let totalAllExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    state.transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalAllIncome += tx.amount;
        if (tx.date.startsWith(ym)) monthIncome += tx.amount;
      } else {
        totalAllExpense += tx.amount;
        if (tx.date.startsWith(ym)) monthExpense += tx.amount;
      }
    });

    const currentBalance = totalAllIncome - totalAllExpense;
    homeTotalBalance.textContent = formatRupiah(currentBalance);
    homeMonthIncome.textContent = formatRupiah(monthIncome);
    homeMonthExpense.textContent = formatRupiah(monthExpense);

    // Kartu Anggaran Bulanan
    const budget = state.monthlyBudget;
    const remaining = budget - monthExpense;
    const pct = budget > 0 ? Math.min(100, Math.round((monthExpense / budget) * 100)) : 0;

    homeBudgetRemaining.textContent = formatRupiah(Math.abs(remaining));
    homeBudgetStatusText.textContent = remaining >= 0 ? 'tersisa bulan ini' : 'melebihi anggaran';
    homeBudgetBar.style.width = `${pct}%`;
    homeBudgetBar.classList.toggle('over', remaining < 0);
    homeBudgetSpent.textContent = `Terpakai ${formatRupiah(monthExpense)} (${pct}%)`;
    homeBudgetLimit.textContent = `Target ${formatRupiah(budget)}`;

    // 5 Transaksi Terbaru
    const recent = [...state.transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .slice(0, 5);

    if (recent.length === 0) {
      homeRecentList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
          </div>
          <h3>Belum ada transaksi</h3>
          <p>Catat pemasukan atau pengeluaran pertamamu dengan tombol + di atas.</p>
          <div class="empty-actions">
            <button type="button" class="btn-pill btn-pill-primary" data-action="open-add">+ Tambah Transaksi</button>
            <button type="button" class="btn-pill btn-pill-outline" data-action="load-demo">Muat Data Contoh</button>
          </div>
        </div>
      `;
      return;
    }

    homeRecentList.innerHTML = recent.map((tx) => buildTransactionCardHTML(tx, true)).join('');
  }

  // ==================== RENDER AKTIVITAS ====================
  function getFilteredTransactions() {
    const q = state.filters.search.trim().toLowerCase();
    return state.transactions
      .filter((tx) => {
        if (!state.activityAllMonths && !tx.date.startsWith(state.selectedMonth)) return false;
        if (state.filters.type !== 'all' && tx.type !== state.filters.type) return false;
        if (state.filters.category !== 'all' && tx.category !== state.filters.category) return false;
        if (state.filters.payment !== 'all' && tx.paymentMethod !== state.filters.payment) return false;
        if (q) {
          const hay = `${tx.note} ${tx.category} ${tx.paymentMethod}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }

  function renderActivity() {
    activityMonthLabel.textContent = state.activityAllMonths
      ? 'Semua Bulan'
      : formatMonthLabel(state.selectedMonth);

    const filtered = getFilteredTransactions();

    let totalIn = 0;
    let totalOut = 0;
    filtered.forEach((tx) => {
      if (tx.type === 'income') totalIn += tx.amount;
      else totalOut += tx.amount;
    });

    activityIncomeTotal.textContent = formatRupiah(totalIn);
    activityExpenseTotal.textContent = formatRupiah(totalOut);
    filterCountInfo.textContent = `${filtered.length} transaksi ditemukan`;

    if (filtered.length === 0) {
      activityList.innerHTML = `
        <div class="empty-state">
          <h3>Tidak ada transaksi cocok</h3>
          <p>Coba ubah filter, kata kunci pencarian, atau pindah bulan.</p>
          <div class="empty-actions">
            <button type="button" class="btn-pill btn-pill-outline" data-action="reset-activity-filters">Reset Filter</button>
          </div>
        </div>
      `;
      return;
    }

    // Kelompokkan transaksi berdasarkan tanggal
    const groups = new Map();
    filtered.forEach((tx) => {
      if (!groups.has(tx.date)) groups.set(tx.date, []);
      groups.get(tx.date).push(tx);
    });

    activityList.innerHTML = Array.from(groups.entries())
      .map(([dateISO, items]) => {
        const net = items.reduce(
          (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
          0
        );
        return `
          <div class="day-group">
            <div class="day-group-header">
              <span class="day-group-title">${escapeHTML(formatGroupDate(dateISO))}</span>
              <span class="day-group-net">${formatRupiah(net, true)}</span>
            </div>
            <div class="tx-list">
              ${items.map((tx) => buildTransactionCardHTML(tx, true)).join('')}
            </div>
          </div>
        `;
      })
      .join('');
  }

  // ==================== RENDER ANALISIS ====================
  function renderInsights() {
    insightsMonthLabel.textContent = formatMonthLabel(state.selectedMonth);
    renderBreakdown({
      transactions: state.transactions,
      yearMonth: state.selectedMonth,
      mode: state.breakdownMode,
      chartPeriod: state.chartPeriod,
      selectedDay: state.selectedChartDay,
      onSelectDay: (dayNum) => {
        state.selectedChartDay = dayNum;
      },
      chartEl: weeklyBarChart,
      detailBarEl: dailyDetailBar,
      totalEl: insightsMonthExpense,
      rangeEl: insightsPeriodRange,
      countEl: breakdownGroupCount,
      stackedEl: breakdownStackedBar,
      listEl: breakdownList,
      calloutEl: insightCallout,
      calloutTitleEl: insightCalloutTitle,
      calloutDescEl: insightCalloutDesc
    });
  }

  // ==================== RENDER DATA & BACKUP ====================
  function renderDataView() {
    dataTotalCount.textContent = `${state.transactions.length} transaksi tersimpan`;
    dataBudgetLabel.textContent = `Batas pengeluaran bulanan: ${formatRupiah(state.monthlyBudget)}`;
    if (state.lastSavedAt) {
      const dt = new Date(state.lastSavedAt);
      const timeStr = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      dataLastSaved.textContent = `Tersimpan otomatis di perangkat ini (${timeStr}).`;
    }
  }

  function renderAll() {
    renderHome();
    renderActivity();
    renderInsights();
    renderDataView();
  }

  // ==================== MODAL TRANSAKSI (TAMBAH / EDIT) ====================
  function setTxType(type, preferredCategory = null, preferredPayment = null) {
    currentTxType = type === 'income' ? 'income' : 'expense';
    typeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.txType === currentTxType);
    });
    syncTxFormOptions(currentTxType, preferredCategory, preferredPayment);
  }

  function openTxModal(txToEdit = null) {
    txAmountError.classList.add('hidden');
    if (txToEdit) {
      txModalTitle.textContent = 'Edit Transaksi';
      txIdInput.value = txToEdit.id;
      setTxType(txToEdit.type, txToEdit.category, txToEdit.paymentMethod);
      txAmountInput.value = formatInputThousands(txToEdit.amount);
      txDateInput.value = txToEdit.date;
      txNoteInput.value = txToEdit.note;
      btnDeleteTxModal.classList.remove('hidden');
    } else {
      txModalTitle.textContent = 'Tambah Transaksi';
      txIdInput.value = '';
      setTxType('expense', '', '');
      txAmountInput.value = '';
      txDateInput.value = getTodayISO();
      txNoteInput.value = '';
      btnDeleteTxModal.classList.add('hidden');
    }

    txModal.classList.remove('hidden');
    setTimeout(() => txAmountInput.focus(), 80);
  }

  function closeTxModal() {
    txModal.classList.add('hidden');
  }

  function deleteTransactionById(id) {
    const target = state.transactions.find((t) => t.id === id);
    if (!target) return;
    const label = target.note || target.category;
    if (!window.confirm(`Hapus transaksi "${label}" (${formatRupiah(target.amount)})?`)) return;

    state.transactions = state.transactions.filter((t) => t.id !== id);
    persistAndRender();
    showToast('Transaksi dihapus');
  }

  // ==================== MODAL ANGGARAN ====================
  function openBudgetModal() {
    budgetInput.value = formatInputThousands(state.monthlyBudget);
    budgetModal.classList.remove('hidden');
    setTimeout(() => budgetInput.focus(), 80);
  }

  function closeBudgetModal() {
    budgetModal.classList.add('hidden');
  }

  // ==================== EVENT LISTENERS ====================
  function bindEvents() {
    // Bottom Navigation
    navItems.forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Delegasi tombol global (Tambah, Edit, Hapus, Data Contoh, Reset)
    document.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.dataset.action;
        const id = actionEl.dataset.id;
        if (action === 'open-add') {
          openTxModal(null);
          return;
        }
        if (action === 'edit' && id) {
          const tx = state.transactions.find((t) => t.id === id);
          if (tx) openTxModal(tx);
          return;
        }
        if (action === 'delete' && id) {
          e.stopPropagation();
          deleteTransactionById(id);
          return;
        }
        if (action === 'load-demo') {
          loadDemoData();
          return;
        }
        if (action === 'reset-activity-filters') {
          resetActivityFilters();
          return;
        }
      }

      const navEl = e.target.closest('[data-nav]');
      if (navEl) {
        switchTab(navEl.dataset.nav);
      }
    });

    // Pilih bulan ringkasan di Beranda
    homeMonthSelect.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      state.activityAllMonths = false;
      state.selectedChartDay = null;
      renderAll();
    });

    // Month Navigation (Activity & Insights)
    document.getElementById('btn-prev-month').addEventListener('click', () => {
      state.activityAllMonths = false;
      state.selectedMonth = shiftYearMonth(state.selectedMonth, -1);
      renderAll();
    });
    document.getElementById('btn-next-month').addEventListener('click', () => {
      state.activityAllMonths = false;
      state.selectedMonth = shiftYearMonth(state.selectedMonth, 1);
      renderAll();
    });
    document.getElementById('btn-toggle-all-months').addEventListener('click', () => {
      state.activityAllMonths = !state.activityAllMonths;
      renderActivity();
    });

    document.getElementById('btn-insights-prev').addEventListener('click', () => {
      state.selectedMonth = shiftYearMonth(state.selectedMonth, -1);
      state.selectedChartDay = null;
      renderAll();
    });
    document.getElementById('btn-insights-next').addEventListener('click', () => {
      state.selectedMonth = shiftYearMonth(state.selectedMonth, 1);
      state.selectedChartDay = null;
      renderAll();
    });

    // Activity Search & Filters
    filterSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      renderActivity();
    });

    btnToggleFilters.addEventListener('click', () => {
      const willOpen = advancedFilters.classList.contains('hidden');
      advancedFilters.classList.toggle('hidden', !willOpen);
      btnToggleFilters.classList.toggle('active', willOpen);
      btnToggleFilters.setAttribute('aria-expanded', String(willOpen));
    });

    document.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.filters.type = pill.dataset.typeFilter;
        renderActivity();
      });
    });

    filterCategory.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderActivity();
    });

    filterPayment.addEventListener('change', (e) => {
      state.filters.payment = e.target.value;
      renderActivity();
    });

    document.getElementById('btn-reset-filters').addEventListener('click', resetActivityFilters);

    // Insights chart period toggle (Mingguan / Harian)
    document.querySelectorAll('.chart-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.chartPeriod = btn.dataset.chartPeriod;
        renderInsights();
      });
    });

    // Insights breakdown toggle (Per Kategori / Per Metode)
    document.querySelectorAll('.seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.breakdownMode = btn.dataset.breakdownMode;
        renderInsights();
      });
    });

    // Form Transaksi
    typeButtons.forEach((btn) => {
      btn.addEventListener('click', () => setTxType(btn.dataset.txType));
    });

    txAmountInput.addEventListener('input', (e) => {
      e.target.value = formatInputThousands(e.target.value);
      txAmountError.classList.add('hidden');
    });

    txForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseNumericInput(txAmountInput.value);
      if (amount <= 0) {
        txAmountError.textContent = 'Masukkan nominal lebih dari Rp0.';
        txAmountError.classList.remove('hidden');
        txAmountInput.focus();
        return;
      }

      const id = txIdInput.value;
      const txPayload = {
        id: id || generateId(),
        type: currentTxType,
        amount,
        category: txCategorySelect.value,
        paymentMethod: txPaymentSelect.value,
        date: txDateInput.value || getTodayISO(),
        note: txNoteInput.value.trim(),
        createdAt: Date.now()
      };

      if (id) {
        const idx = state.transactions.findIndex((t) => t.id === id);
        if (idx !== -1) {
          txPayload.createdAt = state.transactions[idx].createdAt;
          state.transactions[idx] = txPayload;
          showToast('Transaksi diperbarui');
        }
      } else {
        state.transactions.push(txPayload);
        state.selectedMonth = txPayload.date.slice(0, 7);
        showToast('Transaksi tersimpan');
      }

      closeTxModal();
      persistAndRender();
    });

    btnDeleteTxModal.addEventListener('click', () => {
      const id = txIdInput.value;
      if (!id) return;
      closeTxModal();
      deleteTransactionById(id);
    });

    document.getElementById('btn-close-tx-modal').addEventListener('click', closeTxModal);
    txModal.addEventListener('click', (e) => {
      if (e.target === txModal) closeTxModal();
    });

    // Form Anggaran
    document.getElementById('btn-edit-budget-home').addEventListener('click', openBudgetModal);
    document.getElementById('btn-edit-budget-data').addEventListener('click', openBudgetModal);
    document.getElementById('btn-close-budget-modal').addEventListener('click', closeBudgetModal);
    budgetModal.addEventListener('click', (e) => {
      if (e.target === budgetModal) closeBudgetModal();
    });

    budgetInput.addEventListener('input', (e) => {
      e.target.value = formatInputThousands(e.target.value);
    });

    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseNumericInput(budgetInput.value);
      if (val <= 0) {
        showToast('Masukkan nominal anggaran yang valid');
        return;
      }
      state.monthlyBudget = val;
      closeBudgetModal();
      persistAndRender();
      showToast('Target anggaran disimpan');
    });

    // Data & Backup Actions
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      if (state.transactions.length === 0) {
        showToast('Belum ada transaksi untuk diekspor');
        return;
      }
      exportTransactionsCSV(state.transactions);
      showToast('File CSV berhasil diekspor');
    });

    document.getElementById('btn-backup-json').addEventListener('click', () => {
      backupStateJSON(state);
      showToast('Backup JSON berhasil diunduh');
    });

    inputRestoreJson.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const restored = parseBackupJSON(reader.result);
          const msg = `Pulihkan ${restored.transactions.length} transaksi dari backup? Data saat ini akan diganti.`;
          if (!window.confirm(msg)) return;

          state.transactions = restored.transactions;
          if (restored.monthlyBudget) state.monthlyBudget = restored.monthlyBudget;
          persistAndRender();
          showToast(`Berhasil memulihkan ${restored.transactions.length} transaksi`);
        } catch (err) {
          showToast(err.message || 'Gagal membaca file JSON');
        } finally {
          inputRestoreJson.value = '';
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-seed-demo').addEventListener('click', loadDemoData);

    document.getElementById('btn-clear-all').addEventListener('click', () => {
      if (state.transactions.length === 0) {
        showToast('Data sudah kosong');
        return;
      }
      if (!window.confirm('Hapus SEMUA transaksi yang tersimpan di perangkat ini? Tindakan ini tidak bisa dibatalkan.')) {
        return;
      }
      state.transactions = [];
      persistAndRender();
      showToast('Semua data transaksi dihapus');
    });

    // Panduan & Install PWA
    document.getElementById('btn-pwa-guide').addEventListener('click', () => {
      btnPwaModalInstall.classList.toggle('hidden', !state.deferredInstallPrompt);
      pwaModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-pwa-modal').addEventListener('click', () => {
      pwaModal.classList.add('hidden');
    });
    pwaModal.addEventListener('click', (e) => {
      if (e.target === pwaModal) pwaModal.classList.add('hidden');
    });

    btnInstallPwa.addEventListener('click', triggerInstallPrompt);
    btnPwaModalInstall.addEventListener('click', triggerInstallPrompt);
    document.getElementById('btn-dismiss-install').addEventListener('click', () => {
      installBanner.classList.add('hidden');
    });

    // Escape key untuk menutup modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTxModal();
        closeBudgetModal();
        pwaModal.classList.add('hidden');
      }
    });
  }

  function resetActivityFilters() {
    state.filters = { search: '', type: 'all', category: 'all', payment: 'all' };
    state.activityAllMonths = false;
    state.selectedMonth = getCurrentYearMonth();
    filterSearch.value = '';
    filterCategory.value = 'all';
    filterPayment.value = 'all';
    document.querySelectorAll('.filter-pill').forEach((p) => {
      p.classList.toggle('active', p.dataset.typeFilter === 'all');
    });
    renderActivity();
  }

  function loadDemoData() {
    const demo = buildDemoTransactions(getTodayISO());
    const existingIds = new Set(state.transactions.map((t) => t.id));
    let added = 0;
    demo.forEach((item) => {
      if (!existingIds.has(item.id)) {
        state.transactions.push(item);
        added++;
      }
    });
    state.selectedMonth = getCurrentYearMonth();
    persistAndRender();
    showToast(added > 0 ? `${added} transaksi contoh ditambahkan` : 'Data contoh sudah ada');
  }

  // ==================== PWA & SERVICE WORKER ====================
  async function triggerInstallPrompt() {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    const result = await state.deferredInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      installBanner.classList.add('hidden');
      pwaModal.classList.add('hidden');
      showToast('Aplikasi dipasang ke layar utama');
    }
    state.deferredInstallPrompt = null;
  }

  function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredInstallPrompt = e;
      installBanner.classList.remove('hidden');
      pwaStatusText.textContent = 'Siap dipasang langsung ke layar utama HP';
    });

    window.addEventListener('appinstalled', () => {
      installBanner.classList.add('hidden');
      state.deferredInstallPrompt = null;
      pwaStatusText.textContent = 'Aplikasi sudah terpasang di perangkat';
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Service Worker gagal didaftarkan:', err);
        });
      });
    }
  }

  // ==================== STARTUP ====================
  populateSelects();
  bindEvents();
  setupPWA();
  renderAll();
})();
