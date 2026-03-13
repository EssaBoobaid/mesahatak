const bcrypt = require('bcryptjs');
const { User, City } = require('../models');

exports.getLogin = async (req, res) => {
  const errorMessage = req.query.error || null;
  const successMessage = req.query.success
    ? 'تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن'
    : null;

  res.render('auth/login', { title: 'Login', errorMessage, successMessage });
};

exports.getProfile = async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  try {
    const [user, cities] = await Promise.all([
      User.findByPk(req.session.user.id, {
        attributes: ['id', 'full_name', 'email', 'birth_date', 'phone', 'iban', 'city_id']
      }),
      City.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']] })
    ]);

    if (!user) return res.redirect('/auth/login');

    res.render('auth/profile', {
      title: 'الملف الشخصي',
      userProfile: user,
      cities,
      lang: 'ar',
      active: 'profile'
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).render('auth/profile', {
      title: 'الملف الشخصي',
      userProfile: null,
      cities: [],
      errorMessage: 'تعذر تحميل الملف الشخصي',
      lang: 'ar',
      active: 'profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'يجب تسجيل الدخول' });

  const { full_name, phone, city_id, birth_date, iban } = req.body;

  try {
    const user = await User.findByPk(req.session.user.id, {
      attributes: ['id', 'full_name', 'phone', 'city_id', 'birth_date', 'iban']
    });
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    if (!full_name) return res.status(400).json({ message: 'الاسم مطلوب' });

    if (city_id) {
      const city = await City.findByPk(city_id, { attributes: ['id'] });
      if (!city) return res.status(400).json({ message: 'المدينة غير موجودة' });
      user.city_id = city_id;
    } else {
      user.city_id = null;
    }

    user.full_name = full_name;
    user.phone = phone || null;
    user.birth_date = birth_date || null;
    user.iban = iban || null;

    await user.save();

    req.session.user.full_name = user.full_name;

    return res.json({ message: 'تم التحديث بنجاح' });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'تعذر تحديث البيانات حالياً' });
  }
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render('auth/login', {
      title: 'Login',
      errorMessage: 'الرجاء إدخال البريد وكلمة المرور'
    });
  }

  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'full_name', 'email', 'password_hash', 'role']
    });

    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errorMessage: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور'
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errorMessage: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور'
      });
    }

    // Set session user
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    // Redirect admins to admin panel
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('auth/login', {
      title: 'Login',
      errorMessage: 'حدث خطأ غير متوقع، حاول مجدداً لاحقاً'
    });
  }
};

exports.getRegister = async (req, res) => {
  try {
    const cities = await City.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']] });
    return res.render('auth/register', { title: 'إنشاء حساب', cities });
  } catch (err) {
    console.error('Fetch cities error:', err);
    return res.render('auth/register', { title: 'إنشاء حساب', cities: [], errorMessage: 'تعذر تحميل المدن' });
  }
};

exports.handleRegister = async (req, res) => {
  const {
    full_name,
    email,
    password,
    birth_date,
    phone,
    iban,
    city_id
  } = req.body;

  let cities = [];
  try {
    cities = await City.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']] });
  } catch (err) {
    console.error('Load cities error:', err);
  }

  const missing = [];
  if (!full_name) missing.push('الاسم الكامل');
  if (!email) missing.push('البريد');
  if (!password) missing.push('كلمة المرور');
  if (!birth_date) missing.push('تاريخ الميلاد');
  if (!phone) missing.push('رقم الجوال');
  if (!city_id) missing.push('المدينة');

  if (missing.length) {
    return res.status(400).render('auth/register', {
      title: 'إنشاء حساب',
      cities,
      errorMessage: `الحقول المطلوبة: ${missing.join('، ')}`
    });
  }

  if (password.length < 8) {
    return res.status(400).render('auth/register', {
      title: 'إنشاء حساب',
      cities,
      errorMessage: 'كلمة المرور يجب ألا تقل عن 8 أحرف'
    });
  }

  try {
    const city = await City.findByPk(city_id, { attributes: ['id'] });
    if (!city) {
      return res.status(400).render('auth/register', {
        title: 'إنشاء حساب',
        cities,
        errorMessage: 'المدينة غير موجودة'
      });
    }

    const existing = await User.findOne({ where: { email }, attributes: ['id'] });
    if (existing) {
      return res.status(409).render('auth/register', {
        title: 'إنشاء حساب',
        cities,
        errorMessage: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await User.create({
      full_name,
      email,
      password_hash,
      birth_date,
      phone,
      iban: iban || null,
      city_id,
      role: 'user'
    });

    return res.redirect('/auth/login?success=1');
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).render('auth/register', {
      title: 'إنشاء حساب',
      cities,
      errorMessage: 'حدث خطأ غير متوقع أثناء إنشاء الحساب، حاول مجدداً'
    });
  }
};

exports.handleLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
