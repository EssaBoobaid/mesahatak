const { Review, Space, Booking, User } = require('../models');
const { Op } = require('sequelize');

exports.getReviewPage = async (req, res) => {
  try {
    const { booking_id, space_id } = req.query;
    const reviews = await Review.findAll({
      include: [
        { model: Space, attributes: ['name'] },
        { model: User, attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });
    res.render('reviews/review', {
      title: 'Reviews',
      reviews,
      bookingId: booking_id || '',
      spaceId: space_id || ''
    });
  } catch (err) {
    console.error('getReviewPage error:', err);
    res.status(500).render('reviews/review', {
      title: 'Reviews',
      reviews: [],
      errorMessage: 'تعذر تحميل المراجعات',
      bookingId: '',
      spaceId: ''
    });
  }
};

exports.getUserReviewPage = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.session.user.id },
      include: [{ model: Space, attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    res.render('reviews/user-review', { title: 'My Reviews', reviews });
  } catch (err) {
    console.error('getUserReviewPage error:', err);
    res.status(500).render('reviews/user-review', { title: 'My Reviews', reviews: [], errorMessage: 'تعذر تحميل مراجعاتك' });
  }
};

exports.createReview = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول لإضافة مراجعة' });
  }

  const { booking_id, space_id, rating, comment } = req.body;
  const wantsJson = (req.headers['content-type'] || '').includes('application/json') || (req.headers.accept || '').includes('application/json');

  if (!space_id || !rating || !booking_id) {
    const msg = 'booking_id و space_id و rating مطلوبة';
    return wantsJson ? res.status(400).json({ message: msg }) : res.status(400).send(msg);
  }

  try {
    const existing = await Review.findOne({
      where: { booking_id, user_id: req.session.user.id }
    });
    if (existing) {
      const msg = 'تم إرسال تقييم لهذا الحجز مسبقاً';
      return wantsJson ? res.status(409).json({ message: msg }) : res.status(409).send(msg);
    }

    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        user_id: req.session.user.id,
        space_id
      }
    });

    if (!booking) {
      const msg = 'لا يمكن التقييم إلا على حجز يخصك';
      return wantsJson ? res.status(403).json({ message: msg }) : res.status(403).send(msg);
    }

    const review = await Review.create({
      user_id: req.session.user.id,
      booking_id,
      space_id,
      rating,
      comment: comment || null
    });

    if (wantsJson) {
      return res.status(201).json({ message: 'تمت إضافة المراجعة', id: review.id });
    }
    return res.redirect('/reviews/mine');
  } catch (err) {
    console.error('createReview error:', err);
    const msg = 'حدث خطأ أثناء إضافة المراجعة';
    return wantsJson ? res.status(500).json({ message: msg }) : res.status(500).send(msg);
  }
};
