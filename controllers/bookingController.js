const { Op } = require('sequelize');
const { Booking, Space, Payment, User } = require('../models');

// Format like "Sat 12 Jul" to match the requested display
const formatDayLabel = (dateObj) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(2, '0')} ${months[dateObj.getMonth()]}`;
};

const combineDateTime = (dateStr, timeStr) => {
  const [h = '0', m = '0'] = timeStr.split(':');
  const d = new Date(`${dateStr}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`);
  return d;
};

const addMonthsSafe = (dateObj, months) => {
  const d = new Date(dateObj);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months, 1);
  const daysInTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInTarget));
  return d;
};

const addYearsSafe = (dateObj, years) => {
  const d = new Date(dateObj);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

const formatTimeRange = (start, end) => {
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleTimeString('ar-EG', opts)} - ${end.toLocaleTimeString('ar-EG', opts)}`;
};

exports.getBookingPage = async (req, res) => {
  const selectedSpaceId = req.query.space || req.query.space_id || null;
  try {
    let spaces = [];

    if (selectedSpaceId) {
      const space = await Space.findByPk(selectedSpaceId, {
        attributes: ['id', 'name', 'rental_type', 'price_per_day', 'price_per_block', 'price_per_month', 'price_per_year', 'min_months', 'min_years', 'block_hours', 'work_start', 'work_end', 'availability_start', 'availability_end']
      });
      if (space) {
        spaces = [space];
      } else {
        return res.status(404).render('booking/booking', {
          title: 'الحجز',
          spaces: [],
          errorMessage: 'المساحة المطلوبة غير موجودة',
          lang: 'ar',
          active: 'booking',
          selectedSpaceId: null
        });
      }
    } else {
      spaces = await Space.findAll({
        attributes: ['id', 'name', 'rental_type', 'price_per_day', 'price_per_block', 'price_per_month', 'price_per_year', 'min_months', 'min_years', 'block_hours', 'work_start', 'work_end', 'availability_start', 'availability_end'],
        order: [['rental_type', 'ASC'], ['name', 'ASC']]
      });
    }

    res.render('booking/booking', { title: 'الحجز', spaces, lang: 'ar', active: 'booking', selectedSpaceId: selectedSpaceId || null });
  } catch (err) {
    console.error('getBookingPage error:', err);
    res.status(500).render('booking/booking', { title: 'الحجز', spaces: [], errorMessage: 'تعذر تحميل المساحات', lang: 'ar', active: 'booking', selectedSpaceId: null });
  }
};

