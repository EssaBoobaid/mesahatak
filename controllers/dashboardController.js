const { Booking, Space, Payment, Review, SpaceImage, City } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.getDashboard = async (req, res) => {
  const user = req.session.user || { full_name: 'مستخدم', role: 'user' };
  const userId = req.session.user?.id;

  let dashboardData = {
    stats: [],
    actions: [
      { label: 'حجز مساحة', href: '/spaces', icon: 'fa-magnifying-glass' },
      { label: 'إضافة مساحة للتأجير', href: '/dashboard/add-space', icon: 'fa-plus-circle' },
      { label: 'متابعة حجوزاتي', href: '/dashboard/my-booking', icon: 'fa-calendar-day' },
      { label: 'متابعة تأجيري', href: '/dashboard/my-rent', icon: 'fa-hand-holding' }
    ],
    upcomingBookings: [],
    activeRents: [],
    recommendations: [],
    monthlyChart: { labels: [], bookings: [], revenue: [] },
    timeline: []
  };

  try {
    const sixMonths = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - (5 - idx));
      return d;
    });
    const startRange = sixMonths[0];

    const formatPrice = (space) => {
      if (!space) return '—';
      const rental = space.rental_type;
      if (rental === 'hourly' && space.price_per_block) {
        const hrs = space.block_hours || 1;
        return `${Number(space.price_per_block).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س / فترة (${hrs} س)`;
      }
      if (rental === 'daily' && space.price_per_day) {
        return `${Number(space.price_per_day).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س / يوم`;
      }
      if (rental === 'monthly' && space.price_per_month) {
        return `${Number(space.price_per_month).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س / شهر`;
      }
      if (rental === 'yearly' && space.price_per_year) {
        return `${Number(space.price_per_year).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س / سنة`;
      }
      return '—';
    };

    const [bookingCount, spacesCount, upcomingBookings, spacesWithRevenue, recommendations, recentReviews, ownedBookings] = await Promise.all([
      userId ? Booking.count({ where: { user_id: userId } }) : 0,
      userId ? Space.count({ where: { user_id: userId } }) : 0,
      userId
        ? Booking.findAll({
            where: {
              end_time: { [Op.gte]: new Date() },
              status: { [Op.notIn]: ['cancelled'] },
              [Op.or]: [
                { user_id: userId },
                { '$Space.user_id$': userId }
              ]
            },
            include: [{
              model: Space,
              required: true,
              attributes: ['name', 'user_id'],
              include: [{ model: City, attributes: ['name'] }]
            }],
            order: [['start_time', 'ASC']],
            limit: 5,
            distinct: true
          })
        : [],
      userId
        ? Payment.findAll({
            include: [{
              model: Booking,
              include: [{ model: Space, attributes: ['name'], where: { user_id: userId } }]
            }],
            order: [['created_at', 'DESC']],
            limit: 5
          })
        : [],
      Space.findAll({
        order: [['created_at', 'DESC']],
        limit: 2,
        include: [{ model: City, attributes: ['name'] }]
      }),
      userId
        ? Review.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 5,
            include: [{ model: Space, attributes: ['name'] }]
          })
        : [],
      userId
        ? Booking.findAll({
            where: {
              start_time: { [Op.gte]: startRange }
            },
            include: [
              { model: Space, attributes: ['name'], where: { user_id: userId } },
              { model: Payment, required: false, attributes: ['amount'] }
            ]
          })
        : [],
    ]);

    const totalRevenue = spacesWithRevenue.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const monthFormatter = new Intl.DateTimeFormat('ar-EG', { month: 'short' });
    const buckets = sixMonths.reduce((acc, date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = { bookings: 0, revenue: 0, label: monthFormatter.format(date) };
      return acc;
    }, {});

    ownedBookings.forEach((b) => {
      const dt = new Date(b.start_time);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        const paid = b.Payment ? Number(b.Payment.amount || 0) : 0;
        buckets[key].bookings += 1;
        buckets[key].revenue += paid;
      }
    });

    const chartLabels = sixMonths.map((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return buckets[key].label;
    });
    const chartBookings = sixMonths.map((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return buckets[key].bookings;
    });
    const chartRevenue = sixMonths.map((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return buckets[key].revenue;
    });

    dashboardData = {
      stats: [],
      actions: dashboardData.actions,
      upcomingBookings: upcomingBookings.map(b => ({
        id: b.id,
        title: b.Space?.name || 'مساحة',
        date: b.start_time,
        status: b.status,
        location: b.Space?.City?.name || '—'
      })),
      activeRents: spacesWithRevenue.map(p => ({
        title: p.Booking?.Space?.name || 'مساحة',
        revenue: `${Number(p.amount || 0).toLocaleString('ar-EG')} ر.س`,
        occupancy: 'N/A',
        period: 'هذا الشهر'
      })),
      recommendations: recommendations.map(r => ({
        title: r.name,
        location: r.City?.name || '—',
        price: formatPrice(r),
        tag: 'جديد'
      })),
      monthlyChart: { labels: chartLabels, bookings: chartBookings, revenue: chartRevenue },
      timeline: recentReviews.map(rv => ({
        title: 'تقييم جديد',
        desc: `${rv.rating}/5 لمساحة ${rv.Space?.name || ''}`,
        time: rv.created_at,
        tone: 'secondary'
      }))
    };

    res.render('dashboard/dashbord', {
      title: 'لوحة التحكم',
      user,
      dashboardData,
      monthlyChart: dashboardData.monthlyChart,
      lang: 'ar',
      active: 'dashboard'
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).render('dashboard/dashbord', { title: 'لوحة التحكم', dashboardData, monthlyChart: dashboardData.monthlyChart, errorMessage: 'تعذر تحميل البيانات' });
  }
};

