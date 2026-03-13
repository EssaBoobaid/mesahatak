const { Space, City, SpaceImage, Booking, Payment, Review, User } = require('../models');

exports.getRentPerformance = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const userId = req.session.user.id;
  try {
    const spaces = await Space.findAll({
      where: { user_id: userId },
      include: [
        { model: City, attributes: ['name'] },
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['file_path'],
          separate: true,
          limit: 1,
          order: [['sort_order', 'ASC'], ['id', 'ASC']]
        },
        {
          model: Booking,
          attributes: ['id', 'start_time', 'end_time', 'status', 'total_price'],
          include: [
            { model: User, attributes: ['full_name', 'phone'] },
            { model: Payment, attributes: ['amount', 'payment_method', 'transaction_id'] },
            { model: Review, attributes: ['rating', 'comment', 'created_at'], required: false }
          ],
          order: [['start_time', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const spacesData = spaces.map((space) => {
      const coverRaw = space.images?.[0]?.file_path || '/images/space-placeholder.jpg';
      const cover = coverRaw.startsWith('http') ? coverRaw : (coverRaw.startsWith('/') ? coverRaw : `/${coverRaw}`);
      const bookings = (space.Bookings || []).map((b) => {
        const nights = Math.max(1, Math.ceil((new Date(b.end_time) - new Date(b.start_time)) / (1000 * 60 * 60 * 24)));
        return {
          id: b.id,
          status: b.status,
          start_time: b.start_time,
          end_time: b.end_time,
          nights,
          total_price: b.total_price,
          payment: b.Payment,
          guest: b.User,
          review: b.Reviews?.[0] || null
        };
      });

      const revenue = bookings.reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);
      const completed = bookings.filter((b) => b.status === 'completed').length;
      const upcoming = bookings.filter((b) => new Date(b.start_time) > new Date()).length;

      return {
        id: space.id,
        name: space.name,
        city: space.City?.name || '—',
        rental_type: space.rental_type,
        cover,
        bookings,
        metrics: {
          total: bookings.length,
          completed,
          upcoming,
          revenue
        }
      };
    });

    res.render('dashboard/rent-performance', {
      title: 'أداء التأجير',
      spaces: spacesData,
      lang: 'ar',
      active: 'my-rent'
    });
  } catch (err) {
    console.error('getRentPerformance error:', err);
    res.status(500).render('dashboard/rent-performance', {
      title: 'أداء التأجير',
      spaces: [],
      errorMessage: 'تعذر تحميل بيانات الأداء',
      lang: 'ar',
      active: 'my-rent'
    });
  }
};
