(() => {
  const categorySelect = document.getElementById('category');
  const subSelect = document.getElementById('subcategory');
  const otherGroup = document.getElementById('category-other');
  const rentalRadios = document.querySelectorAll('input[name="rental_type"]');
  const dailyEls = document.querySelectorAll('.rental-daily');
  const hourlyEls = document.querySelectorAll('.rental-hourly');
  const monthlyEls = document.querySelectorAll('.rental-monthly');
  const yearlyEls = document.querySelectorAll('.rental-yearly');
  const dropzone = document.getElementById('image-dropzone');
  const fileInput = document.getElementById('image_files');
  const preview = document.getElementById('image-preview');
  const maxFiles = 12;
  const maxSize = 5 * 1024 * 1024; // 5MB

  const toggleOther = () => {
    otherGroup.style.display = categorySelect.value === 'other' ? 'block' : 'none';
  };

  const filterSubs = () => {
    const cat = categorySelect.value;
    Array.from(subSelect.options).forEach((opt) => {
      if (!opt.dataset.cat) return;
      opt.style.display = opt.dataset.cat === cat ? 'block' : 'none';
    });
  };

  const toggleRental = () => {
    const val = document.querySelector('input[name="rental_type"]:checked')?.value || 'daily';
    dailyEls.forEach((el) => {
      el.style.display = val === 'daily' ? 'block' : 'none';
    });
    hourlyEls.forEach((el) => {
      el.style.display = val === 'hourly' ? 'block' : 'none';
    });
    monthlyEls.forEach((el) => {
      el.style.display = val === 'monthly' ? 'block' : 'none';
    });
    yearlyEls.forEach((el) => {
      el.style.display = val === 'yearly' ? 'block' : 'none';
    });
  };

  const renderPreview = (files) => {
    preview.innerHTML = '';
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const wrap = document.createElement('div');
      wrap.className = 'thumb';
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      wrap.appendChild(img);
      preview.appendChild(wrap);
    });
  };

  const setFiles = (fileList) => {
    const dt = new DataTransfer();
    const picked = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/') && f.size <= maxSize)
      .slice(0, maxFiles);
    picked.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;
    renderPreview(fileInput.files);
  };

  dropzone?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files?.length) {
      setFiles(e.dataTransfer.files);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      setFiles(e.target.files);
    }
  });

  categorySelect?.addEventListener('change', () => {
    toggleOther();
    filterSubs();
  });
  subSelect?.addEventListener('change', filterSubs);
  rentalRadios.forEach((r) => r.addEventListener('change', toggleRental));

  toggleOther();
  filterSubs();
  toggleRental();
})();
