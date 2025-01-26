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
const bcrypt = require('bcryptjs');
const { staff_email } = require('../EmailExport');
const crypto = require('crypto');
const Audit = require('../audit/audit_model')




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'testotpsender@gmail.com',
      pass: 'vqbi dqjv oupi qndp'
  }
});

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
    console.error("Error while saving patient:", error); // This will log the exact error to the server logs
    res.status(500).json({ message: 'Error registering patient', error });
  }
};
const loginPatient = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const patient = await Patient.findOne({ patient_email: email });

    if (!patient) {
      return res.status(404).json({ message: 'No patient with that email found' });
    }

    const isMatch = await bcrypt.compare(password, patient.patient_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Build patient data
    const patientData = {
      _id: patient._id,
      patient_email: patient.patient_email,
      patient_firstName: patient.patient_firstName,
      patient_lastName: patient.patient_lastName,
    };

    // Clear any doctor data from the session
    delete req.session.doctorId;
    delete req.session.doctor;

    // Set patient session data
    req.session.userId = patient._id;
    req.session.role = 'Patient';
    req.session.patient = patientData;

    // Set cookie expiration based on rememberMe
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      // If you want a shorter session for patients without rememberMe,
      // set a different maxAge or make it a session cookie
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
    }

    return res.json({
      message: 'Successfully logged in',
      patientData: patientData
    });
  } catch (error) {
    console.error('Error logging in patient:', error);
    return res.status(500).json({ message: 'Error logging in', error });
  }
};


const logoutPatient = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error clearing session:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      res.clearCookie('patient.sid', { path: '/', httpOnly: true, sameSite: 'strict' });
      res.json({ message: 'Logged out successfully' });
      console.log('Patient logged out');
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Failed to log out' });
  }
};

const getSessionData = async (req, res) => {
  try {
    // Check if a session exists
    if (!req.session || !req.session.userId || req.session.role !== 'Patient') {
      return res.status(401).json({ message: 'No active session found.' });
    }

    // Fetch the patient data stored in the session
    const patient = req.session.patient;
    if (!patient) {
      return res.status(401).json({ message: 'Session invalid or expired.' });
    }

    // Respond with the patient session data
    res.json({
      message: 'Session data retrieved successfully.',
      patient,
    });



    console.log('Session Get Data:', req.session);
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ message: 'Error fetching session data.', error });
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
  const { oldPassword, newPassword } = req.body;

  try {
    const patient = await Patient.findById(pid);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify the old password matches
    const isMatch = await bcrypt.compare(oldPassword, patient.patient_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Set the new password (the pre-save hook will automatically hash it)
    patient.patient_password = newPassword;

    // Save the patient, the pre-save hook will hash the new password
    await patient.save();

    // Respond to the client
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    // Handle error
    res.status(500).json({ message: 'Error updating password', error });
  }
};


