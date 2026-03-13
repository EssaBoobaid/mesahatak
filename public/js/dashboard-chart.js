(function () {
  const canvas = document.getElementById('rentBarChart');
  if (!canvas || typeof Chart === 'undefined') return;

  let chartData;
  try {
    chartData = JSON.parse(canvas.dataset.chart || '{}');
  } catch (e) {
    chartData = {};
  }

  if (!chartData || !Array.isArray(chartData.labels)) chartData = { labels: [], bookings: [], revenue: [] };
  const hasData = (chartData.bookings || []).some((v) => v > 0) || (chartData.revenue || []).some((v) => v > 0);
  if (!hasData || !chartData.labels.length) return;

  const ctx = canvas.getContext('2d');
  const gradientBookings = ctx.createLinearGradient(0, 0, 0, 180);
  gradientBookings.addColorStop(0, 'rgba(78, 160, 255, 0.65)');
  gradientBookings.addColorStop(1, 'rgba(78, 160, 255, 0.18)');
  const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 180);
  gradientRevenue.addColorStop(0, 'rgba(247, 201, 72, 0.7)');
  gradientRevenue.addColorStop(1, 'rgba(247, 201, 72, 0.18)');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'عدد الحجوزات',
          data: chartData.bookings,
          backgroundColor: gradientBookings,
          borderColor: 'rgba(78, 160, 255, 0.9)',
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        },
        {
          label: 'إجمالي الدخل (ر.س)',
          data: chartData.revenue,
          backgroundColor: gradientRevenue,
          borderColor: 'rgba(247, 201, 72, 0.9)',
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(12, 31, 54, 0.08)' },
          ticks: { color: '#0b1f36', font: { weight: '600' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(12, 31, 54, 0.08)' },
          ticks: { color: '#0b1f36', font: { weight: '600' } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#0b1f36', font: { weight: '700' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed.y || 0;
              return ctx.datasetIndex === 0 ? `الحجوزات: ${value}` : `الدخل: ${value.toLocaleString('ar-EG')} ر.س`;
            }
          }
        }
      }
    }
  });
})();