exports.getAddSpace = (req, res) => {
  res.redirect('/spaces/new');
};

exports.getMyBooking = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.session.user.id },
      include: [
        {
          model: Space,
          attributes: ['id', 'name', 'rental_type', 'price_per_day', 'price_per_block', 'block_hours'],
          include: [{
            model: SpaceImage,
            as: 'images',
            attributes: ['file_path'],
            separate: true,
            limit: 1,
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
          }]
        },
        { model: Payment, attributes: ['id', 'amount', 'payment_method', 'transaction_id', 'created_at'], required: false },
        { model: Review, attributes: ['id', 'rating', 'comment'], required: false }
      ],
      order: [['start_time', 'DESC']]
    });

    res.render('dashboard/my-booking', {
      title: 'حجوزاتي',
      bookings,
      lang: 'ar',
      active: 'my-booking'
    });
  } catch (err) {
    console.error('getMyBooking error:', err);
    res.status(500).render('dashboard/my-booking', { title: 'حجوزاتي', bookings: [], errorMessage: 'تعذر تحميل الحجوزات', lang: 'ar', active: 'my-booking' });
  }
};

exports.getMyRent = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const successMessage = req.query.success || null;
  const errorMessage = req.query.error || null;
  try {
    const spaces = await Space.findAll({
      where: { user_id: req.session.user.id },
      include: [
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['id', 'file_path', 'sort_order'],
          separate: true,
          order: [['sort_order', 'ASC'], ['id', 'ASC']]
        },
        { model: City, attributes: ['name'] },
        {
          model: Booking,
          attributes: ['id', 'status', 'start_time', 'end_time', 'total_price']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const mappedSpaces = spaces.map((s) => {
      const plain = s.get({ plain: true });
      const bookings = plain.Bookings || plain.Booking || []; // defensive
      const totalBookings = bookings.length;
      const upcoming = bookings.filter((b) => new Date(b.start_time) > new Date()).length;
      const status = plain.availability_end && new Date(plain.availability_end) < new Date() ? 'closed' : 'active';
      return { ...plain, stats: { totalBookings, upcoming }, status };
    });

    res.render('dashboard/my-rent', {
      title: 'مساحاتي المؤجرة',
      spaces: mappedSpaces,
      successMessage,
      errorMessage,
      lang: 'ar',
      active: 'my-rent'
    });
  } catch (err) {
    console.error('getMyRent error:', err);
    res.status(500).render('dashboard/my-rent', {
      title: 'مساحاتي المؤجرة',
      spaces: [],
      successMessage,
      errorMessage: errorMessage || 'تعذر تحميل مساحاتك حالياً',
      lang: 'ar',
      active: 'my-rent'
    });
  }
};



exports.updateMyRentSpace = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { id } = req.params;
  try {
    const space = await Space.findOne({ where: { id, user_id: req.session.user.id } });
    if (!space) return res.status(404).send('المساحة غير موجودة أو غير مملوكة لك');

    const {
      name,
      google_maps_url,
      price_per_day,
      price_per_block,
      price_per_month,
      price_per_year,
      min_months,
      min_years,
      block_hours,
      work_start,
      work_end,
      availability_start,
      availability_end,
      description,
      content
    } = req.body;

    const updates = {
      name: name || space.name,
      google_maps_url: google_maps_url || null,
      availability_start: availability_start || null,
      availability_end: availability_end || null,
      description: description || space.description,
      content: content || space.content
    };

    if (space.rental_type === 'daily') {
      updates.price_per_day = price_per_day || null;
      updates.price_per_block = null;
      updates.price_per_month = null;
      updates.price_per_year = null;
      updates.min_months = null;
      updates.min_years = null;
      updates.block_hours = null;
      updates.work_start = null;
      updates.work_end = null;
    } else if (space.rental_type === 'hourly') {
      updates.price_per_block = price_per_block || null;
      updates.block_hours = block_hours || null;
      updates.work_start = work_start || null;
      updates.work_end = work_end || null;
      updates.price_per_day = null;
      updates.price_per_month = null;
      updates.price_per_year = null;
      updates.min_months = null;
      updates.min_years = null;
    } else if (space.rental_type === 'monthly') {
      updates.price_per_month = price_per_month || null;
      updates.min_months = Math.max(1, parseInt(min_months || '1', 10) || 1);
      updates.price_per_day = null;
      updates.price_per_block = null;
      updates.block_hours = null;
      updates.work_start = null;
      updates.work_end = null;
      updates.price_per_year = null;
      updates.min_years = null;
    } else if (space.rental_type === 'yearly') {
      updates.price_per_year = price_per_year || null;
      updates.min_years = Math.max(1, parseInt(min_years || '1', 10) || 1);
      updates.price_per_day = null;
      updates.price_per_block = null;
      updates.block_hours = null;
      updates.work_start = null;
      updates.work_end = null;
      updates.price_per_month = null;
      updates.min_months = null;
    }

    await space.update(updates);
    return res.redirect('/dashboard/my-rent');
  } catch (err) {
    console.error('updateMyRentSpace error:', err);
    return res.status(500).send('حدث خطأ أثناء تحديث المساحة');
  }
};

exports.addSpaceImages = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { id } = req.params;
  try {
    const space = await Space.findOne({ where: { id, user_id: req.session.user.id } });
    if (!space) return res.status(404).send('المساحة غير موجودة أو غير مملوكة لك');

    const files = req.files || [];
    if (!files.length) return res.redirect('/dashboard/my-rent');

    const maxSort = (await SpaceImage.max('sort_order', { where: { space_id: id } })) || 0;
    const rows = files.map((file, idx) => ({
      space_id: id,
      file_path: `/uploads/spaces/${file.filename}`,
      sort_order: maxSort + idx + 1
    }));
    await SpaceImage.bulkCreate(rows);
    return res.redirect('/dashboard/my-rent');
  } catch (err) {
    console.error('addSpaceImages error:', err);
    return res.status(500).send('حدث خطأ أثناء إضافة الصور');
  }
};

