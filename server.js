require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const { connectDB } = require('./config/db');
const { seedStaticData } = require('./seeds/staticSeed');

const authRoutes = require('./routes/authRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Respect proxy headers in production (for HTTPS behind Nginx/Passenger)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (simple in-memory; switch to store for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key_change_me',
  resave: false,
  saveUninitialized: false,
  rolling: true, // refresh expiry on each request
  name: 'sid',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 أيام
  }
}));

// Expose user to templates
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/spaces', spaceRoutes);
app.use('/booking', bookingRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reviews', reviewRoutes);
app.use('/admin', adminRoutes);

// Convenience alias so /profile works in addition to /auth/profile
app.get('/profile', (req, res) => res.redirect('/auth/profile'));

// Landing page
app.get(['/','/index'], (req, res) => {
  res.render('index', { title: 'مساحاتك - الرئيسية', lang: 'ar' });
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();

    // Seed static data (idempotent)
    await seedStaticData();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
