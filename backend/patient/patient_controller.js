const Patient = require('./patient_model');
const Doctor = require('../doctor/doctor_model');
const Appointment = require('../appointments/appointment_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Prescription = require('../prescription/prescription_model')
const Notification = require('../notifications/notifications_model')
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { staff_email } = require('../EmailExport');
const crypto = require('crypto');
//For Email


// Generate and send OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'testotpsender@gmail.com',
      pass: 'vqbi dqjv oupi qndp'
  }
});
// Generate and send OTP
const sendOTP = async (req, res) => {
  try {
      const patient = await Patient.findOne({ patient_email: req.body.email });
      if (!patient) {
          return res.status(404).send('Patient not found');
      }

      const otp = speakeasy.totp({
          secret: patient.twoFactorSecret,
          encoding: 'base32'
      });

      patient.otp = otp;
      patient.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      await patient.save();

      // Send OTP email
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: patient.patient_email,
          subject: 'Your OTP Code',
          text: `Your OTP code is ${otp}`
      };

       transporter.sendMail(mailOptions);

      res.status(200).send('OTP sent');
  } catch (error) {
      res.status(500).send('Error sending OTP');
  }
};
// Verify OTP
const verifyOTP = async (req, res) => {
  try {
      const patient = await Patient.findOne({ patient_email: req.body.email });
      if (!patient) {
          return res.status(404).send('Patient not found');
      }

      if (patient.otp !== req.body.otp || new Date() > patient.otpExpires) {
          return res.status(400).send('Invalid or expired OTP');
      }

      // Clear OTP fields after successful verification
      patient.otp = undefined;
      patient.otpExpires = undefined;
      await patient.save();

      res.status(200).send('OTP verified');
  } catch (error) {
      res.status(500).send('Error verifying OTP');
  }
};
// Setup Two-Factor Function Authenticator
const setupTwoFactor = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    let secret;
    if (!patient.twoFactorSecret || req.body.regenerate) {
      // Generate a new secret key if the patient does not have one or if regenerate flag is true
      secret = speakeasy.generateSecret({ length: 30 });
      patient.twoFactorSecret = secret.base32;
      patient.twoFactorEnabled = true; // Enable 2FA for this patient
      await patient.save(); // Save the changes
    } else {
      // Use the existing secret key
      secret = { base32: patient.twoFactorSecret };
    }

    // Log the stored secret key for debugging
    console.log('Stored Secret in DB:', patient.twoFactorSecret);

    // Generate the QR code with the saved secret key using the method from the schema
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `Landagan Kids Clinic:${patient.patient_email}`,
      issuer: 'Landagan Kids Clinic',
      encoding: 'base32'
    });

    console.log('OTP Auth URL:', otpAuthUrl);

    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    console.log('Generated Secret:', secret.base32); // Log the secret

    res.json({ qrCode, secret: secret.base32 });
  } catch (error) {
    console.error('Error generating 2FA secret:', error); // Log the error
    res.status(500).json({ message: 'Error generating 2FA secret', error });
  }
};
// Verify Two-Factor Function
const verifyTwoFactor = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await Patient.findById(userId) || await Doctor.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    if (!token) {
      return res.status(400).json({ message: '2FA token is required' });
    }

    console.log(`Verifying token: ${token} for user ${userId}`);
    console.log(`Secret key: ${user.twoFactorSecret}`);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2 
    });
    console.log(`Verified: ${verified}`);
    if (verified) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    res.status(500).json({ message: 'Error verifying 2FA token', error });
  }
};

const NewPatientSignUp = async (req, res) => {
  const { patient_email, patient_password, ...otherFields } = req.body;

  try {
      const newPatient = new Patient({
          patient_email,
          patient_password,
          ...otherFields,
      });

      await newPatient.save();
      res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error registering patient', error });
  }
};