exports.deleteSpace = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { id } = req.params;
  try {
    const space = await Space.findOne({ where: { id, user_id: req.session.user.id } });
    if (!space) return res.status(404).send('المساحة غير موجودة أو غير مملوكة لك');

    const images = await SpaceImage.findAll({ where: { space_id: id } });
    for (const img of images) {
      const rel = (img.file_path || '').replace(/^[/\\]+/, '');
      if (!rel) continue;
      const fullPath = path.join(__dirname, '..', rel);
      try {
        await fs.promises.unlink(fullPath);
      } catch (fileErr) {
        if (fileErr.code !== 'ENOENT') {
          console.warn('deleteSpace unlink error:', fileErr.message);
        }
      }
    }

    await space.destroy();
    return res.redirect(`/dashboard/my-rent?success=${encodeURIComponent('تم حذف المساحة بنجاح')}`);
  } catch (err) {
    console.error('deleteSpace error:', err);
    return res.redirect(`/dashboard/my-rent?error=${encodeURIComponent('تعذر حذف المساحة حالياً')}`);
  }
};

exports.archiveSpace = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { id } = req.params;
  try {
    const space = await Space.findOne({ where: { id, user_id: req.session.user.id } });
    if (!space) return res.status(404).send('المساحة غير موجودة أو غير مملوكة لك');
    await space.update({ availability_end: new Date() });
    return res.redirect('/dashboard/my-rent');
  } catch (err) {
    console.error('archiveSpace error:', err);
    return res.status(500).send('حدث خطأ أثناء إيقاف المساحة');
  }
};
