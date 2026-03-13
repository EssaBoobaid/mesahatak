(() => {
  const form = document.getElementById('payForm');
  const overlay = document.getElementById('payOverlay');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('is-loading');
      }
      const res = await fetch(window.location.pathname.replace('/payment', '/pay'), {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل الدفع');
      overlay?.classList.add('show');
      setTimeout(() => {
        window.location.href = `/booking/${data.booking_id}/print`;
      }, 650);
    } catch (err) {
      overlay?.classList.remove('show');
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
      alert(err.message || 'تعذر إتمام الدفع');
    }
  });
})();
