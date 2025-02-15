const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('./admin_model')
const Services = require('../services/service_model')
const Specialty = require('../specialty/specialty_model')
const nodemailer = require('nodemailer');
const socket = require('../socket');
const { staff_email } = require('../EmailExport');
const bcrypt = require('bcryptjs');


const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
};
const changeAdminPassword = async (req, res) => {
    const { adminId } = req.params; // Get the adminId from the URL parameters
    const { email, confirmEmail, oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
        // Check if the email fields match
        if (email !== confirmEmail) {
            return res.status(400).json({ message: "Email addresses do not match." });
        }

        // Check if the new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match." });
        }

        // Find the admin by adminId
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        // Check if the old password matches using bcrypt to compare hashed passwords
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ message: "Old password is incorrect." });
        }

        // Update the admin password without hashing it
        admin.password = newPassword; // No hashing needed here for the new password
        await admin.save();

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ message: "Server error, please try again." });
    }
};

const updateAdminInfo = async (req, res) => {
    const { adminId } = req.params; // Get the adminId from the URL parameters
    const { firstName, lastName, email, contactNumber, birthdate } = req.body;

    try {
        // Find the admin by adminId
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        // Update the admin's information with the new values
        admin.firstName = firstName || admin.firstName;
        admin.lastName = lastName || admin.lastName;
        admin.email = email || admin.email;
        admin.contactNumber = contactNumber || admin.contactNumber;
        admin.birthdate = birthdate || admin.birthdate;

        // Save the updated admin info
        await admin.save();

        return res.status(200).json({ message: "Admin information updated successfully.", admin });
    } catch (error) {
        console.error("Error updating admin info:", error);
        return res.status(500).json({ message: "Server error, please try again." });
    }
};
const adminSignUp = async (req, res) => {
    const { firstName, lastName, email, username, contactNumber } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const generatedPassword = generateRandomPassword();
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            username,
            contactNumber,
            password: generatedPassword, 
            isActive: true, 
            role: 'Admin',
            status: 'pending',
        });
        await newAdmin.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: staff_email.user,
                pass: staff_email.pass,
            },
        });
        const mailOptions = {
            from: staff_email.user,
            to: email,
            subject: 'Your Admin Account Password',
            text: `Hello ${firstName},\n\nYour Admin account has been created. Your password is: ${generatedPassword}\n\nPlease log in and change your password.\n\nBest Regards,\nYour Team`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent: ' + info.response);
        });
        res.status(201).json({ message: 'Admin registered successfully. Email sent with the password.' });
    } catch (error) {
        console.error('Error registering Admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getAllStaff = async (req, res) => {
    try {
      const admins = await Admin.find();
      const medicalSecretaries = await MedicalSecretary.find();
      const staff = [...admins, ...medicalSecretaries];
      res.status(200).json({ staff });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching staff', error: error.message });
    }
  };
  const updateStaffAccountStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role } = req.body;
      let updatedStaff;
      if (role === 'admin') {
        updatedStaff = await Admin.findByIdAndUpdate(id, { accountStatus: status }, { new: true });
      } else if (role === 'medicalSecretary') {
        updatedStaff = await MedicalSecretary.findByIdAndUpdate(id, { accountStatus: status }, { new: true });
      }
      if (!updatedStaff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      res.status(200).json({ message: 'Staff account status updated', staff: updatedStaff });
    } catch (error) {
      res.status(500).json({ message: 'Error updating account status', error: error.message });
    }
  };
  const confirmDeactivation = async (req, res) => {
    try {
        const { confirm } = req.body; 
        const doctor = await Doctors.findByIdAndUpdate(
            req.params.doctorId,
            { 
                deactivationRequest: { 
                    confirmed: confirm,
                    requested: false
                },
                activeAppointmentStatus: !confirm 
            },
            { new: true }
        );

        const message = `Your deactivation request has been ${confirm ? 'approved' : 'rejected'}.`;
        
        // Create a new notification for the doctor
        const newNotification = new Notification({
            message,
            receiver: doctor._id,
            receiverModel: 'Doctor',
            isRead: false,
            link: '/dashboard', // or any relevant link
            type: 'Deactivation Request',
            recipientType: 'Doctor',
        });

        await newNotification.save();

        // Add the notification to the doctor's notifications array
        await Doctors.findByIdAndUpdate(doctor._id, { $push: { notifications: newNotification._id } });

        // If Socket.IO is set up, and you have a global clients map:
        // Emit socket.io event to Doctor (optional)
        const io = socket.getIO(); // assuming socket.init(server) sets global.io
        const clients = socket.clients; // map of userId -> socket instance
        
        const doctorSocket = clients[doctor._id.toString()];
        if (doctorSocket && doctorSocket.userRole === 'Doctor') {
            doctorSocket.emit('appointmentStatusUpdate', {
                message,
                doctorId: doctor._id,
                status: confirm ? 'Deactivation Approved' : 'Deactivation Rejected',
                link: '/dashboard',
                notificationId: newNotification._id.toString(),
            });
        }

        console.log(`Deactivation ${confirm ? 'approved' : 'rejected'} for Doctor ${doctor.dr_firstName} ${doctor.dr_lastName}`);
        res.status(200).json({ message: `Deactivation ${confirm ? 'approved' : 'rejected'}`, doctor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getDeactivationRequests = async (req, res) => {
    try {
        const requests = await Doctors.find({ 'deactivationRequest.requested': true });
        res.status(200).json(requests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const NewAdminSignUp = (req, res) => {
    Admin.create(req.body)
        .then((newAdmin) => {
             res.json({ newAdmin: newAdmin, status: "Successfully registered Admin." });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong. Please try again.', error: err });
        });
};
const updateDoctorAccountStatus = (req, res) => {
    const { doctorId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Review', 'Registered', 'Deactivated', 'Deleted'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }
    Doctors.findByIdAndUpdate(
        doctorId,
        { accountStatus: status },
        { new: true }
    )
    .then((updatedDoctor) => {
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ updatedDoctor, status: `Doctor status has been successfully updated to ${status}.` });
    })
    .catch((err) => {
        res.status(500).json({ message: 'Something went wrong. Please try again.', error: err });
    });
};
const findAllAdmin = (req,res) => {
    Admin.find()
        .then((allAdmin)=>{
            res.json({theAdmin: allAdmin});
        })
        .catch((err) => {
            res.json({message: 'Something went wrong', error: err})
        })
}
const getAppointmentStats = (req, res) => {
    Appointment.aggregate([
        {
            $match: {
                status: { $in: ['Completed', 'Scheduled', 'Pending', 'Cancelled'] }
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                status: "$_id",
                count: 1
            }
        }
    ])
    .then(stats => {
        res.json(stats);
    })
    .catch(err => {
        res.status(500).json({ message: 'Something went wrong', error: err });
    });
};
const getCompletedAppointmentsByMonth = (req, res) => {
    Appointment.aggregate([
        {
            $match: {
                status: 'Completed'
            }
        },
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                count: 1
            }
        },
        {
            $sort: { year: 1, month: 1 }
        }
    ])
    .then(stats => {
        res.json(stats);
    })
    .catch(err => {
        res.status(500).json({ message: 'Something went wrong', error: err });
    });
};
const getDoctorSpecialtyStats = (req, res) => {
    Doctors.aggregate([
        {
            $group: {
                _id: "$dr_specialty",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                specialty: "$_id",
                count: 1
            }
        }
    ])
    .then(stats => {
        res.json(stats);
    })
    .catch(err => {
        res.status(500).json({ message: 'Something went wrong', error: err });
    });
};
const updatePatientAccountStatus = (req, res) => {
    const { patientId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Registered', 'Unregistered', 'Deactivated', 'Deleted', 'Archived'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }
    Patient.findByIdAndUpdate(
        patientId,
        { accountStatus: status },
        { new: true }
    )
    .then((updatedPatient) => {
        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ updatedPatient, status: `Patient status has been successfully updated to ${status}.` });
    })
    .catch((err) => {
        res.status(500).json({ message: 'Something went wrong. Please try again.', error: err });
    });
};

const findAdminById = (req, res) => {
    Admin.findOne({ _id: req.params.adminId })
      .populate('notifications') // Populate notifications
      .then((theAdmin) => {
      if (!theAdmin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      res.json({ theAdmin });
      })
      .catch((err) => {
      console.error('Error finding Admin:', err);
      res.status(500).json({ message: 'Something went wrong', error: err });
      });
};

const getAdminWithAudits = async (req, res) => {   

    try {
        const { adminId } = req.params;

        const admin = await Admin.findById(adminId)
            .populate({
                path: 'audits',
                options: { sort: { 'createdAt': -1 } }
                
            })
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error fetching Admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    NewAdminSignUp,
    findAllAdmin,
    getAppointmentStats,
    getDoctorSpecialtyStats,
    getCompletedAppointmentsByMonth,
    updateDoctorAccountStatus,
    updatePatientAccountStatus,
    confirmDeactivation,
    getDeactivationRequests,
    getAllStaff,
    updateStaffAccountStatus,
    adminSignUp,
    changeAdminPassword,
    findAdminById,
    updateAdminInfo,
    getAdminWithAudits
};
