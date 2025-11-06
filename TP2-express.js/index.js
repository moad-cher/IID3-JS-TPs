const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

// Passport config
require(path.join(__dirname, 'config', 'passport'))(passport);

const app = express();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/iid3-auth';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));

// Set view engine to pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Simple session-based messages (avoid extra dependencies like connect-flash)
app.use(function (req, res, next) {
  // read messages from session, expose to templates, then clear
  res.locals.success_msg = req.session.success_msg || null;
  res.locals.error_msg = req.session.error_msg || null;
  res.locals.error = req.session.error || null;
  res.locals.user = req.user || null;
  // clear after exposing
  delete req.session.success_msg;
  delete req.session.error_msg;
  delete req.session.error;
  next();
});

// Simple books list stored locally
const books = [
  { title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { title: '1984', author: 'George Orwell' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
];

// Models
const User = require(path.join(__dirname, 'models', 'User'));

// Ensure authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.session.error_msg = 'Please log in to view that resource';
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome', message: 'Pug + Passport + MongoDB demo' });
});

app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password && password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', { errors, name, email });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.session.error_msg = 'Email already registered';
      return res.redirect('/register');
    }

    // Hash password here (keep model simple)
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hash });
    await newUser.save();
    req.session.success_msg = 'You are now registered and can log in';
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.session.error_msg = 'Something went wrong';
    res.redirect('/register');
  }
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res, next) => {
  passport.authenticate('local', function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.session.error_msg = (info && info.message) || 'Invalid credentials';
      return res.redirect('/login');
    }
    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.redirect('/books');
    });
  })(req, res, next);
});

app.get('/books', ensureAuthenticated, (req, res) => {
  res.render('books', { books });
});

app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    req.session.success_msg = 'You are logged out';
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
