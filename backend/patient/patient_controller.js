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







const NewPatientSignUp = (req, res) => {
    Patient.create(req.body)
    .then((newPatient) => {
        res.json({newPatient: newPatient, status:"Successfully registered Patient."})
        console.log(newPatient)
    })
    .catch((err) => {
        res.json({ message: 'Something went wrong. Please try again.', error:err})
        console.log(err)
    });
} 

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
          path: 'prescription',
          model: 'Prescription',
          populate: 
          {
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

// Array New Post
const addNewPostById = (req, res) => {
    Patient.findById({_id:req.params.id})
      .then((Patient) => {
        if (!Patient) {
          res.json({ message: 'Patient not found' });
        }
        Patient.post.unshift(req.body.post);
        return Patient.save();
      })
      .then((updatedPatient) => {
        res.json({ updatedPatient, message: 'New post added successfully' });
      })
      .catch((error) => {
        res.json({ message: 'Error adding post', error });
      });
  };
  

//find posts by id Array 
const getAllPostbyId = (req, res) => {
    Patient.findOne({ _id: req.params.id })
      .then((Patient) => {
        if (!Patient) {
          res.json({ message: 'Patient not found' });
        }
          res.json({ posts: Patient.post }); 
      })
      .catch((err) => {
        res.json({ message: 'Error retrieving posts', error: err });
      });
};

//Deleting by Id Array Post
const findPostByIdDelete = (req, res) => {
  Patient.findById(req.params.uid)
    .then((Patient) => {
      if (!Patient) {
        return res.json({ message: 'Patient not found' });
      }
        Patient.post.splice(req.params.index, 1); 
        return Patient.save()
          .then((updatedPatient) => {
            res.json({ updatedPatient, message: 'Post deleted successfully' });
          })
          .catch((error) => {
            res.json({ message: 'Error deleting post', error });
          });

    })
    .catch((error) => {
      res.json({ message: 'Error finding Patient', error });
    });
};


const updatePostAtIndex = (req, res) => {
  Patient.findById(req.params.id)
    .then((Patient) => {
      if (!Patient) {
        return res.json({ message: 'Patient not found' });
      }
            Patient.post[req.params.index] = req.body.post; 
            return Patient.save()
          .then((updatedPatient) => {
            res.json({ updatedPatient, message: 'Post updated successfully' });
          })
          .catch((error) => {
            res.json({ message: 'Error updating post', error });
          });
    })
    .catch((error) => {
      res.json({ message: 'Error finding Patient', error });
    });
};

const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, cancelReason, rescheduledReason, secretaryId, prescriptionId, medium, payment } = req.body;
    const patientId = req.params.uid; 


    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const secretaryObjectId = secretaryId ? new mongoose.Types.ObjectId(secretaryId) : null;
    const prescriptionObjectId = prescriptionId ? new mongoose.Types.ObjectId(prescriptionId) : null;


    const newAppointment = new Appointment({
      patient: patientObjectId,
      doctor: doctorObjectId,
      prescription: prescriptionObjectId,
      date,
      time,
      reason,
      cancelReason,
      rescheduledReason,
      medium,
      payment,
      secretary: secretaryObjectId
    });

    await newAppointment.save();

    // Update Doctor's appointments
    await Doctor.findByIdAndUpdate(doctorObjectId, {
      $push: { dr_appointments: newAppointment._id }
    });

    // Update Patient's appointments
    await Patient.findByIdAndUpdate(patientObjectId, {
      $push: { patient_appointments: newAppointment._id } // Ensure this field matches the model
    });

    // Update Medical Secretary's appointments 
    if (secretaryObjectId) {
      await MedicalSecretary.findByIdAndUpdate(secretaryObjectId, {
        $push: { ms_appointments: newAppointment._id }
      });
    }

    // Create a notification for the patient
    const patientNotification = new Notification({
      message: `You have an pending appointment scheduled on ${date} at ${time}.`,
      recipient: patientObjectId,
      recipientType: 'Patient'
    });
    await patientNotification.save();

    
    // Add notification reference to the patient
    await Patient.findByIdAndUpdate(
      patientObjectId,
      { $push: { notifications: patientNotification._id } },
      { new: true }
    );
    // Create a notification for the doctor
    const doctorNotification = new Notification({
      message: `You have a new pending appointment scheduled with a patient on ${date} at ${time}.`,
      recipient: doctorObjectId,
      recipientType: 'Doctor'
    });
    await doctorNotification.save();

    // Add notification reference to the doctor
    await Doctor.findByIdAndUpdate(
      doctorObjectId,
      { $push: { notifications: doctorNotification._id } },
      { new: true }
    );

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error); // Log the error details
    res.status(400).json({ message: error.message });
  }
};


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







module.exports = {
    NewPatientSignUp,
    findAllPatient,
    findPatientByEmail,
    addNewPostById,
    getAllPostbyId,
    findPostByIdDelete,
    findPatientById,
    updatePostAtIndex,
    createAppointment,
    cancelAppointment,
    setupTwoFactor,
    verifyTwoFactor,
    verifyOTP,
    sendOTP,
    bookedSlots,
    createUnregisteredPatient
}