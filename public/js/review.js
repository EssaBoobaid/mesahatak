(() => {
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  const statusBox = document.getElementById('reviewStatus');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelReview');
  const submitBtn = document.getElementById('submitReview');
  const stars = document.querySelectorAll('#stars .star');
  const ratingInput = document.getElementById('ratingInput');

  if (!modal || !form || !statusBox || !submitBtn || !ratingInput || stars.length === 0) return;

  const setStars = (val) => {
    stars.forEach((s) => {
      const v = Number(s.dataset.value);
      s.classList.toggle('filled', v <= val);
      const icon = s.querySelector('i');
      if (icon) icon.className = v <= val ? 'fa-solid fa-star' : 'fa-regular fa-star';
    });
    ratingInput.value = val || '';
  };

  const resetForm = () => {
    form.reset();
    setStars(0);
  };

  const openModal = (bookingId, spaceId) => {
    form.booking_id.value = bookingId;
    form.space_id.value = spaceId;
    modal.classList.add('show');
    statusBox.textContent = 'اختر التقييم وأضف ملاحظتك';
    statusBox.className = 'status-box info';
    submitBtn.disabled = false;
    setStars(0);
  };

  const closeModal = () => {
    modal.classList.remove('show');
    form.reset();
  };

  document.querySelectorAll('.review-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      const hasReview = btn.dataset.hasReview === '1';
      if (hasReview) {
        statusBox.textContent = 'تم التقييم مسبقاً';
        statusBox.className = 'status-box ok';
        submitBtn.disabled = true;
        resetForm();
        modal.classList.add('show');
        return;
      }
      if (status !== 'completed') {
        statusBox.textContent = 'التقييم متاح بعد اكتمال الحجز';
        statusBox.className = 'status-box warn';
        submitBtn.disabled = true;
        resetForm();
        modal.classList.add('show');
        return;
      }
      submitBtn.disabled = false;
      openModal(btn.dataset.booking, btn.dataset.space);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.rating) {
      statusBox.textContent = 'اختر تقييم النجوم';
      statusBox.className = 'status-box warn';
      return;
    }
    if (!payload.booking_id || !payload.space_id) {
      statusBox.textContent = 'لا يمكن الإرسال بدون حجز صالح';
      statusBox.className = 'status-box warn';
      return;
    }
    try {
      statusBox.textContent = 'جاري الحفظ...';
      statusBox.className = 'status-box info';
      const res = await fetch('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'تعذر الحفظ');
      statusBox.textContent = 'تم التقييم بنجاح';
      statusBox.className = 'status-box ok';
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      statusBox.textContent = err.message || 'تعذر الحفظ';
      statusBox.className = 'status-box warn';
    }
  });

  stars.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.value);
      setStars(val);
    });
  });
})();
