(() => {
  const form = document.getElementById('profileForm');
  const saveBtn = document.getElementById('saveBtn');
  const statusBox = document.getElementById('statusBox');
  if (!form || !saveBtn) return;

  const setStatus = (msg, type = 'info') => {
    statusBox.textContent = msg;
    statusBox.className = `status-box ${type}`;
  };

  saveBtn.addEventListener('click', async () => {
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    try {
      saveBtn.disabled = true;
      saveBtn.classList.add('is-loading');
      setStatus('جاري الحفظ...', 'info');
      const res = await fetch('/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'تعذر الحفظ');
      setStatus('تم الحفظ بنجاح', 'ok');
    } catch (err) {
      setStatus(err.message || 'تعذر الحفظ', 'warn');
    } finally {
      saveBtn.disabled = false;
      saveBtn.classList.remove('is-loading');
    }
  });
})();