const updatePatientInfo = async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedInfo = req.body;

    console.log("Received PID:", pid);
    console.log("Updated Info:", updatedInfo);

    const patient = await Patient.findById(pid);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if the last update was less than 30 days ago
    const lastUpdate = new Date(patient.lastProfileUpdate);
    const now = new Date();
    const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    console.log(`Days since last update: ${daysSinceLastUpdate}`);
    // Uncomment if you want to enforce the 30-day restriction
    // if (daysSinceLastUpdate < 30) {
    //   return res.status(400).json({ message: 'You can only update your information every 30 days.' });
    // }

    // Capture changes before updating
    const changes = [];

    if (updatedInfo.patient_firstName && updatedInfo.patient_firstName !== patient.patient_firstName) {
      changes.push(`First Name changed from "${patient.patient_firstName}" to "${updatedInfo.patient_firstName}"`);
    }
    if (updatedInfo.patient_lastName && updatedInfo.patient_lastName !== patient.patient_lastName) {
      changes.push(`Last Name changed from "${patient.patient_lastName}" to "${updatedInfo.patient_lastName}"`);
    }
    if (updatedInfo.patient_middleInitial && updatedInfo.patient_middleInitial !== patient.patient_middleInitial) {
      changes.push(`Middle Initial changed from "${patient.patient_middleInitial}" to "${updatedInfo.patient_middleInitial}"`);
    }
    if (updatedInfo.patient_contactNumber && updatedInfo.patient_contactNumber !== patient.patient_contactNumber) {
      changes.push(`Contact Number changed from "${patient.patient_contactNumber}" to "${updatedInfo.patient_contactNumber}"`);
    }
    if (updatedInfo.patient_email && updatedInfo.patient_email !== patient.patient_email) {
      changes.push(`Email changed from "${patient.patient_email}" to "${updatedInfo.patient_email}"`);
    }
    // Add other fields as necessary, ensuring they are optional

    // Update the patient information
    patient.patient_firstName = updatedInfo.patient_firstName || patient.patient_firstName;
    patient.patient_lastName = updatedInfo.patient_lastName || patient.patient_lastName;
    patient.patient_middleInitial = updatedInfo.patient_middleInitial || patient.patient_middleInitial;
    patient.patient_contactNumber = updatedInfo.patient_contactNumber || patient.patient_contactNumber;
    patient.patient_email = updatedInfo.patient_email || patient.patient_email;
    // Update other fields similarly

    // Create the audit description based on changes
    const auditDescription = changes.length > 0 ? changes.join(', ') : 'No significant changes made.';

    // Create the audit record
    const auditData = {
      user: patient._id,
      userType: 'Patient', // Specify the user type
      action: 'Update Info',  // The action performed
      description: auditDescription,  // Description of the changes made
      ipAddress: req.ip,  // Get the IP address from the request
      userAgent: req.get('User-Agent'),  // Get the User-Agent (browser/device info)
    };

    // Save the audit record to the database
    const audit = await new Audit(auditData).save();

    // Add the audit ID to the patient's `audits` array
    patient.audits.push(audit._id);

    // Save the updated patient data
    patient.lastProfileUpdate = now; // Update the lastProfileUpdate date
    await patient.save();

    res.json({ success: true, message: 'Information updated successfully' });
  } catch (error) {
    console.error('Error updating patient information:', error);
    res.status(500).json({ message: 'Error updating patient information', error });
  }
};


const createUnregisteredPatient = async (req, res) => {
  const { patient_email, ...rest } = req.body;

  // Always include patient_email and set accountStatus to 'Unregistered'
  const patientData = { ...rest, patient_email, accountStatus: 'Unregistered' };

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
  .populate('audits')


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

    const selectedDate = new Date(date);

    // Fetch the doctor with bookedSlots for the specific date
    const doctor = await Doctor.findOne({
      _id: doctorId,
      'bookedSlots.date': selectedDate,
    }).select('bookedSlots.$');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Handle cases where no slots exist for the given date
    let bookedSlot = doctor.bookedSlots[0];
    if (!bookedSlot) {
      bookedSlot = { date: selectedDate, morning: 0, afternoon: 0 };
    }

    res.status(200).json({
      morning: bookedSlot.morning,
      afternoon: bookedSlot.afternoon,
    });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(400).json({ message: error.message });
  }
};












const cancelAppointment = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const appointmentId = req.params.appointmentId; // Appointment ID from URL parameter

    // Logging to check if the function is called more than once
    console.log('Cancel request received for appointment:', appointmentId);

    // Find the appointment before updating (to know the current doctor, date, and time)
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'dr_firstName dr_lastName') // Populate doctor's name
      .populate('patient', 'patient_firstName patient_lastName'); // Optionally, populate patient's name

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure that the appointment hasn't been canceled already
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ message: 'Appointment has already been cancelled.' });
    }

    // Update the cancelReason and status to 'Cancelled'
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { cancelReason: cancelReason, status: 'Cancelled' } }, // Update cancelReason and status
      { new: true }
    );

    // Create audit for appointment cancellation
    const auditData = {
      user: appointment.patient._id, // Assuming the patient is cancelling the appointment
      userType: 'Patient', // Specify the user type
      action: 'Cancel Appointment',
      description: `Appointment with Dr. ${appointment.doctor.dr_firstName} ${appointment.doctor.dr_lastName} on ${appointment.date.toLocaleDateString()} at ${appointment.time} was cancelled. Reason: ${cancelReason}`,
      ipAddress: req.ip,  // Get the IP address from the request
      userAgent: req.get('User-Agent'),  // Get the User-Agent (browser/device info)
    };

    // Save the audit record
    const audit = await new Audit(auditData).save();

    // Add the audit ID to the patient's `audits` array
    const patient = await Patient.findById(appointment.patient);
    if (patient) {
      patient.audits.push(audit._id);
      await patient.save();
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(400).json({ message: error.message });
  }
};





