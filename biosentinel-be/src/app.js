const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
<<<<<<< HEAD
=======

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
>>>>>>> bec09e0 (feat(user): implement user management system, face descriptor storage, multer upload architecture, and protected user routes)

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
<<<<<<< HEAD
=======

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
>>>>>>> bec09e0 (feat(user): implement user management system, face descriptor storage, multer upload architecture, and protected user routes)

app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'BioSentinel-AI Backend Running'
  });
});

module.exports = app; 