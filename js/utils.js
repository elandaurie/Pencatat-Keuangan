/**
 * Utilitas pemformatan mata uang Rupiah, tanggal lokal Indonesia, dan sanitasi teks.
 */
window.APP_UTILS = (() => {
  const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const MONTH_SHORT_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const numberFormatter = new Intl.NumberFormat('id-ID');

  function formatRupiah(amount, withSign = false) {
    const num = Math.round(Number(amount) || 0);
    const absFormatted = `Rp${numberFormatter.format(Math.abs(num))}`;
    if (withSign) {
      if (num > 0) return `+${absFormatted}`;
      if (num < 0) return `-${absFormatted}`;
    }
    return num < 0 ? `-${absFormatted}` : absFormatted;
  }

  function formatCompactRupiah(amount) {
    const num = Math.abs(Math.round(Number(amount) || 0));
    if (num === 0) return 'Rp0';
    if (num >= 1000000) {
      const jt = (num / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', ',');
      return `Rp${jt}jt`;
    }
    if (num >= 1000) {
      const rb = Math.round(num / 1000);
      return `Rp${rb}rb`;
    }
    return `Rp${num}`;
  }

  function parseNumericInput(raw) {
    const digits = String(raw || '').replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  function formatInputThousands(raw) {
    const num = parseNumericInput(raw);
    return num > 0 ? numberFormatter.format(num) : '';
  }

  function toLocalISODate(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getTodayISO() {
    return toLocalISODate(new Date());
  }

  function getCurrentYearMonth() {
    return getTodayISO().slice(0, 7);
  }

  function shiftYearMonth(ym, deltaMonths) {
    const [y, m] = ym.split('-').map(Number);
    const dt = new Date(y, m - 1 + deltaMonths, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  }

  function formatMonthLabel(ym) {
    if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return 'Semua Bulan';
    const [y, m] = ym.split('-').map(Number);
    return `${MONTH_NAMES_ID[m - 1]} ${y}`;
  }

  function formatShortDate(dateISO) {
    if (!dateISO) return '';
    const today = getTodayISO();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toLocalISODate(yesterdayDate);

    if (dateISO === today) return 'Hari ini';
    if (dateISO === yesterday) return 'Kemarin';

    const [, m, d] = dateISO.split('-').map(Number);
    return `${d} ${MONTH_SHORT_ID[m - 1]}`;
  }

  function formatGroupDate(dateISO) {
    if (!dateISO) return '';
    const today = getTodayISO();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toLocalISODate(yesterdayDate);

    const [y, m, d] = dateISO.split('-').map(Number);
    const shortPart = `${d} ${MONTH_SHORT_ID[m - 1]}`;

    if (dateISO === today) return `Hari ini, ${shortPart}`;
    if (dateISO === yesterday) return `Kemarin, ${shortPart}`;
    return `${d} ${MONTH_SHORT_ID[m - 1]} ${y}`;
  }

  function daysInMonth(ym) {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }

  function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeCSV(val) {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  return {
    formatRupiah,
    formatCompactRupiah,
    parseNumericInput,
    formatInputThousands,
    getTodayISO,
    getCurrentYearMonth,
    shiftYearMonth,
    formatMonthLabel,
    formatShortDate,
    formatGroupDate,
    daysInMonth,
    generateId,
    escapeHTML,
    escapeCSV
  };
})();
