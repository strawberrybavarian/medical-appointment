const bcrypt = require('bcryptjs');
const Doctors = require('../doctor/doctor_model');
const Patients = require('../patient/patient_model');
const DoctorService = require('../doctor/doctor_service');
const socket = require('../socket');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');

const unifiedLogin = async (req, res) => {
  const { email, password, rememberMe, role } = req.body;
  try {
    let user;
    if (role === 'Doctor') {
      user = await Doctors.findOne({ dr_email: email });
      if (!user) {
        return res.status(404).json({ message: 'No doctor with that email found' });
      }
      if (user.accountStatus === 'Review') {
        return res.status(403).json({ message: 'Your account is under review.' });
      }
      const match = await bcrypt.compare(password, user.dr_password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      req.session.user = {
        _id: user._id,
        email: user.dr_email,
        firstName: user.dr_firstName,
        lastName: user.dr_lastName,
        role: 'Doctor',
        passwordChanged: user.passwordChanged,
      };

      // Ensure the doctor's activity status is set to 'Online'
      user.activityStatus = 'Online';
      await user.save();
    } else if (role === 'Patient') {
      user = await Patients.findOne({ patient_email: email });
      if (!user) {
        return res.status(404).json({ message: 'No patient with that email found' });
      }
      const match = await bcrypt.compare(password, user.patient_password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      req.session.user = {
        _id: user._id,
        email: user.patient_email,
        firstName: user.patient_firstName,
        lastName: user.patient_lastName,
        role: 'Patient',
      };
    } else if (role === 'Medical Secretary') {
      user = await MedicalSecretary.findOne({ ms_email: email });
      if (!user) {
        return res.status(404).json({ message: 'No medical secretary with that email found' });
      }
      const match = await bcrypt.compare(password, user.ms_password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      req.session.user = {
        _id: user._id,
        email: user.ms_email,
        firstName: user.ms_firstName,
        lastName: user.ms_lastName,
        status: user.status,
        role: 'Medical Secretary',
      };
    } else if (role === 'Admin') {
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No admin with that email found' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      req.session.user = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        role: 'Admin',
      };
    } else {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    req.session.role = role;
    req.session.userId = user._id;

    // Handle "remember me" option
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
    }
    console.log('User logged in:', req.session.user);
    return res.json({
      message: 'Successfully logged in',
      user: req.session.user,
      role,
    });
  } catch (err) {
    console.error('Error in unifiedLogin:', err);
    return res.status(500).json({ message: 'Error logging in', error: err });
  }
};

// Check Session
const getSession = async (req, res) => {
  if (!req.session.userId || !req.session.role) {
    return res.status(401).json({ message: 'No active session' });
  }

  return res.json({
    user: req.session.user,
    role: req.session.role,
  });
};

// Logout
const unifiedLogout = async (req, res) => {
  try {
    if (!req.session || !req.session.role) {
      console.log('No active session found for logout');
      return res.status(401).json({ message: 'No active session found' });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      console.log('Session destroyed and cookie cleared');
      return res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Error in unifiedLogout:', error);
    res.status(500).json({ message: 'Error logging out', error });
  }
};

module.exports = {
  unifiedLogin,
  getSession,
  unifiedLogout,
};