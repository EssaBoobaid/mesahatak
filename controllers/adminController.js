const { User, Space, Booking, Payment } = require('../models');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [usersCount, spacesCount, bookingsCount, paymentsSum] = await Promise.all([
      User.count(),
      Space.count(),
      Booking.count(),
      Payment.sum('amount')
    ]);

    const revenueGross = Number(paymentsSum || 0);
    const revenuePlatform = Number((revenueGross * 0.1).toFixed(2));

    res.render('admin/dashboard_admin', {
      title: 'Admin Dashboard',
      stats: {
        users: usersCount,
        spaces: spacesCount,
        bookings: bookingsCount,
        revenueGross,
        revenuePlatform
      }
    });
  } catch (err) {
    console.error('getAdminDashboard error:', err);
    res.status(500).render('admin/dashboard_admin', { title: 'Admin Dashboard', errorMessage: 'تعذر تحميل الإحصاءات' });
  }
};

exports.getFinance = async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [['created_at', 'DESC']], limit: 50 });

    const enhanced = payments.map(p => {
      const plain = p.get({ plain: true });
      const gross = Number(plain.amount || 0);
      const platform_fee = Number((gross * 0.1).toFixed(2));
      const payout = Number((gross - platform_fee).toFixed(2));
      return { ...plain, platform_fee, payout };
    });

    const totals = enhanced.reduce(
      (acc, p) => {
        acc.gross += p.amount ? Number(p.amount) : 0;
        acc.platform += p.platform_fee;
        acc.payout += p.payout;
        return acc;
      },
      { gross: 0, platform: 0, payout: 0 }
    );

    Object.keys(totals).forEach(k => {
      totals[k] = Number(totals[k].toFixed(2));
    });

    res.render('admin/finance', { title: 'Finance', payments: enhanced, totals });
  } catch (err) {
    console.error('getFinance error:', err);
    res.status(500).render('admin/finance', { title: 'Finance', payments: [], totals: null, errorMessage: 'تعذر تحميل البيانات المالية' });
  }
};

exports.overview = async (req, res) => {
  try {
    const revenueGross = await Payment.sum('amount');
    const stats = {
      users: await User.count(),
      spaces: await Space.count(),
      bookings: await Booking.count(),
      revenueGross: Number(revenueGross || 0),
      revenuePlatform: Number(((revenueGross || 0) * 0.1).toFixed(2))
    };
    res.json({ stats });
  } catch (err) {
    console.error('overview error:', err);
    res.status(500).json({ message: 'تعذر جلب نظرة عامة' });
  }
};
