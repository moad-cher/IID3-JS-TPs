const express = require('express');
const path = require('path');

const app = express();

// Set view engine to pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Define a route
app.get('/', (req, res) => {
  res.render('home', { title: 'Hello from prj2', message: 'Pug is working!' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
