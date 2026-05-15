const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const attendanceAutoAbsent = require('./cron/attendanceAutoAbsent');
const superAdminRoutes = require('./routes/superAdminRoutes');
const adminMonitoringRoutes = require('./routes/adminMonitoringRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');

const app = express();
attendanceAutoAbsent();

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
); 
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Attedance
app.use('/api/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// Super Admin
app.use('/api/super-admin', superAdminRoutes);

// Admin
app.use('/api/admin', adminMonitoringRoutes);
app.use('/api/admin', adminReportRoutes);

app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'BioSentinel-AI Backend Running'
  });
});

module.exports = app; 