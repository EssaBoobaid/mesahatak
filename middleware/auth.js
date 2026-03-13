function requireAuth(req, res, next) {
  if (!req.session?.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).render('auth/login', {
      title: 'Login',
      errorMessage: 'صلاحية غير كافية، حساب أدمن مطلوب.'
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
