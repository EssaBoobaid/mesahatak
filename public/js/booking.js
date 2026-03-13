(() => {
  const spaceSelect = document.getElementById('spaceSelect');
  const rentalPill = document.getElementById('rentalPill');
  const dailyPanel = document.getElementById('dailyPanel');
  const hourlyPanel = document.getElementById('hourlyPanel');
  const monthlyPanel = document.getElementById('monthlyPanel');
  const yearlyPanel = document.getElementById('yearlyPanel');
  const dayGrid = document.getElementById('dayGrid');
  const dailyStart = document.getElementById('dailyStart');
  const dailyEnd = document.getElementById('dailyEnd');
  const hourlyDate = document.getElementById('hourlyDate');
  const blockGrid = document.getElementById('blockGrid');
  const blockHoursLabel = document.getElementById('blockHoursLabel');
  const monthlyStart = document.getElementById('monthlyStart');
  const monthlyMonths = document.getElementById('monthlyMonths');
  const yearlyStart = document.getElementById('yearlyStart');
  const yearlyYears = document.getElementById('yearlyYears');
  const rangeFrom = document.getElementById('rangeFrom');
  const rangeTo = document.getElementById('rangeTo');
  const availabilityBox = document.getElementById('availabilityState');
  const summaryTitle = document.getElementById('summaryTitle');
  const summaryType = document.getElementById('summaryType');
  const summaryRange = document.getElementById('summaryRange');
  const summaryPrice = document.getElementById('summaryPrice');
  const hourlyHint = document.getElementById('hourlyHint');
  const dailyHint = document.getElementById('dailyHint');
  const refreshDaily = document.getElementById('refreshDaily');
  const prevDailyWindow = document.getElementById('prevDailyWindow');
  const nextDailyWindow = document.getElementById('nextDailyWindow');
  const refreshHourly = document.getElementById('refreshHourly');

  const spaceInput = document.getElementById('spaceInput');
  const startInput = document.getElementById('startInput');
  const endInput = document.getElementById('endInput');
  const form = document.getElementById('bookingForm');
  const loadingOverlay = document.getElementById('loadingOverlay');

  const state = {
    spaceId: null,
    rentalType: null,
    pricePerDay: 0,
    pricePerBlock: 0,
    pricePerMonth: 0,
    pricePerYear: 0,
    minMonths: 1,
    minYears: 1,
    blockHours: 1,
    daily: { available: [], start: null, end: null, windowStart: 0 },
    hourly: { date: null, availableBlocks: [], selected: [] },
    monthly: { start: null, months: null },
    yearly: { start: null, years: null }
  };

  const todayStr = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
  };
  const fmtMoney = (n) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ر.س';
  const fmtDate = (d) => new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' });

  // Preserve local date/time without shifting to UTC to avoid crossing day boundaries
  const toLocalISOString = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - tzOffset);
    return local.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
  };

  const addMonthsSafe = (date, months) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months, 1);
    const daysInTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, daysInTarget));
    return d;
  };

  const addYearsSafe = (date, years) => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  };

  const setHiddenTimes = (start, end) => {
    const startVal = start instanceof Date ? toLocalISOString(start) : start;
    const endVal = end instanceof Date ? toLocalISOString(end) : end;
    startInput.value = startVal || '';
    endInput.value = endVal || '';
  };

  const setAvailabilityMessage = (msg, type = 'info') => {
    availabilityBox.textContent = msg;
    availabilityBox.className = `availability-box ${type}`;
  };

  const updateRangePreview = () => {
    if (state.daily.start) {
      rangeFrom.textContent = `من ${fmtDate(state.daily.start)}`;
      rangeTo.textContent = state.daily.end ? `إلى ${fmtDate(state.daily.end)}` : 'إلى —';
    } else {
      rangeFrom.textContent = 'من —';
      rangeTo.textContent = 'إلى —';
    }
  };

  const fetchAvailability = async (type, date) => {
    const params = new URLSearchParams({ space_id: state.spaceId, type });
    if (date) params.append('date', date);
    const res = await fetch(`/booking/availability?${params.toString()}`);
    if (!res.ok) throw new Error('تعذر جلب التوفر');
    return res.json();
  };

  const renderSummary = () => {
    if (!state.spaceId) {
      summaryTitle.textContent = 'انتظر اختيار المساحة';
      summaryType.textContent = '—';
      summaryRange.textContent = '—';
      summaryPrice.textContent = '—';
      return;
    }

    summaryTitle.textContent = 'جاهز لإنشاء الحجز';
    const typeMap = {
      daily: 'حجز يومي (محدد من المعلن)',
      hourly: 'حجز بالساعة (محدد من المعلن)',
      monthly: 'حجز شهري (محدد من المعلن)',
      yearly: 'حجز سنوي (محدد من المعلن)'
    };
    summaryType.textContent = typeMap[state.rentalType] || '—';

    if (!startInput.value || !endInput.value) {
      summaryRange.textContent = 'اختر الفترة أولاً';
      summaryPrice.textContent = '—';
      return;
    }

    const start = new Date(startInput.value);
    const end = new Date(endInput.value);
    const diffMs = end.getTime() - start.getTime();

    if (state.rentalType === 'daily') {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const total = (state.pricePerDay || 0) * days;
      summaryRange.textContent = `${fmtDate(start)} → ${fmtDate(end)}`;
      summaryPrice.textContent = fmtMoney(total);
    } else if (state.rentalType === 'hourly') {
      const hours = diffMs / (1000 * 60 * 60);
      const blocks = Math.max(1, Math.ceil(hours / (state.blockHours || 1)));
      const total = (state.pricePerBlock || 0) * blocks;
      const opts = { hour: 'numeric', minute: '2-digit' };
      summaryRange.textContent = `${start.toLocaleString('ar-EG', opts)} → ${end.toLocaleString('ar-EG', opts)} (${blocks} فترة)`;
      summaryPrice.textContent = fmtMoney(total);
    } else if (state.rentalType === 'monthly') {
      const months = state.monthly.months || state.minMonths || 1;
      const total = (state.pricePerMonth || 0) * months;
      summaryRange.textContent = `${fmtDate(start)} → ${fmtDate(end)} (${months} شهر)`;
      summaryPrice.textContent = fmtMoney(total);
    } else if (state.rentalType === 'yearly') {
      const years = state.yearly.years || state.minYears || 1;
      const total = (state.pricePerYear || 0) * years;
      summaryRange.textContent = `${fmtDate(start)} → ${fmtDate(end)} (${years} سنة)`;
      summaryPrice.textContent = fmtMoney(total);
    }
  };

  const togglePanels = () => {
    dailyPanel.classList.toggle('is-hidden', state.rentalType !== 'daily');
    hourlyPanel.classList.toggle('is-hidden', state.rentalType !== 'hourly');
    monthlyPanel.classList.toggle('is-hidden', state.rentalType !== 'monthly');
    yearlyPanel.classList.toggle('is-hidden', state.rentalType !== 'yearly');
  };

  const renderDayGrid = () => {
    const days = state.daily.available;
    dayGrid.innerHTML = '';
    if (!days.length) {
      dayGrid.innerHTML = '<div class="empty">لا توجد أيام متاحة حالياً</div>';
      setHiddenTimes('', '');
      renderSummary();
      return;
    }

    const windowSize = 7;
    const startIdx = Math.max(0, Math.min(state.daily.windowStart, Math.max(0, days.length - windowSize)));
    state.daily.windowStart = startIdx;
    const slice = days.slice(startIdx, startIdx + windowSize);

    const startSel = state.daily.start;
    const endSel = state.daily.end || state.daily.start;

    slice.forEach((d) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const inRange = startSel && endSel && d.date >= startSel && d.date <= endSel;
      const isEdge = d.date === startSel || d.date === endSel;
      const unavailable = !d.available;
      btn.className = `chip ${isEdge ? 'active' : ''} ${inRange && !isEdge ? 'in-range' : ''} ${unavailable ? 'unavailable' : ''}`;
      btn.dataset.date = d.date;
      btn.textContent = unavailable ? `${d.label} • محجوز` : d.label;
      if (unavailable) btn.setAttribute('aria-disabled', 'true');
      if (unavailable) btn.title = 'اليوم محجوز وغير متاح للاختيار';
      btn.addEventListener('click', () => {
        if (unavailable) return;
        if (!state.daily.start || state.daily.end) {
          state.daily.start = d.date;
          state.daily.end = null;
        } else {
          state.daily.end = d.date;
        }
        if (state.daily.end && state.daily.start > state.daily.end) {
          const tmp = state.daily.start;
          state.daily.start = state.daily.end;
          state.daily.end = tmp;
        }
        applyDailyRange();
      });
      dayGrid.appendChild(btn);
    });

      if (prevDailyWindow) prevDailyWindow.disabled = startIdx === 0;
      if (nextDailyWindow) nextDailyWindow.disabled = startIdx + windowSize >= days.length;
  };

  const applyDailyRange = () => {
    if (!state.daily.start) return;
    const start = state.daily.start;
    const end = state.daily.end || state.daily.start;
    dailyStart.value = start;
    dailyEnd.value = end;

    updateRangePreview();

    const availSet = new Set(state.daily.available.filter((d) => d.available).map((d) => d.date));
    const cursor = new Date(start + 'T00:00');
    const target = new Date(end + 'T00:00');
    let ok = true;
    while (cursor <= target) {
      const key = cursor.toISOString().slice(0, 10);
      if (!availSet.has(key)) { ok = false; break; }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (!ok) {
      setAvailabilityMessage('التواريخ المختارة غير متاحة بالكامل', 'warn');
      setHiddenTimes('', '');
      renderSummary();
      return;
    }

    const startDate = new Date(start + 'T00:00');
    const endDate = new Date(end + 'T00:00');
    const endFull = new Date(endDate);
    endFull.setHours(23, 59, 0, 0);
    setHiddenTimes(startDate, endFull);
    setAvailabilityMessage('الفترة متاحة. يمكنك المتابعة.', 'ok');
    renderSummary();
    renderDayGrid();
  };

  const renderBlocks = () => {
    blockGrid.innerHTML = '';
    const blocks = state.hourly.availableBlocks;
    if (!blocks.length) {
      blockGrid.innerHTML = '<div class="empty">لا توجد فترات متاحة لهذا اليوم</div>';
      setHiddenTimes('', '');
      renderSummary();
      return;
    }

    blocks.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = state.hourly.selected.includes(b.start);
      btn.className = `chip ${isSelected ? 'active' : ''}`;
      btn.dataset.start = b.start;
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        if (isSelected) {
          state.hourly.selected = state.hourly.selected.filter((s) => s !== b.start);
        } else {
          state.hourly.selected = [...state.hourly.selected, b.start];
        }
        applyHourlySelection();
      });
      blockGrid.appendChild(btn);
    });
  };

  const applyHourlySelection = () => {
    if (!state.hourly.selected.length) {
      setHiddenTimes('', '');
      setAvailabilityMessage('اختر فترة أو أكثر متتالية', 'info');
      renderSummary();
      renderBlocks();
      return;
    }

    const available = new Set(state.hourly.availableBlocks.map((b) => b.start));
    const sorted = [...state.hourly.selected].sort();
    if (!sorted.every((s) => available.has(s))) {
      setAvailabilityMessage('تم اختيار فترات غير متاحة', 'warn');
      setHiddenTimes('', '');
      renderSummary();
      renderBlocks();
      return;
    }

    const blockMs = state.blockHours * 60 * 60 * 1000;
    let contiguous = true;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]).getTime();
      const curr = new Date(sorted[i]).getTime();
      if (curr - prev !== blockMs) { contiguous = false; break; }
    }

    if (!contiguous) {
      setAvailabilityMessage('الرجاء اختيار فترات متتالية فقط', 'warn');
      setHiddenTimes('', '');
      renderSummary();
      renderBlocks();
      return;
    }

    const startDate = new Date(sorted[0]);
    const endDate = new Date(new Date(sorted[sorted.length - 1]).getTime() + blockMs);
    setHiddenTimes(startDate, endDate);
    setAvailabilityMessage('الفترة متاحة. يمكنك المتابعة.', 'ok');
    renderSummary();
    renderBlocks();
  };

  const applyMonthlySelection = () => {
    const startVal = monthlyStart.value;
    const monthsVal = parseInt(monthlyMonths.value || state.minMonths || 1, 10);
    const months = Math.max(state.minMonths || 1, monthsVal || 1);
    if (!startVal) {
      setHiddenTimes('', '');
      setAvailabilityMessage('اختر تاريخ البداية', 'info');
      renderSummary();
      return;
    }

    state.monthly.start = startVal;
    state.monthly.months = months;
    monthlyMonths.value = months;

    const startDate = new Date(`${startVal}T00:00`);
    const endBoundary = addMonthsSafe(startDate, months);
    const endDate = new Date(endBoundary);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 0, 0);

    setHiddenTimes(startDate, endDate);
    setAvailabilityMessage('سيتم التحقق من التعارض أثناء إنشاء الحجز', 'info');
    renderSummary();
  };

  const applyYearlySelection = () => {
    const startVal = yearlyStart.value;
    const yearsVal = parseInt(yearlyYears.value || state.minYears || 1, 10);
    const years = Math.max(state.minYears || 1, yearsVal || 1);
    if (!startVal) {
      setHiddenTimes('', '');
      setAvailabilityMessage('اختر تاريخ البداية', 'info');
      renderSummary();
      return;
    }

    state.yearly.start = startVal;
    state.yearly.years = years;
    yearlyYears.value = years;

    const startDate = new Date(`${startVal}T00:00`);
    const endBoundary = addYearsSafe(startDate, years);
    const endDate = new Date(endBoundary);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 0, 0);

    setHiddenTimes(startDate, endDate);
    setAvailabilityMessage('سيتم التحقق من التعارض أثناء إنشاء الحجز', 'info');
    renderSummary();
  };

  const loadDaily = async () => {
    if (!state.spaceId) return;
    setAvailabilityMessage('جاري جلب الأيام المتاحة...', 'info');
    const data = await fetchAvailability('daily');
    state.daily.available = data.availableDays || [];
    state.daily.windowStart = 0;

    const availableOnly = state.daily.available.filter((d) => d.available);
    if (!availableOnly.length) {
      state.daily.start = null;
      state.daily.end = null;
      renderDayGrid();
      setAvailabilityMessage('لا توجد أيام متاحة حالياً', 'warn');
      renderSummary();
      updateRangePreview();
      return;
    }

    state.daily.start = availableOnly[0].date;
    state.daily.end = availableOnly[1]?.date || state.daily.start;
    renderDayGrid();
    applyDailyRange();
  };

  const loadHourly = async () => {
    if (!state.spaceId) return;
    setAvailabilityMessage('جاري جلب الفترات المتاحة...', 'info');
    const selectedDate = hourlyDate.value || todayStr();
    const data = await fetchAvailability('hourly', selectedDate);
    state.hourly.date = data.date;
    state.hourly.availableBlocks = data.availableBlocks || [];
    state.hourly.selected = state.hourly.availableBlocks[0]?.start ? [state.hourly.availableBlocks[0].start] : [];
    hourlyDate.value = data.date;
    if (!state.hourly.availableBlocks.length) {
      renderBlocks();
      setAvailabilityMessage('لا توجد فترات متاحة لهذا اليوم', 'warn');
      renderSummary();
      return;
    }
    renderBlocks();
    applyHourlySelection();
  };

  const resetState = () => {
    setHiddenTimes('', '');
    state.daily = { available: [], start: null, end: null };
    state.hourly = { date: todayStr(), availableBlocks: [], selected: [] };
    state.monthly = { start: null, months: null };
    state.yearly = { start: null, years: null };
    dayGrid.innerHTML = '';
    blockGrid.innerHTML = '';
    if (monthlyStart) monthlyStart.value = '';
    if (monthlyMonths) monthlyMonths.value = state.minMonths || 1;
    if (yearlyStart) yearlyStart.value = '';
    if (yearlyYears) yearlyYears.value = state.minYears || 1;
    updateRangePreview();
  };

  spaceSelect.addEventListener('change', async () => {
    const opt = spaceSelect.options[spaceSelect.selectedIndex];
    if (!opt || !opt.value) {
      rentalPill.textContent = 'اختر المساحة لمعرفة نوع الحجز';
      resetState();
      renderSummary();
      return;
    }

    state.spaceId = opt.value;
    state.rentalType = opt.dataset.type;
    state.pricePerDay = parseFloat(opt.dataset.daily || 0);
    state.pricePerBlock = parseFloat(opt.dataset.block || 0);
    state.pricePerMonth = parseFloat(opt.dataset.monthly || 0);
    state.pricePerYear = parseFloat(opt.dataset.yearly || 0);
    state.minMonths = parseInt(opt.dataset.minMonths || '1', 10) || 1;
    state.minYears = parseInt(opt.dataset.minYears || '1', 10) || 1;
    state.blockHours = parseFloat(opt.dataset.hours || 1) || 1;
    spaceInput.value = state.spaceId;
    blockHoursLabel.textContent = state.blockHours;
    if (monthlyMonths) monthlyMonths.min = state.minMonths;
    if (yearlyYears) yearlyYears.min = state.minYears;

    const pillText = {
      daily: 'هذه المساحة: حجز يومي فقط',
      hourly: 'هذه المساحة: حجز بالساعة فقط',
      monthly: 'هذه المساحة: حجز شهري فقط',
      yearly: 'هذه المساحة: حجز سنوي فقط'
    };

    rentalPill.textContent = pillText[state.rentalType] || 'نوع الحجز يحدده المعلن';
    togglePanels();
    resetState();
    renderSummary();

    try {
      if (state.rentalType === 'daily') {
        await loadDaily();
      } else if (state.rentalType === 'hourly') {
        hourlyDate.value = todayStr();
        await loadHourly();
      } else if (state.rentalType === 'monthly') {
        monthlyStart.value = todayStr();
        monthlyMonths.value = state.minMonths;
        applyMonthlySelection();
      } else if (state.rentalType === 'yearly') {
        yearlyStart.value = todayStr();
        yearlyYears.value = state.minYears;
        applyYearlySelection();
      }
    } catch (err) {
      setAvailabilityMessage(err.message || 'تعذر جلب التوفر', 'warn');
    }
  });

  dailyStart.addEventListener('change', () => {
    state.daily.start = dailyStart.value || null;
    applyDailyRange();
  });
  dailyEnd.addEventListener('change', () => {
    state.daily.end = dailyEnd.value || null;
    applyDailyRange();
  });
  monthlyStart.addEventListener('change', applyMonthlySelection);
  monthlyMonths.addEventListener('input', applyMonthlySelection);
  yearlyStart.addEventListener('change', applyYearlySelection);
  yearlyYears.addEventListener('input', applyYearlySelection);
  hourlyDate.addEventListener('change', async () => {
    state.hourly.date = hourlyDate.value;
    try {
      await loadHourly();
    } catch (err) {
      setAvailabilityMessage(err.message || 'تعذر جلب التوفر', 'warn');
    }
  });
  refreshDaily.addEventListener('click', async () => {
    try {
      await loadDaily();
    } catch (err) {
      setAvailabilityMessage(err.message || 'تعذر جلب التوفر', 'warn');
    }
  });
  prevDailyWindow.addEventListener('click', () => {
    state.daily.windowStart = Math.max(0, state.daily.windowStart - 7);
    renderDayGrid();
  });
  nextDailyWindow.addEventListener('click', () => {
    state.daily.windowStart = Math.min(Math.max(0, state.daily.available.length - 7), state.daily.windowStart + 7);
    renderDayGrid();
  });
  refreshHourly.addEventListener('click', async () => {
    try {
      await loadHourly();
    } catch (err) {
      setAvailabilityMessage(err.message || 'تعذر جلب التوفر', 'warn');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.spaceId) { alert('اختر المساحة أولاً'); return; }
    if (!startInput.value || !endInput.value) { alert('حدد الفترة الزمنية للحجز'); return; }

    const payload = {
      space_id: state.spaceId,
      start_time: startInput.value,
      end_time: endInput.value
    };

    if (state.rentalType === 'monthly') {
      payload.duration_months = state.monthly.months || state.minMonths;
    }
    if (state.rentalType === 'yearly') {
      payload.duration_years = state.yearly.years || state.minYears;
    }

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }
      const res = await fetch('/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطأ غير متوقع');
      loadingOverlay?.classList.add('show');
      window.location.href = `/booking/${data.id}/payment`;
    } catch (err) {
      loadingOverlay?.classList.remove('show');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
      }
      alert(err.message || 'تعذر إنشاء الحجز');
    }
  });

  // Auto-select when a single space is injected (details page) or pick first option otherwise
  if (spaceSelect.options.length === 1) {
    spaceSelect.selectedIndex = 0;
    spaceSelect.dispatchEvent(new Event('change'));
  } else if (spaceSelect.options.length > 1) {
    spaceSelect.selectedIndex = 1;
    spaceSelect.dispatchEvent(new Event('change'));
  }
})();
