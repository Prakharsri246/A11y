const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Serve static files (axe.min.js)
app.use('/axe', express.static(path.join(__dirname, 'public')));

// Default root route
app.get('/', (req, res) => {
  res.send('✅ A11y Scanner API is up and running.');
});

// API route
const scannerRoute = require('../routes/index.js');
app.use('/api', scannerRoute);

app.listen(PORT, () => {
  console.log(`🚀 A11y Scanner API is running at http://localhost:${PORT}`);
});