const updatePatientImage = async (req, res) => {
  try {
    const patientId = req.params.id;
    const imagePath = `images/${req.file.filename}`;  // Assuming the images are stored in an 'images' directory

    // Find the patient by ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update the patient image
    patient.patient_image = imagePath;
    const updatedPatient = await patient.save();

    // Create audit for updating the patient image
    const auditData = {
      user: patient._id, // The patient who updated their image
      userType: 'Patient', // Specify the user type
      action: 'Update Image',
      description: `Patient updated their profile image.`,
      ipAddress: req.ip,  // Get the IP address from the request
      userAgent: req.get('User-Agent'),  // Get the User-Agent (browser/device info)
    };

    // Save the audit record to the database
    const audit = await new Audit(auditData).save();

    // Add the audit ID to the patient's `audits` array
    patient.audits.push(audit._id);
    await patient.save();  // Save the patient again with the audit entry

    // Respond with the updated patient
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
    patient.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5-minute expiration

    await patient.save();
    const auditData = {
      user: patient._id, // The patient who requested the reset
      userType: 'Patient', // Specify the user type
      action: 'Forgot Password Request',
      description: `Patient requested a password reset. Token generated with a 5-minute expiration.`,
      ipAddress: req.ip,  // Get the IP address from the request
      userAgent: req.get('User-Agent'),  // Get the User-Agent (browser/device info)
    };

    // Save the audit record to the database
    const audit = await new Audit(auditData).save();

    // Add the audit ID to the patient's `audits` array
    patient.audits.push(audit._id);
    await patient.save();  // Save the patient again with the audit entry
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

    // const resetLink = `${ip.address}/reset-password/patient/${token}`;
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/patient/${token}`;
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

const getAllPatientEmails = (req, res) => {
  Patient.find({}, 'patient_email')
      .then((patient) => {
          const emails = patient.map(patient => patient.patient_email);
          res.json(emails); // Send raw doctors data for inspection
      })
      .catch((err) => {
          console.error('Error fetching patient emails:', err);
          res.status(500).json({ message: 'Something went wrong', error: err });
      });
};

const getAllContactNumbers = (req, res) => {
  Patient.find({}, 'patient_contactNumber')
  .then((patient) => {
      const contactNumbers = patient.map(patient => patient.patient_contactNumber);
      res.json(contactNumbers); // Send raw doctors data for inspection
  } )
  .catch((err) => { 
      console.error('Error fetching patient contact numbers:', err);
      res.status(500).json({ message: 'Something went wrong', error: err });
  } );
}

// Assuming you're using Mongoose
const getPatientWithAudits = async (req, res) => {
  try {
      const { pid } = req.params;

      const patient = await Patient.findById(pid)
          .populate({
              path: 'audits',
              options: { sort: { createdAt: -1 } }, // Ensure audits are sorted in reverse order
          });

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      res.json({ thePatient: patient });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching patient data', error });
  }
};

const getPatientByPatientID = async (req, res) => {
  try {
    const patientID = req.params.patientID;
    const patient = await Patient.findOne({ patient_ID: patientID });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ message: "Server error" });
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
    forgotPassword, resetPassword, loginPatient, getAllPatientEmails, getAllContactNumbers, getPatientWithAudits,
    getPatientByPatientID,
    getSessionData,
    logoutPatient
}