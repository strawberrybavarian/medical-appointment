const mongoose = require('mongoose');
const MedicalSecretary = require('./medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('../admin/admin_model');
const nodemailer = require('nodemailer');
const { staff_email } = require('../EmailExport');
const socket = require('../socket');

const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  };
  
  const changePassword = async (req, res) => {
    const { msid } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
  
    try {
      // Find the medical secretary by ID
      const secretary = await MedicalSecretary.findById(msid);
      if (!secretary) {
        return res.status(404).json({ message: 'Medical Secretary not found' });
      }
  
      // Check if the old password matches

  
      // Validate new password and confirm password
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
      }
  
      // Update the password
      secretary.ms_password = newPassword;
      secretary.status = 'registered'; // Set status to 'registered' after password change
      await secretary.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Signup controller to create a new Medical Secretary
  const NewMedicalSecretarySignUp = async (req, res) => {
    const { ms_firstName, ms_lastName, ms_email, ms_contactNumber } = req.body;
  
    try {
      // Check if email already exists
      const existingSecretary = await MedicalSecretary.findOne({ ms_email });
      if (existingSecretary) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Generate a random password
      const generatedPassword = generateRandomPassword();
  
      // Create the new Medical Secretary
      const newSecretary = new MedicalSecretary({
        ms_firstName,
        ms_lastName,
        ms_email,
        ms_contactNumber,
        ms_password: generatedPassword, // Assign the generated password
        status: 'pending', // Set status as 'pending' initially
      });
  
      await newSecretary.save();
  
      // Send email with the generated password
      const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other email services if needed
        auth: {
          user: staff_email.user, // Your email
          pass: staff_email.pass, // Your email password
        },
      });
  
      const mailOptions = {
        from: staff_email.user,
        to: ms_email,
        subject: 'Your Medical Secretary Account Password',
        text: `Hello ${ms_firstName},\n\nYour account has been created. Your password is: ${generatedPassword}\n\nPlease log in and change your password.\n\nBest Regards,\nYour Healthcare Team`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
      });
  
      res.status(201).json({ message: 'Medical Secretary registered successfully. Email sent with the password.' });
  
    } catch (error) {
      console.error('Error registering Medical Secretary:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

const assignAppointment = async (req, res) => {
    try {
      const { id } = req.params; // Appointment ID
      const { doctor, date, time } = req.body;
  
      // Validate input
      if (!doctor || !date || !time) {
        return res.status(400).json({ message: 'Doctor, date, and time are required.' });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found.' });
      }
  
      // Find the doctor and validate
      const foundDoctor = await Doctors.findById(doctor);
      if (!foundDoctor) {
        return res.status(404).json({ message: 'Doctor not found.' });
      }
  
      // Update the appointment details
      appointment.doctor = doctor;
      appointment.date = date;
      appointment.time = time;
      appointment.status = 'Pending';
  
      // Save the updated appointment
      await appointment.save();
  
      // Add the appointment to the doctor's dr_appointments array if it's not already there
      if (!foundDoctor.dr_appointments.includes(id)) {
        foundDoctor.dr_appointments.push(id);
        await foundDoctor.save(); // Save the updated doctor
      }
  
      // Respond with success
      return res.status(200).json({ message: 'Appointment details assigned successfully.', appointment });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };




// const NewMedicalSecretaryignUp = (req, res) => {
//     MedicalSecretary.create(req.body)
//         .then((newMedicalSecretary) => {
//              res.json({ newMedicalSecretary: newMedicalSecretary, status: "Successfully registered Medical Secretary." });
//         })
//         .catch((err) => {
//             res.json({ message: 'Something went wrong. Please try again.', error: err });
//         });
// };

const findAllMedicalSecretary = (req, res) => {
    MedicalSecretary.find()
        .then((allDataMedicalSecretary) => {
            res.json({ theMedicalSecretary: allDataMedicalSecretary }
                
            );
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};


const getAllAppointments = (req, res) => {
    Appointment.find()
        .populate('patient')
        .populate('doctor')
        .populate('payment')
        .then((AllAppointments)  =>  {
          
            res.json({Appointments:AllAppointments} ) ;
        })
        .catch((err) => {
            res.json({message: 'Something went wrong', error: err})
        })
}



const ongoingAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.uid; // Appointment ID from URL parameter

        // Find the appointment and update its status to 'Ongoing'
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Ongoing' },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Get doctor and patient IDs from the appointment
        const doctorId = updatedAppointment.doctor;
        const patientId = updatedAppointment.patient;

        // Update doctor's activity status to 'In Session'
        await Doctors.findByIdAndUpdate(
            doctorId,
            { activityStatus: 'In Session' },
            { new: true }
        );

        // Update doctor's list of patients if the patient is not already in the list
        await Doctors.findByIdAndUpdate(
            doctorId,
            { $addToSet: { dr_patients: patientId } }, // AddToSet ensures no duplicates
            { new: true }
        );

        // Create a notification for the patient
        const notification = new Notification({
            message: `Your appointment with Dr. ${doctorId} is ongoing.`,
            recipientType: 'Patient',
            recipient: patientId
        });
        await notification.save();

        // Add notification reference to the patient
        await Patient.findByIdAndUpdate(
            patientId,
            { $push: { notifications: notification._id } },
            { new: true }
        );

        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPatientStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Start of tomorrow (exclusive)

        // Count total pending patients
        const pendingPatientsCount = await Appointment.countDocuments({ status: 'Pending' });

        // Count total today's patients (appointments between today and tomorrow)
        const todaysPatientsCount = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow }, // Date range: today (inclusive) to tomorrow (exclusive)
            status: { $in: ['Scheduled', 'Completed', 'Pending', 'Ongoing'] }
        });

        // Count total ongoing patients
        const ongoingPatientsCount = await Appointment.countDocuments({ status: 'Ongoing' });

        res.json({
            pendingPatients: pendingPatientsCount,
            todaysPatients: todaysPatientsCount,
            ongoingPatients: ongoingPatientsCount,
        });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
};



const findMedSecById = (req, res) => {
  MedicalSecretary.findOne({ _id: req.params.msid })
    .populate('notifications') // Populate notifications
    .then((theMedSec) => {
    if (!theMedSec) {
      return res.status(404).json({ message: 'Medical Secretary not found' });
    }
    res.json({ theMedSec });
    })
    .catch((err) => {
    console.error('Error finding Medical Secretary:', err);
    res.status(500).json({ message: 'Something went wrong', error: err });
    });
  };

  const updateMedicalSecretaryImage = async (req, res) => {
    try {
        const { msid } = req.params; // Get the msid from the URL parameters
        const imagePath = req.file.path; // Get the image path from the uploaded file

        // Update the medical secretary document with the new image path
        const updatedMedSec = await MedicalSecretary.findByIdAndUpdate(
            msid,
            { ms_image: imagePath }, // Update the image path
            { new: true }
        );

        if (!updatedMedSec) {
            return res.status(404).json({ message: 'Medical Secretary not found' });
        }

        res.status(200).json({ message: 'Image updated successfully', updatedMedSec });
    } catch (error) {
        console.error('Error updating Medical Secretary image:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateMedicalSecretary = async (req, res) => {
    try {
        const { msid } = req.params; // Get the Medical Secretary ID from the URL
        const { ms_firstName, ms_lastName, ms_email, ms_contactNumber } = req.body;

        // Check if the Medical Secretary exists
        const medicalSecretary = await MedicalSecretary.findById(msid);
        if (!medicalSecretary) {
            return res.status(404).json({ message: 'Medical Secretary not found' });
        }

        // Update fields
        medicalSecretary.ms_firstName = ms_firstName;
        medicalSecretary.ms_lastName = ms_lastName;
        medicalSecretary.ms_email = ms_email;
        medicalSecretary.ms_contactNumber = ms_contactNumber;

        // If an image is uploaded, update the image path
        if (req.file) {
            medicalSecretary.ms_image = req.file.path; // Set the image path
        }

        // Save the updated Medical Secretary
        await medicalSecretary.save();
        res.status(200).json({ message: 'Medical Secretary information updated successfully', medicalSecretary });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Medical Secretary information', error: error.message });
    }
};


const createGeneralNotification = async (req, res) => {
  try {
    const { message, link = '/general/info' } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Find all Medical Secretaries and Admins
    const [medicalSecretaries, admins] = await Promise.all([
      MedicalSecretary.find({}, '_id'),
      Admin.find({}, '_id'),
    ]);

    const recipients = [
      ...medicalSecretaries.map(ms => ms._id),
      ...admins.map(ad => ad._id)
    ];

    const notification = new Notification({
      message,
      receiver: recipients,
      receiverModel: 'Admin', // or use something like 'User' if you unify their roles
      isRead: false,
      type: 'General',
      link
    });

    const savedNotification = await notification.save();

    // Update each Medical Secretary's notifications array
    await Promise.all(
      medicalSecretaries.map(ms => {
        return MedicalSecretary.findByIdAndUpdate(ms._id, { $push: { notifications: savedNotification._id } });
      })
    );

    // Update each Admin's notifications array
    await Promise.all(
      admins.map(ad => {
        return Admin.findByIdAndUpdate(ad._id, { $push: { notifications: savedNotification._id } });
      })
    );

    // Broadcast via socket to all connected Admins and MedSecs
    socket.broadcastGeneralNotification({
      message: message,
      notificationId: savedNotification._id,
      link: link
    });

    res.status(201).json({ message: 'Notification created successfully', notification: savedNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: `Failed to create notification: ${error.message}` });
  }
};


 const getMedSecWithAudits = async (req, res) => {
    try {
      const {medsecId} = req.params;

      const medsec = await MedicalSecretary.findById(medsecId)
        .populate({
          path: 'audits',
          options: {sort: {createdAt: -1}},
        })
      
        if(!medsec){
          return res.status(404).json({message: 'Medical Secretary not found'});
        }

        res.status(200).json({medsec});
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
 };


 const changePendingMedSecPassword = async (req, res) => {
  const { medsecId } = req.params;
  const { newPassword, confirmNewPassword } = req.body;

  try {
      if (!newPassword || !confirmNewPassword) {
          return res.status(400).json({ message: "Both password fields are required." });
      }

      if (newPassword !== confirmNewPassword) {
          return res.status(400).json({ message: "Passwords do not match." });
      }

      const medsec = await MedicalSecretary.findById(medsecId);
      if (!medsec) {
          return res.status(404).json({ message: "Admin not found." });
      }

      // Store the new password in plain text (not recommended for production)
      medsec.ms_password = newPassword;
      medsec.status = 'registered';
      await medsec.save();

      return res.status(200).json({ message: "Password updated and account activated successfully." });
  } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Server error, please try again." });
  }
};
module.exports = {
    // NewMedicalSecretaryignUp,
    findAllMedicalSecretary,
    getAllAppointments,
    ongoingAppointment,
    getPatientStats,
    findMedSecById,
    assignAppointment,
    updateMedicalSecretaryImage,
    updateMedicalSecretary,
    changePassword,
    NewMedicalSecretarySignUp,
    changePassword, 
    createGeneralNotification,
    getMedSecWithAudits,
    changePendingMedSecPassword


};