exports.getAvailability = async (req, res) => {
  const { space_id, type = 'daily', date } = req.query;
  if (!space_id) return res.status(400).json({ message: 'space_id مطلوب' });

  try {
    const space = await Space.findByPk(space_id);
    if (!space) return res.status(404).json({ message: 'المساحة غير موجودة' });

    const requesterId = req.session?.user?.id;
    if (requesterId && space.user_id === requesterId) {
      return res.status(403).json({ message: 'لا يمكنك حجز إعلانك الخاص' });
    }

    if (['monthly', 'yearly'].includes(space.rental_type)) {
      return res.status(200).json({
        space_id: space.id,
        rental_type: space.rental_type,
        message: 'التوفر الشهري/السنوي يُحسب عند اختيار المدة، وسيتم التأكد منه أثناء إنشاء الحجز'
      });
    }

    const blockHours = Number(space.block_hours || 1);

    if (type === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const windowStart = space.availability_start ? new Date(space.availability_start) : today;
      windowStart.setHours(0, 0, 0, 0);

      const windowEnd = space.availability_end ? new Date(space.availability_end) : new Date(windowStart.getTime() + 60 * 24 * 60 * 60 * 1000);
      windowEnd.setHours(0, 0, 0, 0);

      const bookings = await Booking.findAll({
        where: {
          space_id,
          status: { [Op.in]: ['confirmed', 'completed'] },
          start_time: { [Op.lt]: new Date(windowEnd.getTime() + 24 * 60 * 60 * 1000) },
          end_time: { [Op.gt]: windowStart }
        },
        attributes: ['start_time', 'end_time']
      });

      const busyRanges = bookings.map(b => ({ start: new Date(b.start_time), end: new Date(b.end_time) }));

      const availableDays = [];
      const cursor = new Date(windowStart);
      const maxDays = 90; // safety cap
      while (cursor <= windowEnd && availableDays.length < maxDays) {
        const dayStart = new Date(cursor);
        const dayEnd = new Date(cursor);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const hasConflict = busyRanges.some(r => r.start < dayEnd && r.end > dayStart);
        availableDays.push({
          date: dayStart.toISOString().slice(0, 10),
          label: formatDayLabel(dayStart),
          available: !hasConflict
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      return res.json({
        space_id: space.id,
        rental_type: space.rental_type,
        type: 'daily',
        block_hours: blockHours,
        availableDays,
        window: {
          from: windowStart.toISOString().slice(0, 10),
          to: windowEnd.toISOString().slice(0, 10)
        }
      });
    }

    const targetDate = (date || new Date().toISOString().slice(0, 10)).substring(0, 10);
    const workStartStr = space.work_start || '08:00';
    const workEndStr = space.work_end || '22:00';
    const workStart = combineDateTime(targetDate, workStartStr);
    let workEnd = combineDateTime(targetDate, workEndStr);
    if (workEnd <= workStart) {
      workEnd.setDate(workEnd.getDate() + 1); // prevent inverted ranges
    }

    const bookings = await Booking.findAll({
      where: {
        space_id,
        status: { [Op.in]: ['confirmed', 'completed'] },
        start_time: { [Op.lt]: workEnd },
        end_time: { [Op.gt]: workStart }
      },
      attributes: ['start_time', 'end_time']
    });

    const availableBlocks = [];
    const busy = bookings.map(b => ({ start: new Date(b.start_time), end: new Date(b.end_time) }));
    let cursor = new Date(workStart);
    const safeLimit = 120; // prevent infinite loops if block_hours is tiny

    for (let i = 0; i < safeLimit && cursor < workEnd; i++) {
      const slotEnd = new Date(cursor.getTime() + blockHours * 60 * 60 * 1000);
      if (slotEnd > workEnd) break;
      const overlaps = busy.some(r => r.start < slotEnd && r.end > cursor);
      if (!overlaps) {
        availableBlocks.push({
          start: cursor.toISOString(),
          end: slotEnd.toISOString(),
          label: formatTimeRange(cursor, slotEnd)
        });
      }
      cursor = slotEnd;
    }

    return res.json({
      space_id: space.id,
      rental_type: space.rental_type,
      type: 'hourly',
      date: targetDate,
      block_hours: blockHours,
      availableBlocks,
      work_window: { start: workStart.toISOString(), end: workEnd.toISOString() }
    });
  } catch (err) {
    console.error('getAvailability error:', err);
    return res.status(500).json({ message: 'تعذر جلب التوفر' });
  }
};

exports.getPaymentPage = async (req, res) => {
  const { id } = req.params;
  if (!req.session.user) return res.redirect('/auth/login');

  try {
    const booking = await Booking.findOne({
      where: { id, user_id: req.session.user.id },
      include: [{ model: Space, attributes: ['name'] }]
    });

    if (!booking || booking.status !== 'pending') {
      return res.status(404).render('booking/payment', {
        title: 'الدفع',
        lang: 'ar',
        active: 'booking',
        errorMessage: 'الحجز غير موجود أو غير قابل للدفع حالياً',
        booking: null
      });
    }

    res.render('booking/payment', { title: 'الدفع', booking, lang: 'ar', active: 'booking' });
  } catch (err) {
    console.error('getPaymentPage error:', err);
    res.status(500).render('booking/payment', { title: 'الدفع', errorMessage: 'تعذر تحميل صفحة الدفع', booking: null, lang: 'ar', active: 'booking' });
  }
};

exports.createBooking = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول للحجز' });
  }

  const { space_id, start_time, end_time, duration_months, duration_years } = req.body;

  if (!space_id || !start_time) {
    return res.status(400).json({ message: 'الحقول مطلوبة: space_id, start_time' });
  }

  const start = new Date(start_time);
  if (isNaN(start)) {
    return res.status(400).json({ message: 'تاريخ البداية غير صالح' });
  }

  try {
    const space = await Space.findByPk(space_id);
    if (!space) return res.status(404).json({ message: 'المساحة غير موجودة' });

    if (space.user_id === req.session.user.id) {
      return res.status(403).json({ message: 'لا يمكنك حجز إعلانك الخاص' });
    }

    const blockHours = Number(space.block_hours || 1);
    const rental = space.rental_type;
    let end;

    // Validate per rental type and normalize start/end boundaries
    if (rental === 'hourly') {
      if (!end_time) return res.status(400).json({ message: 'وقت النهاية مطلوب للحجز بالساعات' });
      end = new Date(end_time);
      if (isNaN(end) || start >= end) return res.status(400).json({ message: 'الوقت غير صالح' });

      // Compare by local calendar day to avoid UTC date shifts
      const sameDay =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate();
      if (!sameDay) return res.status(400).json({ message: 'حجز الساعات ليوم واحد فقط' });

      // Snap end to full blocks to align with the defined block_hours
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const blocks = Math.max(1, Math.ceil(hours / blockHours));
      end.setTime(start.getTime() + blocks * blockHours * 60 * 60 * 1000);
    } else if (rental === 'daily') {
      if (!end_time) return res.status(400).json({ message: 'تاريخ النهاية مطلوب للحجز اليومي' });
      end = new Date(end_time);
      if (isNaN(end) || start > end) return res.status(400).json({ message: 'الفترة غير صالحة' });
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 0, 0);
    } else if (rental === 'monthly') {
      const months = Math.max(space.min_months || 1, parseInt(duration_months || '1', 10) || 1);
      start.setHours(0, 0, 0, 0);
      const boundary = addMonthsSafe(start, months);
      end = new Date(boundary);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 0, 0);
    } else if (rental === 'yearly') {
      const years = Math.max(space.min_years || 1, parseInt(duration_years || '1', 10) || 1);
      start.setHours(0, 0, 0, 0);
      const boundary = addYearsSafe(start, years);
      end = new Date(boundary);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 0, 0);
    } else {
      return res.status(400).json({ message: 'نوع الإيجار غير مدعوم' });
    }

    // تعارض المواعيد مع حجوزات مؤكدة/مكتملة
    const conflict = await Booking.findOne({
      where: {
        space_id,
        status: { [Op.in]: ['confirmed', 'completed'] },
        start_time: { [Op.lt]: end },
        end_time: { [Op.gt]: start }
      }
    });
    if (conflict) {
      return res.status(409).json({ message: 'يوجد تعارض مع حجز آخر' });
    }

    // حساب السعر
    let total = 0;
    if (rental === 'daily') {
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days < 1) return res.status(400).json({ message: 'يوم واحد على الأقل' });
      total = (space.price_per_day || 0) * days;
    } else if (rental === 'hourly') {
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      const blocks = Math.max(1, Math.ceil(hours / blockHours));
      total = (space.price_per_block || 0) * blocks;
    } else if (rental === 'monthly') {
      const months = Math.max(space.min_months || 1, parseInt(duration_months || '1', 10) || 1);
      if (!space.price_per_month) return res.status(400).json({ message: 'السعر الشهري غير محدد' });
      total = months * Number(space.price_per_month);
    } else if (rental === 'yearly') {
      const years = Math.max(space.min_years || 1, parseInt(duration_years || '1', 10) || 1);
      if (!space.price_per_year) return res.status(400).json({ message: 'السعر السنوي غير محدد' });
      total = years * Number(space.price_per_year);
    }

    const booking = await Booking.create({
      user_id: req.session.user.id,
      space_id,
      start_time: start,
      end_time: end,
      total_price: total,
      status: 'pending'
    });

    return res.status(201).json({ message: 'تم إنشاء الحجز', id: booking.id });
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحجز' });
  }
};

