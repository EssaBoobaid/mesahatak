const { Op } = require('sequelize');
const { Space, City, SpaceImage, Review, User } = require('../models');
const { Category, Subcategory } = require('../models');

exports.getAddSpaceForm = async (req, res) => {
  try {
    const [cities, categories, subcategories] = await Promise.all([
      City.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
      Category.findAll({ attributes: ['id', 'code', 'name_ar', 'name_en'], order: [['id', 'ASC']] }),
      Subcategory.findAll({ attributes: ['id', 'category_id', 'value', 'name_ar', 'name_en'] })
    ]);

    const subsByCat = subcategories.reduce((acc, sub) => {
      acc[sub.category_id] = acc[sub.category_id] || [];
      acc[sub.category_id].push(sub);
      return acc;
    }, {});

    res.render('dashboard/add-space', {
      title: 'إضافة مساحة',
      cities,
      categories,
      subsByCat,
      old: {},
      errors: [],
      submitted: false,
      lang: req.query.lang === 'en' ? 'en' : 'ar'
    });
  } catch (err) {
    console.error('getAddSpaceForm error:', err);
    res.status(500).render('dashboard/add-space', {
      title: 'إضافة مساحة',
      cities: [],
      categories: [],
      subsByCat: {},
      old: {},
      errors: ['تعذر تحميل بيانات النموذج'],
      submitted: false,
      lang: req.query.lang === 'en' ? 'en' : 'ar'
    });
  }
};

