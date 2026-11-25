/**
 * Visualisasi ringkasan pengeluaran:
 * - Grafik batang mingguan & harian bulan berjalan
 * - Diagram proporsi & daftar rincian per Kategori atau per Metode Pembayaran
 */
window.APP_CHARTS = (() => {
  const { getCategoryMeta, getPaymentMeta } = window.APP_CONSTANTS;
  const {
    formatRupiah,
    formatCompactRupiah,
    formatShortDate,
    daysInMonth,
    escapeHTML
  } = window.APP_UTILS;

  function renderWeeklyChart(container, monthExpenses, yearMonth) {
    container.className = 'weekly-chart';
    const totalDays = daysInMonth(yearMonth);
    const buckets = [
      { label: '1–7', total: 0 },
      { label: '8–14', total: 0 },
      { label: '15–21', total: 0 },
      { label: `22–${totalDays}`, total: 0 }
    ];

    monthExpenses.forEach((tx) => {
      const day = Number(tx.date.slice(8, 10));
      if (day <= 7) buckets[0].total += tx.amount;
      else if (day <= 14) buckets[1].total += tx.amount;
      else if (day <= 21) buckets[2].total += tx.amount;
      else buckets[3].total += tx.amount;
    });

    const maxVal = Math.max(...buckets.map((b) => b.total), 1);
    const hasData = buckets.some((b) => b.total > 0);

    container.innerHTML = buckets
      .map((bucket) => {
        const pct = hasData ? Math.max(8, Math.round((bucket.total / maxVal) * 86)) : 8;
        const isPeak = hasData && bucket.total === maxVal;
        return `
          <div class="week-col">
            <span class="week-val">${formatCompactRupiah(bucket.total)}</span>
            <div class="week-bar ${isPeak ? 'peak' : ''}" style="height: ${pct}%" title="${bucket.label}: ${formatRupiah(bucket.total)}"></div>
            <span class="week-label">${bucket.label}</span>
          </div>
        `;
      })
      .join('');
  }

  function renderDailyChart(container, detailBarEl, monthExpenses, yearMonth, selectedDay, onSelectDay) {
    container.className = 'daily-chart';
    const totalDays = daysInMonth(yearMonth);
    const days = Array.from({ length: totalDays }, (_, idx) => ({
      day: idx + 1,
      dateISO: `${yearMonth}-${String(idx + 1).padStart(2, '0')}`,
      total: 0,
      count: 0
    }));

    monthExpenses.forEach((tx) => {
      const dayNum = Number(tx.date.slice(8, 10));
      if (dayNum >= 1 && dayNum <= totalDays) {
        days[dayNum - 1].total += tx.amount;
        days[dayNum - 1].count += 1;
      }
    });

    const maxVal = Math.max(...days.map((d) => d.total), 0);
    const hasData = maxVal > 0;

    // Tentukan hari aktif default: hari dipilih user, atau hari terakhir dengan transaksi, atau hari ke-1
    let activeDay = selectedDay;
    if (!activeDay || activeDay < 1 || activeDay > totalDays) {
      const lastActive = [...days].reverse().find((d) => d.total > 0);
      activeDay = lastActive ? lastActive.day : 1;
    }

    container.innerHTML = days
      .map((d) => {
        const heightPct = hasData && d.total > 0 ? Math.max(10, Math.round((d.total / maxVal) * 82)) : 4;
        const isPeak = hasData && d.total === maxVal;
        const isSelected = d.day === activeDay;
        const barClasses = ['day-bar'];
        if (d.total > 0) barClasses.push('has-spend');
        if (isPeak) barClasses.push('peak');

        return `
          <button type="button" class="day-col ${isSelected ? 'selected' : ''}" data-day="${d.day}" aria-label="${formatShortDate(d.dateISO)}: ${formatRupiah(d.total)}">
            <span class="day-val">${d.total > 0 ? formatCompactRupiah(d.total) : ''}</span>
            <div class="${barClasses.join(' ')}" style="height: ${heightPct}%"></div>
            <span class="day-label">${d.day}</span>
          </button>
        `;
      })
      .join('');

    function updateDetailBar(dayObj) {
      detailBarEl.classList.remove('hidden');
      if (!hasData) {
        detailBarEl.innerHTML = '<span>Belum ada pengeluaran di bulan ini</span><strong>Rp0</strong>';
        return;
      }
      const dateLabel = formatShortDate(dayObj.dateISO);
      const countLabel = dayObj.count > 0 ? `${dayObj.count} transaksi` : 'tidak ada pengeluaran';
      detailBarEl.innerHTML = `
        <span>${escapeHTML(dateLabel)} · ${escapeHTML(countLabel)}</span>
        <strong>${formatRupiah(dayObj.total)}</strong>
      `;
    }

    updateDetailBar(days[activeDay - 1]);

    // Klik tiap batang hari untuk melihat detail nominal tanggal tersebut
    container.querySelectorAll('.day-col').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dayNum = Number(btn.dataset.day);
        container.querySelectorAll('.day-col').forEach((el) => {
          el.classList.toggle('selected', Number(el.dataset.day) === dayNum);
        });
        updateDetailBar(days[dayNum - 1]);
        if (typeof onSelectDay === 'function') onSelectDay(dayNum);
      });
    });

    // Gulir perlahan agar hari aktif berada di area pandang
    const activeEl = container.querySelector('.day-col.selected');
    if (activeEl) {
      const targetLeft = Math.max(0, activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2);
      container.scrollLeft = targetLeft;
    }

    return days.filter((d) => d.total > 0).length;
  }

  function renderBreakdown({
    transactions,
    yearMonth,
    mode,
    chartPeriod = 'weekly',
    selectedDay = null,
    onSelectDay = null,
    chartEl,
    detailBarEl,
    totalEl,
    rangeEl,
    countEl,
    stackedEl,
    listEl,
    calloutEl,
    calloutTitleEl,
    calloutDescEl
  }) {
    const monthExpenses = transactions.filter(
      (tx) => tx.type === 'expense' && tx.date.startsWith(yearMonth)
    );
    const totalExpense = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalDays = daysInMonth(yearMonth);

    totalEl.textContent = formatRupiah(totalExpense);

    if (chartPeriod === 'daily') {
      const activeDaysCount = renderDailyChart(
        chartEl,
        detailBarEl,
        monthExpenses,
        yearMonth,
        selectedDay,
        onSelectDay
      );
      rangeEl.textContent = `Per hari (1–${totalDays}) · ${activeDaysCount} hari ada pengeluaran`;
    } else {
      detailBarEl.classList.add('hidden');
      rangeEl.textContent = `Tanggal 1–${totalDays}`;
      renderWeeklyChart(chartEl, monthExpenses, yearMonth);
    }

    if (monthExpenses.length === 0) {
      countEl.textContent = '0 item';
      stackedEl.innerHTML = '';
      listEl.innerHTML = `
        <div class="empty-state">
          <p>Belum ada pengeluaran di bulan ini untuk ditampilkan dalam diagram.</p>
        </div>
      `;
      calloutEl.classList.add('hidden');
      return;
    }

    const map = new Map();
    monthExpenses.forEach((tx) => {
      const key = mode === 'payment' ? tx.paymentMethod : tx.category;
      map.set(key, (map.get(key) || 0) + tx.amount);
    });

    const items = Array.from(map.entries())
      .map(([name, amount]) => {
        const meta = mode === 'payment' ? getPaymentMeta(name) : getCategoryMeta(name);
        const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return { name, amount, pct, color: meta.color };
      })
      .sort((a, b) => b.amount - a.amount);

    countEl.textContent = `${items.length} ${mode === 'payment' ? 'metode' : 'kategori'}`;

    stackedEl.innerHTML = items
      .map(
        (item) =>
          `<div class="stacked-seg" style="width: ${Math.max(item.pct, 2)}%; background-color: ${item.color};" title="${escapeHTML(item.name)}: ${item.pct}%"></div>`
      )
      .join('');

    listEl.innerHTML = items
      .map(
        (item) => `
        <div class="breakdown-row">
          <div class="breakdown-left">
            <span class="breakdown-dot" style="background-color: ${item.color}"></span>
            <span class="breakdown-name">${escapeHTML(item.name)}</span>
          </div>
          <div class="breakdown-right">
            <span class="breakdown-amount">${formatRupiah(item.amount)}</span>
            <span class="breakdown-pct">${item.pct}%</span>
          </div>
        </div>
      `
      )
      .join('');

    const top = items[0];
    calloutTitleEl.textContent =
      mode === 'payment' ? 'Metode paling sering dipakai' : 'Pengeluaran terbesar bulan ini';
    calloutDescEl.textContent = `${top.name} menyumbang ${top.pct}% (${formatRupiah(top.amount)}) dari total pengeluaran bulan ini.`;
    calloutEl.classList.remove('hidden');
  }

  return { renderBreakdown };
})();