exports.submitPayment = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
  const { id } = req.params;
  const { payment_method, card_holder } = req.body;

  try {
    const booking = await Booking.findOne({
      where: { id, user_id: req.session.user.id },
      include: [Space]
    });
    if (!booking || booking.status !== 'pending') {
      return res.status(404).json({ message: 'الحجز غير موجود أو غير قابل للدفع' });
    }

    const txn = `TX-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    await Payment.create({
      booking_id: booking.id,
      amount: booking.total_price,
      payment_method: payment_method || 'card',
      transaction_id: txn,
      status: 'paid'
    });

    booking.status = 'confirmed';
    await booking.save();

    return res.status(200).json({ message: 'تم الدفع وتأكيد الحجز', booking_id: booking.id });
  } catch (err) {
    console.error('submitPayment error:', err);
    return res.status(500).json({ message: 'تعذر تنفيذ الدفع' });
  }
};

exports.printBooking = async (req, res) => {
  const { id } = req.params;
  if (!req.session.user) return res.redirect('/auth/login');

  try {
    const booking = await Booking.findOne({
      where: { id, user_id: req.session.user.id },
      include: [
        { model: Space, attributes: ['name', 'city_id', 'rental_type', 'price_per_day', 'price_per_block', 'block_hours'] },
        { model: Payment, attributes: ['amount', 'payment_method', 'transaction_id', 'status', 'created_at'] }
      ]
    });

    if (!booking) {
      return res.status(404).render('booking/print-booking', {
        title: 'فاتورة الحجز',
        booking: null,
        lang: 'ar',
        user: req.session.user || null,
        active: 'booking'
      });
    }

    res.render('booking/print-booking', {
      title: 'فاتورة الحجز',
      booking,
      lang: 'ar',
      user: req.session.user || null,
      active: 'booking'
    });
  } catch (err) {
    console.error('printBooking error:', err);
    res.status(500).render('booking/print-booking', {
      title: 'فاتورة الحجز',
      booking: null,
      lang: 'ar',
      user: req.session.user || null,
      active: 'booking',
      errorMessage: 'تعذر تحميل الفاتورة'
    });
  }
};