exports.listSpaces = async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'ar';
  const filters = {
    city: req.query.city || '',
    category: req.query.category || '',
    subcategory: req.query.subcategory || '',
    rentalType: req.query.rentalType || '',
    q: req.query.q || ''
  };

  try {
    const whereClause = {};

    if (filters.city) whereClause.city_id = filters.city;
    if (filters.category) whereClause.category = filters.category;
    if (filters.subcategory) whereClause.subcategory = filters.subcategory;
    if (filters.rentalType) whereClause.rental_type = filters.rentalType;
    if (filters.q) {
      const term = `%${filters.q.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: term } },
        { description: { [Op.like]: term } }
      ];
    }

    const [spaces, cities, categories, subcategories] = await Promise.all([
      Space.findAll({
        where: whereClause,
        include: [
          { model: City, attributes: ['name'] },
          { model: User, attributes: ['id', 'full_name'] },
          {
            model: SpaceImage,
            as: 'images',
            attributes: ['file_path'],
            separate: true,
            limit: 1,
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
          }
        ],
        order: [['created_at', 'DESC']]
      }),
      City.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
      Category.findAll({ attributes: ['id', 'code', 'name_ar', 'name_en'], order: [['id', 'ASC']] }),
      Subcategory.findAll({ attributes: ['id', 'category_id', 'value', 'name_ar', 'name_en'] })
    ]);

    const subsByCat = subcategories.reduce((acc, sub) => {
      acc[sub.category_id] = acc[sub.category_id] || [];
      acc[sub.category_id].push(sub);
      return acc;
    }, {});

    res.render('spaces/browse', {
      title: lang === 'en' ? 'Spaces' : 'المساحات',
      spaces,
      cities,
      categories,
      subsByCat,
      filters,
      lang,
      active: 'spaces'
    });
  } catch (err) {
    console.error('listSpaces error:', err);
    res.status(500).render('spaces/browse', {
      title: lang === 'en' ? 'Spaces' : 'المساحات',
      spaces: [],
      cities: [],
      categories: [],
      subsByCat: {},
      filters,
      lang,
      active: 'spaces',
      errorMessage: 'تعذر تحميل المساحات حالياً'
    });
  }
};

exports.getSpaceDetails = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang === 'en' ? 'en' : 'ar';
  try {
    const space = await Space.findByPk(id, {
      include: [
        { model: City, attributes: ['name'] },
        { model: User, attributes: ['full_name', 'email'] },
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['file_path', 'sort_order'],
          separate: true,
          order: [['sort_order', 'ASC'], ['id', 'ASC']]
        }
      ]
    });

    if (!space) {
      return res.status(404).render('spaces/space-details', {
        title: 'Space Details',
        errorMessage: 'المساحة غير موجودة',
        space: null,
        lang,
        active: 'spaces'
      });
    }

    // Reviews سيتم تفعيلها لاحقاً؛ نحضّر حقل فارغ لتجنب أخطاء العرض
    space.Reviews = [];

    res.render('spaces/space-details', { title: space.name, space, lang, active: 'spaces' });
  } catch (err) {
    console.error('getSpaceDetails error:', err);
    res.status(500).render('spaces/space-details', {
      title: 'Space Details',
      errorMessage: 'حدث خطأ أثناء جلب بيانات المساحة',
      space: null,
      lang,
      active: 'spaces'
    });
  }
};

exports.createSpace = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).render('dashboard/add-space', {
      title: 'إضافة مساحة',
      errors: ['يجب تسجيل الدخول لإضافة مساحة'],
      submitted: false,
      old: req.body,
      cities: [],
      categories: [],
      subsByCat: {},
      lang: req.query.lang === 'en' ? 'en' : 'ar'
    });
  }

  const lang = req.query.lang === 'en' ? 'en' : 'ar';
  const {
    name,
    city_id,
    category,
    subcategory,
    category_other,
    google_maps_url,
    rental_type,
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

  const errors = [];
  if (!name) errors.push('اسم المساحة مطلوب');
  if (!city_id) errors.push('المدينة مطلوبة');
  if (!category) errors.push('الفئة مطلوبة');
  if (category === 'other' && !category_other) errors.push('اذكر نوع المساحة للأخرى');
  if (!rental_type) errors.push('نوع الإيجار مطلوب');
  if (rental_type === 'daily' && !price_per_day) errors.push('السعر اليومي مطلوب');
  if (rental_type === 'hourly') {
    if (!price_per_block) errors.push('السعر لكل فترة مطلوب');
    if (!block_hours) errors.push('مدة كل حجز مطلوبة');
    if (!work_start || !work_end) errors.push('أوقات العمل مطلوبة');
  }
  if (rental_type === 'monthly') {
    if (!price_per_month) errors.push('السعر الشهري مطلوب');
    const parsed = parseInt(min_months || '1', 10);
    if (!parsed || parsed < 1) errors.push('أقل مدة بالأشهر يجب ألا تقل عن 1');
  }
  if (rental_type === 'yearly') {
    if (!price_per_year) errors.push('السعر السنوي مطلوب');
    const parsed = parseInt(min_years || '1', 10);
    if (!parsed || parsed < 1) errors.push('أقل مدة بالسنوات يجب ألا تقل عن 1');
  }
  if (!description) errors.push('الوصف مطلوب');
  if (!content) errors.push('المحتوى مطلوب');

  const [cities, categories, subcategories] = await Promise.all([
    City.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
    Category.findAll({ attributes: ['id', 'code', 'name_ar', 'name_en'], order: [['id', 'ASC']] }),
    Subcategory.findAll({ attributes: ['id', 'category_id', 'value', 'name_ar', 'name_en'] })
  ]);
  const subsByCat = subcategories.reduce((acc, sub) => {
    acc[sub.category_id] = acc[sub.category_id] || [];
    acc[sub.category_id].push(sub);
    return acc;
  }, {});

  if (errors.length) {
    return res.status(400).render('dashboard/add-space', {
      title: 'إضافة مساحة',
      errors,
      submitted: false,
      old: req.body,
      cities,
      categories,
      subsByCat,
      lang
    });
  }

  try {
    const normalizedMinMonths = rental_type === 'monthly' ? Math.max(1, parseInt(min_months || '1', 10) || 1) : null;
    const normalizedMinYears = rental_type === 'yearly' ? Math.max(1, parseInt(min_years || '1', 10) || 1) : null;

    const space = await Space.create({
      user_id: req.session.user.id,
      name,
      city_id,
      category,
      subcategory,
      category_other: category === 'other' ? category_other : null,
      google_maps_url,
      rental_type,
      price_per_day: rental_type === 'daily' ? price_per_day || null : null,
      price_per_block: rental_type === 'hourly' ? price_per_block || null : null,
      price_per_month: rental_type === 'monthly' ? price_per_month || null : null,
      price_per_year: rental_type === 'yearly' ? price_per_year || null : null,
      min_months: normalizedMinMonths,
      min_years: normalizedMinYears,
      block_hours: rental_type === 'hourly' ? block_hours || null : null,
      work_start: rental_type === 'hourly' ? work_start || null : null,
      work_end: rental_type === 'hourly' ? work_end || null : null,
      availability_start: availability_start || null,
      availability_end: availability_end || null,
      description,
      content
    });

    if (req.files && req.files.length) {
      const imageRows = req.files.map((file, idx) => ({
        space_id: space.id,
        file_path: `/uploads/spaces/${file.filename}`,
        sort_order: idx
      }));
      await SpaceImage.bulkCreate(imageRows);
    }

    return res.status(201).render('dashboard/add-space', {
      title: 'إضافة مساحة',
      errors: [],
      submitted: true,
      old: {},
      cities,
      categories,
      subsByCat,
      lang,
      spaceId: space.id
    });
  } catch (err) {
    console.error('createSpace error:', err);
    return res.status(500).render('dashboard/add-space', {
      title: 'إضافة مساحة',
      errors: ['حدث خطأ أثناء إنشاء المساحة'],
      submitted: false,
      old: req.body,
      cities,
      categories,
      subsByCat,
      lang
    });
  }
};
