const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