const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await Patient.findOne({ patient_email: email });

    if (!patient) {
      return res.status(404).json({ message: 'No patient with that email found' });
    }

    const isMatch = await bcrypt.compare(password, patient.patient_password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Exclude sensitive information before sending
    const patientData = {
      _id: patient._id,
      patient_email: patient.patient_email,
      patient_firstName: patient.patient_firstName,
      patient_lastName: patient.patient_lastName,
      // Include other necessary fields
    };

    res.json({
      message: 'Successfully logged in',
      patientId: patient._id,
      patientData: patientData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const updatePatientStatus = async (req, res) => {
  try {
      const { pid } = req.params;
      const updatedStatus = req.body.accountStatus;

      const patient = await Patient.findById(pid);
      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      patient.accountStatus = updatedStatus;
      await patient.save(); // Save triggers the pre-save hook for validation

      res.json({ status: 'success', message: 'Account status updated successfully' });
  } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
  }
};


const changePatientPassword = async (req, res) => {
  const { pid } = req.params;
  const { newPassword } = req.body;

  try {
    const patient = await Patient.findById(pid);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Directly storing the new password without hashing
    patient.patient_password = newPassword;
    await patient.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error });
  }
};



const updatePatientInfo = async (req, res) => {
  try {
      const { pid } = req.params;
      const updatedInfo = req.body;

      const patient = await Patient.findById(pid);
      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if the last update was less than 30 days ago
      const lastUpdate = new Date(patient.updatedAt);
      const now = new Date();
      const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastUpdate < 30) {
          return res.status(400).json({ message: 'You can only update your information every 30 days.' });
      }

      // Update the patient information
      patient.patient_firstName = updatedInfo.patient_firstName || patient.patient_firstName;
      patient.patient_lastName = updatedInfo.patient_lastName || patient.patient_lastName;
      patient.patient_middleInitial = updatedInfo.patient_middleInitial || patient.patient_middleInitial;
      patient.patient_contactNumber = updatedInfo.patient_contactNumber || patient.patient_contactNumber;

      await patient.save();
      res.json({ success: true, message: 'Information updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error updating patient information', error });
  }
};



const createUnregisteredPatient = async (req, res) => {
  const { patient_email, accountStatus, ...rest } = req.body;

  // Include accountStatus and conditionally include patient_email
  const patientData = accountStatus === 'Unregistered'
    ? { ...rest, accountStatus }
    : { ...rest, patient_email, accountStatus };

  try {
      const newPatient = await Patient.create(patientData);
      res.json({ newPatient, status: "Successfully registered Patient." });
  } catch (err) {
      res.status(400).json({ message: 'Something went wrong. Please try again.', error: err });
  }
};

const findAllPatient = (req, res) => {
    Patient.find()
    .populate('patient_appointments')
    .then((allDataPatient) => {
      res.json({ thePatient: allDataPatient })
  })
  .catch((err) => {
      res.json({ message: 'Something went wrong', error: err })
  });
}


//getPatient
const findPatientById = (req, res) => {
  Patient.findOne({ _id: req.params.uid })
  .populate({
    path: 'patient_appointments',
    populate: [
      {
        path: 'doctor',
        model: 'Doctor'
      },
      {
        path: 'laboratoryResults',
        model: 'Laboratory'
      },
      {
        path: 'prescription',
        model: 'Prescription',
        populate: {
          path: 'doctor',
          model: 'Doctor'
        }
      },
      {
        path: 'payment',
        model: 'Payment'
      },
    ]
  })
  .populate({
    path: 'notifications',
    model: 'Notification'
  })
  .populate({
    path: 'prescriptions',
    model: 'Prescription'
  })
  .populate({
    path: 'immunizations',
    model: 'Immunization',
    populate :[
      {
        path: 'administeredBy',
        model: 'Doctor'
      }
      
    ]
  })
  .populate({
    path: 'patient_findings',
    model: 'Findings',
    populate: [
      {
        path: 'doctor',
        model: 'Doctor'
      },
      {
        path: 'appointment',
        model: 'Appointment'
      }
    ]
  })
  .populate('laboratoryResults')


    .then((thePatient) => {
      if (!thePatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      res.json({ thePatient });
    })
    .catch((err) => {
      console.error('Error finding patient by ID:', err);
      res.status(500).json({ message: 'Something went wrong', error: err });
    });
};



const findPatientByEmail = (req, res) => {
  Patient.findOne({email:req.params.email})
      .then((thePatient) => {
          res.json({theEmail : thePatient})
      })
      .catch((err) => {
          res.json({ message: 'Something went wrong', error: err })
      });
}







const bookedSlots = async (req, res) => {
  try {
      const { doctorId } = req.params;
      const { date } = req.query;

      // Check doctors active appointment status
      const doctor = await Doctor.findById(doctorId).select('activeAppointmentStatus');
      if (!doctor.activeAppointmentStatus) {
          return res.status(400).json({ message: 'Doctor is not available for appointments.' });
      }

      const bookedSlots = await Appointment.find({ doctor: doctorId, date: new Date(date), status: { $ne: 'Cancelled' } }).select('time -_id');
      res.status(200).json({ bookedSlots: bookedSlots.map(slot => slot.time) });
  } catch (error) {
      console.error(error); // Log the error details
      res.status(400).json({ message: error.message });
  }
};



const cancelAppointment = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const appointmentId = req.params.uid; // Appointment ID from URL parameter

    // Find the appointment and update its cancelReason and status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { cancelReason: cancelReason, status: 'Cancelled' } }, // Update cancelReason and status
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePatientImage = async (req, res) => {
  try {
    const patientId = req.params.id;
    const imagePath = `images/${req.file.filename}`;  // Assuming the images are stored in an 'images' directory

    const updatedPatient = await Patient.findByIdAndUpdate(patientId, { patient_image: imagePath }, { new: true });

    res.json({ updatedPatient, message: 'Patient image updated successfully' });
  } catch (error) {
    console.error('Error updating patient image:', error);
    res.status(500).json({ message: 'Error updating patient image', error });
  }
};

// PatientController.js
const createPatientSession = (req, res) => {
  const { userId, role } = req.body;

  if (role === "Patient") {
      req.session.userId = userId;  // Store the user ID in the session
      req.session.role = role;      // Store the role to restrict session to patients
      
      // Log the session data in the backend console
      console.log('Session Data:', req.session);

      res.json({ message: "Session created successfully" });
  } else {
      res.status(403).json({ message: "Unauthorized role" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const patient = await Patient.findOne({ patient_email: email });

    if (!patient) {
      return res.status(404).json({ message: 'No patient with that email found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    patient.resetPasswordToken = token;
    patient.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    await patient.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: staff_email.user,
        pass: staff_email.pass,
      },
    });

    // Verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log("SMTP configuration error:", error);
      } else {
        console.log("Server is ready to send messages:", success);
      }
    });

    const resetLink = `http://localhost:3000/reset-password/patient/${token}`;
    const mailOptions = {
      to: patient.patient_email,
      from: staff_email.user,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested a password reset for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process within 30 minutes:\n\n` +
            `${resetLink}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ message: `An email has been sent to ${patient.patient_email} with further instructions.` });
      }
    });
  } catch (error) {
    console.error('Error in forgot password process:', error);
    res.status(500).json({ message: 'Error in forgot password process', error });
  }
};



  const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const patient = await Patient.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!patient) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Update password
        patient.patient_password = password;
        patient.resetPasswordToken = undefined;
        patient.resetPasswordExpires = undefined;

        await patient.save();

        res.json({ message: 'Password has been updated.' });
    } catch (error) {
        res.status(500).json({ message: 'Error in resetting password', error });
    }
};
module.exports = {
    NewPatientSignUp,
    findAllPatient,
    findPatientByEmail,
    updatePatientInfo,
    findPatientById,
    updatePatientStatus,
    changePatientPassword,
    cancelAppointment,
    setupTwoFactor,
    verifyTwoFactor,
    verifyOTP,
    sendOTP,
    bookedSlots,
    createUnregisteredPatient,
    updatePatientImage,
    createPatientSession,
    forgotPassword, resetPassword, loginPatient
}