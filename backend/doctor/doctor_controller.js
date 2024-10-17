const Doctors = require('./doctor_model');
const Post = require('../announcement/announcement_model');
const Patient = require('../patient/patient_model');
const Appointment = require('../appointments/appointment_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Prescription = require('../prescription/prescription_model');
const Notification = require('../notifications/notifications_model')
const DoctorService = require('../doctor/doctor_service')
const mongoose = require('mongoose');
const Specialty = require('../specialty/specialty_model');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { staff_email } = require('../EmailExport');




// Define the route handler function
const updateDoctorStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;  // 'Online' or 'Offline'

    try {
        await DoctorService.updateActivityStatus(id, status);
        res.status(200).json({ message: `Doctor ${id} status updated to ${status}.` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
};

const offlineActivityStatus = async (req, res) => {
    const doctorId = req.params.id;
    try {
        console.log(`Setting doctor ${doctorId} status to Offline`);
        await DoctorService.updateActivityStatus(doctorId, 'Offline');
        res.status(200).json({ message: 'Doctor logged out and status set to Offline.' });
    } catch (err) {
        console.error('Error logging out doctor:', err);
        res.status(500).json({ message: 'Error logging out doctor.', error: err });
    }
};


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
        // Try to find the user in Doctors collection first
        let user = await Doctors.findOne({ dr_email: req.body.email });
  
        if (!user) {
            // If no doctor is found, try to find the patient
            user = await Patient.findOne({ patient_email: req.body.email });
  
            if (!user) {
                return res.status(404).send('User not found');
            }
        }
  
        const otp = speakeasy.totp({
            secret: user.twoFactorSecret,
            encoding: 'base32'
        });
  
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        await user.save();
  
        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.dr_email || user.patient_email, // Ensure correct email field is used
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        };
  
        await transporter.sendMail(mailOptions);
  
        res.status(200).send('OTP sent');
    } catch (error) {
        console.error('Error sending OTP:', error); // Log error for debugging
        res.status(500).send('Error sending OTP');
    }
};
// Verify OTP
const verifyOTP = async (req, res) => {
  try {
      const patient = await Doctors.findOne({ dr_email: req.body.email });
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
const setupTwoFactorForDoctor = async (req, res) => {
    try {
      const doctor = await Doctors.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      let secret;
      if (!doctor.twoFactorSecret || req.body.regenerate) {
        secret = speakeasy.generateSecret({ length: 30 });
        doctor.twoFactorSecret = secret.base32;
        doctor.twoFactorEnabled = true;
        await doctor.save();
      } else {
        secret = { base32: doctor.twoFactorSecret };
      }
  
      console.log('Stored Secret in DB:', doctor.twoFactorSecret);
  
      const otpAuthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: `Landagan Kids Clinic:${doctor.dr_email}`,
        issuer: 'Landagan Kids Clinic',
        encoding: 'base32'
      });
  
      console.log('OTP Auth URL:', otpAuthUrl);
  
      const qrCode = await QRCode.toDataURL(otpAuthUrl);
  
      console.log('Generated Secret:', secret.base32);
  
      res.json({ qrCode, secret: secret.base32 });
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      res.status(500).json({ message: 'Error generating 2FA secret', error });
    }
};
  // Verify Two-Factor Function
const verifyTwoFactor = async (req, res) => {
    const { userId, token } = req.body;
  
    try {
      const doctor = await Doctors.findById(userId);
      if (!doctor) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      if (!doctor.twoFactorEnabled) {
        return res.status(400).json({ message: '2FA not enabled for this patient' });
      }
  
      if (!token) {
        return res.status(400).json({ message: '2FA token is required' });
      }
  
      console.log(`Verifying token: ${token} for user ${userId}`);
      console.log(`Secret key: ${doctor.twoFactorSecret}`);
  
      const verified = speakeasy.totp.verify({
        secret: doctor.twoFactorSecret,
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

// const NewDoctorSignUp = (req, res) => {
//     Doctors.create(req.body)
//         .then((newDoctor) => {
//             res.json({ newDoctor: newDoctor, status: "Successfully registered Doctor." });
//         })
//         .catch((err) => {
//             res.json({ message: 'Something went wrong. Please try again.', error: err });
//         });
// };


const NewDoctorSignUp = async (req, res) => {
    const { dr_email, dr_password, ...otherFields } = req.body;
  
    try {
        const newDoctor = new Doctors({
            dr_email,
            dr_password,
            ...otherFields,
        });
  
        await newDoctor.save();
        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering doctor', error });
    }
  };


  const loginDoctor = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const doctor = await Doctors.findOne({ dr_email: email });
  
      if (!doctor) {
        return res.status(404).json({ message: 'No doctor with that email found' });
      }
  
      // Check if the doctor's account status is "Review"
      if (doctor.accountStatus === 'Review') {
        return res.status(403).json({ message: 'Your account is currently under review. Please wait for approval.' });
      }
  
      const isMatch = await bcrypt.compare(password, doctor.dr_password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Exclude sensitive information before sending
      const doctorData = {
        _id: doctor._id,
        dr_email: doctor.dr_email,
        dr_firstName: doctor.dr_firstName,
        dr_lastName: doctor.dr_lastName,
        // Include other necessary fields
      };
  
      res.json({
        message: 'Successfully logged in',
        doctorId: doctor._id,
        doctorData: doctorData,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };
  


const updateDoctorDetails = (req, res) => {
    const updateData = {
      dr_firstName: req.body.dr_firstName,
      dr_lastName: req.body.dr_lastName,
      dr_middleInitial: req.body.dr_middleInitial,
      dr_contactNumber: req.body.dr_contactNumber,
      dr_dob: req.body.dr_dob,
      dr_email: req.body.dr_email,
      dr_password: req.body.dr_password,
      dr_specialty: req.body.dr_specialty
    };
    Doctors.findByIdAndUpdate({ _id: req.params.id }, updateData, { new: true, runValidators: true })
      .then((updatedDoctor) => {
        res.json({ updatedDoctor: updatedDoctor, message: "Successfully updated the doctor" });
      })
      .catch((err) => {
        res.json({ message: 'Something went wrong', error: err });
      });
};
const findAllDoctors = (req, res) => {
    Doctors.find()
        .populate('dr_posts')
        .populate('dr_services')
        .then(allDataDoctors => {
            res.json({ theDoctor: allDataDoctors });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};

const findOneDoctor = (req, res) => {
    const doctorId = req.params.id;

    Doctors.findById(doctorId)
        .populate('dr_services')
        .populate('dr_appointments') // Populate services offered by the doctor
        .then(doctor => {
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            res.json({ doctor });
        })
        .catch(err => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};
;

const findUniqueSpecialties = async (req, res) => {
  try {
      // Step 1: Get the list of unique specialties from the Doctors collection
      const specialtyNames = await Doctors.distinct('dr_specialty');

      // Step 2: Fetch specialty details from the Specialty collection
      const specialties = await Specialty.find({ name: { $in: specialtyNames } });

      res.json({ specialties });
  } catch (err) {
      res.status(500).json({ message: 'Something went wrong', error: err });
  }
};
const updateDoctorImage = async (req, res) => {
    try {
      const doctorId = req.params.id;
      const imagePath = `images/${req.file.filename}`; // Path to saved image
  
      // Update doctor's image in the database
      const updatedDoctor = await Doctors.findByIdAndUpdate(doctorId, { dr_image: imagePath }, { new: true });
  
      res.json({ updatedDoctor, message: 'Doctor image updated successfully' });
    } catch (error) {
      console.error('Error updating doctor image:', error);
      res.status(500).json({ message: 'Error updating doctor image', error });
    }
  };
// Get Doctor by ID
const findDoctorById = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .populate('dr_appointments')
        .then((theDoctor) => {
            res.json({ theDoctor });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};
const findDoctorByEmail = (req, res) => {
    Doctors.findOne({ email: req.params.email })
        .populate('dr_posts')
        .then((theDoctor) => {
            res.json({ theEmail: theDoctor });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};
// Add a new post
const addNewPostById = (req, res) => {
    const newPost = new Post({
        content: req.body.content, 
        doctor_id: req.params.id,
    });

    newPost.save()
        .then((post) => {
            return Doctors.findByIdAndUpdate(
                req.params.id,
                { $push: { dr_posts: post._id } },
                { new: true }
            ).populate('dr_posts');
        })
        .then((updatedDoctor) => {
            res.json({ updatedDoctor, message: 'New post added successfully' });
        })
        .catch((error) => {
            res.json({ message: 'Error adding post', error });
        });
};
// Retrieve all posts 
const getAllPostbyId = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((Doctor) => {
            if (!Doctor) {
                res.json({ message: 'Doctor not found' });
            }
            res.json({ posts: Doctor.dr_posts });
        })
        .catch((err) => {
            res.json({ message: 'Error retrieving posts', error: err });
        });
};
const findPostByIdDelete = async (req, res) => {
    const postIndex = req.params.index;
    const doctorId = req.params.id;

    try {
        // Find the doctor document
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Ensure that the postIndex is a valid index in the dr_posts array
        if (postIndex < 0 || postIndex >= doctor.dr_posts.length) {
            return res.status(400).json({ message: 'Invalid post index' });
        }

        // Extract the post ID to be deleted
        const postIdToDelete = doctor.dr_posts[postIndex];

        // Delete the post from the Post collection
        const deletedPost = await Post.findByIdAndDelete(postIdToDelete);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove the post reference from the doctor's dr_posts array
        doctor.dr_posts.splice(postIndex, 1);

        // Save the updated doctor document
        const updatedDoctor = await doctor.save();

        res.json({ updatedDoctor, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
const updatePostAtIndex = async (req, res) => {
    const { id: doctorId, index } = req.params;
    console.log('Received Doctor ID:', doctorId);
    console.log('Received Post Index:', index);

    // Validate Doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    try {
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if the index is within bounds
        if (index < 0 || index >= doctor.dr_posts.length) {
            return res.status(400).json({ message: 'Invalid post index' });
        }

        // Get the post ID from the doctor's dr_posts array
        const postId = doctor.dr_posts[index];

        // Update the content of the post
        const updatedPost = await Post.findByIdAndUpdate(postId, { content: req.body.content }, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ updatedPost, message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post', error });
    }
};
//For Appointments

const specificAppointmentsforDoctor = (req,res) => {
    const {doctorId} = req.params;
    Appointment.find({ doctor: doctorId })
    .populate('patient', 'patient_firstName patient_lastName') // Populate patient details
    .then(appointments => {
      res.status(200).json(appointments); // Return the appointments to the client
    })
    .catch(err => {
      res.status(500).json({ error: 'Error fetching appointments', details: err });
    });

};
const getAllAppointments = (req, res) => {
    const { doctorId } = req.params;
    
    Appointment.find({ doctor: doctorId })
      .populate('patient')
      .populate('doctor')
      .populate('secretary')
      .sort({ date: 1, time: 1 })
      .then((appointments) => {
        res.status(200).json(appointments);
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  };
const completeAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentID;

    // Find the appointment and update its status to 'Completed'
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'Completed' },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctorId = updatedAppointment.doctor;

    // Update doctor's activity status back to 'Online' or 'Offline'
    await Doctors.findByIdAndUpdate(
      doctorId,
      { activityStatus: 'Online' }, // or 'Offline' if that's the default
      { new: true }
    );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const acceptPatient = async (req, res) => {
    try {
        const appointmentId = req.params.uid; // Appointment ID from URL parameter

        // Find the appointment and update its status to 'Completed'
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Scheduled' },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Get doctor and patient IDs from the appointment
        const doctorId = updatedAppointment.doctor;
        const patientId = updatedAppointment.patient;

        // Update doctor's list of patients if the patient is not already in the list
        await Doctors.findByIdAndUpdate(
            doctorId,
            { $addToSet: { dr_patients: patientId } }, // AddToSet ensures no duplicates
            { new: true }
        );
        const patientObjectId = new mongoose.Types.ObjectId(updatedAppointment.patient._id);
        // Create a notification for the patient
        const notification = new Notification({
            message: `Your appointment with Dr. ${doctorId} has been scheduled.`,
            recipient: patientObjectId,
            recipientType: 'Patient'
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
const doctorAvailability = async (req, res) => {
    try {
        const { availability } = req.body;
        const doctor = await Doctors.findByIdAndUpdate(
            req.params.doctorId,
            { availability },
            { new: true }
        );
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getAvailability = async (req, res) => {
    try {
        const doctor = await Doctors.findById(req.params.doctorId).select('availability activeAppointmentStatus');
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateAvailability = async (req, res) => {
    try {
        const { activeAppointmentStatus } = req.body;
        const doctor = await Doctors.findByIdAndUpdate(
            req.params.doctorId,
            { activeAppointmentStatus },
            { new: true } // Set new: true to return the updated document
        );
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const requestDeactivation = async (req, res) => {
    try {
        const { reason } = req.body;

        // Set the deactivation request status and reason
        const doctor = await Doctors.findByIdAndUpdate(
            req.params.doctorId,
            { 
                deactivationRequest: {
                    requested: true,
                    reason,
                    confirmed: null
                }
            },
            { new: true }
        );

        // Notify the admin or medical secretary (e.g., send an email, or push notification)
        // For now, we'll just log it
        console.log(`Deactivation request for Doctor ${doctor.dr_firstName} ${doctor.dr_lastName} pending confirmation.`);

        res.status(200).json({ message: 'Deactivation request sent successfully', doctor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.uid; 
        const { newDate, newTime } = req.body; 

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { date: newDate, time: newTime, status:'Scheduled' },
            { new: true }
        ).populate('doctor').populate('patient'); 

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

   
        const doctorName = `${updatedAppointment.doctor.dr_firstName} ${updatedAppointment.doctor.dr_lastName}`;
        const patientName = `${updatedAppointment.patient.patient_firstName} ${updatedAppointment.patient.patient_lastName}`;

    
        const patientObjectId = new mongoose.Types.ObjectId(updatedAppointment.patient._id);
        const notification = new Notification({
            message: `Your appointment with Dr. ${doctorName} has been rescheduled to ${newDate} at ${newTime}.`,
            recipientType: 'Patient',
            recipient: patientObjectId
        });
        await notification.save();


        await Patient.findByIdAndUpdate(
            patientObjectId,
            { $push: { notifications: notification._id } },
            { new: true }
        );

        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const rescheduledStatus = async (req, res) => {
    try {
      const { rescheduledReason } = req.body;
      const appointmentId = req.params.uid; 

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: { rescheduledReason: rescheduledReason, status: 'Rescheduled' } }, 
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




//Prescription
const createPrescription = async (req, res) => {
    const { patientId, appointmentId } = req.params;
    const { gender, dateOfConsultation, doctor, medications } = req.body;

    try {
        let prescription = await Prescription.findOne({
            patient: patientId,
            doctor: doctor,
            appointment: appointmentId || null
        });

        if (prescription) {
       
            prescription.gender = gender;
            prescription.dateOfConsultation = dateOfConsultation;
            prescription.medications = medications;
            await prescription.save();
        } else {
    
            prescription = new Prescription({
                patient: patientId,
                appointment: appointmentId || null,
                gender,
                dateOfConsultation,
                doctor,
                medications
            });
            await prescription.save();


            const patient = await Patient.findById(patientId);
            if (patient) {
                patient.prescriptions.push(prescription._id);
                await patient.save();
            }


            const doctorRecord = await Doctors.findById(doctor);
            if (doctorRecord) {
                doctorRecord.dr_prescriptions.push(prescription._id);
                await doctorRecord.save();
            }


            if (appointmentId) {
                const appointment = await Appointment.findById(appointmentId);
                if (appointment) {
                    appointment.prescription = prescription._id;
                    await appointment.save();
                }
            }
        }

        res.status(201).json({ message: 'Prescription saved successfully', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
const getPrescriptionsByDoctor = async (req, res) => {
    const { doctorId } = req.params;

    try {
        const prescriptions = await Prescription.find({ doctor: doctorId })
            .populate('patient')
            .populate('doctor')
            .populate('appointment');

        if (!prescriptions.length) {
            return res.status(404).json({ message: 'No prescriptions found for this doctor' });
        }

        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
const getPrescriptions = async (req, res) => {
    const { patientId, appointmentId } = req.params;

    try {
        let query = { patient: patientId };
        if (appointmentId) {
            query.appointment = appointmentId;
        }

        const prescriptions = await Prescription.find(query)
            .populate('patient')
            .populate('doctor')
            .populate('appointment');

        if (!prescriptions.length) {
            return res.status(404).json({ message: 'No prescriptions found for this patient and appointment' });
        }

        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};





//Getting the patient
const getPatientsByDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        // Find the doctor and populate the dr_patients field
        const doctor = await Doctors.findById(doctorId).populate('dr_patients');

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json(doctor.dr_patients);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateDoctorBiography = async (req, res) => {
    try {
      const { id } = req.params;
      const { biography } = req.body;
  
      // Find and update the doctor's biography
      const updatedDoctor = await Doctors.findByIdAndUpdate(
        id,
        { biography },
        { new: true, runValidators: true }
      );
  
      if (!updatedDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.status(200).json({ message: 'Biography updated successfully', biography: updatedDoctor.biography });
    } catch (error) {
      console.error('Error updating biography:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  
  // Read (Get) Biography
// doctor_controller.js

// Get Doctor Biography
const getDoctorBiography = async (req, res) => {
    try {
      const { id } = req.params;
  
      const doctor = await Doctors.findById(id).select('biography');
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.status(200).json({ biography: doctor.biography });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching biography', error });
    }
  };
  
  
  // Delete Biography
// doctor_controller.js

// Delete Doctor Biography
const deleteDoctorBiography = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedDoctor = await Doctors.findByIdAndUpdate(
        id,
        { biography: {} },
        { new: true }
      );
  
      if (!updatedDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.status(200).json({ message: 'Biography deleted successfully', biography: updatedDoctor.biography });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting biography', error });
    }
  };
  

  const createDoctorSession = (req, res) => {
    const { userId, role } = req.body;
  
    if (role === "Physician") {
        req.session.userId = userId;  
        req.session.role = role;      
        
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
      // Step 1: Find the patient by email
      const doctor = await Doctors.findOne({ dr_email: email });
  
      if (!doctor) {
        return res.status(404).json({ message: 'No patient with that email found' });
      }
  
      // Step 2: Generate a reset token and set the expiry
      const token = crypto.randomBytes(20).toString('hex');
      doctor.resetPasswordToken = token;
      doctor.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes expiration
  
      // Step 3: Save the patient with the token and expiry
      await doctor.save();
  
      // Step 4: Configure nodemailer for sending emails
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // You can use other services like 'SendGrid', 'Yahoo', etc.
        auth: {
          user: staff_email.user, // Your email address
          pass: staff_email.pass, // Your email password or app-specific password
        },
      });
  
      // Construct the password reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password/doctor/${token}`;
      // const resetLink = `http://localhost:3000/reset-password/doctor/${token}`;
      const mailOptions = {
        to: doctor.dr_email,
        from: staff_email.user,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested a password reset for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process within 30 minutes:\n\n` +
              `${resetLink}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
  
  
      await transporter.sendMail(mailOptions);
  
  
      res.json({ message: `An email has been sent to ${doctor.dr_email} with further instructions.` });
  
    } catch (error) {
      console.error('Error in forgot password process:', error); // Log the error for debugging
      res.status(500).json({ message: 'Error in forgot password process', error });
    }
  };
  
  
    const resetPassword = async (req, res) => {
      const { token } = req.params;
      const { password } = req.body;
  
      try {
          const doctor = await Doctors.findOne({
              resetPasswordToken: token,
              resetPasswordExpires: { $gt: Date.now() },
          });
  
          if (!doctor) {
              return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
          }
  
          // Update password
          doctor.dr_password = password;
          doctor.resetPasswordToken = undefined;
          doctor.resetPasswordExpires = undefined;
  
          await doctor.save();
  
          res.json({ message: 'Password has been updated.' });
      } catch (error) {
          res.status(500).json({ message: 'Error in resetting password', error });
      }
  };


  const getDoctorHmo = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the doctor by ID and populate the dr_hmo field
      const doctor = await Doctors.findById(id).populate('dr_hmo');
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Return the populated dr_hmo array
      res.status(200).json({ dr_hmo: doctor.dr_hmo });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching HMOs', error });
    }
  };
  
  const getAllDoctorEmails = (req, res) => {
    console.log("Fetching doctor emails...");
    Doctors.find({}, 'dr_email')
        .then((doctors) => {
            console.log("Fetched doctors:", doctors);
            const emails = doctors.map(doctor => doctor.dr_email);
            res.json(emails);
        })
        .catch((err) => {
            console.error('Error fetching doctor emails:', err);
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};

const getAllDoctorEmailse = async (req, res) => {


  try {
      const doctors = await Doctors.find({}, 'dr_email').lean(); // Using lean() for better performance

      
      // Filtering out any null or undefined values in dr_email field
      const emails = doctors
          .map(doctor => doctor.dr_email)
          .filter(email => email !== null && email !== undefined);

      res.status(200).json(emails);
  } catch (err) {
      console.error('Error fetching doctor emails:', err);
      res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

const getAllContactNumbers = async (req, res) => {
  try {
    console.log("Fetching doctor contact numbers...");

    // Fetch only the `dr_contactNumber` field for all doctors, using lean for performance
    const doctors = await Doctors.find({}, 'dr_contactNumber').lean();

    if (!doctors.length) {
      return res.status(404).json({ message: 'No doctors found' });
    }

    console.log("Fetched doctors:", doctors);

    // Map through the doctors to get only the contact numbers
    const contactNumbers = doctors.map(doctor => doctor.dr_contactNumber);

    // Return the contact numbers as JSON
    res.status(200).json(contactNumbers);
  } catch (error) {
    console.error('Error fetching doctor contact numbers:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};




// Get all slots for a doctor
const getDoctorSlots = async (req, res) => {
  try {
    const doctor = await Doctors.findById(req.params.doctorId).select('slots');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ slots: doctor.slots });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving slots', error: err });
  }
};

// Update slots for a doctor
const updateDoctorSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    const doctor = await Doctors.findByIdAndUpdate(
      req.params.doctorId,
      { slots },
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ message: 'Slots updated successfully', slots: doctor.slots });
  } catch (err) {
    res.status(500).json({ message: 'Error updating slots', error: err });
  }
};
const changeDoctorPassword = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { dr_email, oldPassword, newPassword } = req.body;

    // Find the doctor by ID
    const doctor = await Doctors.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Verify that the email matches
    if (doctor.dr_email !== dr_email) {
      return res.status(400).json({ message: 'Email does not match.' });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, doctor.dr_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    // Update the password (it will be hashed in the pre-save hook)
    doctor.dr_password = newPassword;
    await doctor.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


module.exports = {
    NewDoctorSignUp,
    findAllDoctors,
    findDoctorByEmail,
    addNewPostById,
    getAllPostbyId,
    findPostByIdDelete,
    findDoctorById,
    updatePostAtIndex,
    getAllAppointments,
    completeAppointment,
    updateDoctorImage,
    updateDoctorDetails,
    createPrescription,
    getPrescriptionsByDoctor,
    getPatientsByDoctor,
    acceptPatient,
    setupTwoFactorForDoctor,
    verifyTwoFactor,
    sendOTP,
    verifyOTP,
    doctorAvailability,
    getAvailability,
    updateAvailability,
    findUniqueSpecialties,
    getPrescriptions,
    rescheduleAppointment,
    rescheduledStatus,
    findOneDoctor,
    offlineActivityStatus,
    updateDoctorStatus,
    requestDeactivation,
    specificAppointmentsforDoctor,
    updateDoctorBiography,
    getDoctorBiography,
    deleteDoctorBiography,
    loginDoctor,
    createDoctorSession,
    resetPassword, forgotPassword, 
    getDoctorHmo,
    getAllDoctorEmails, getAllDoctorEmailse, getAllContactNumbers,
    getDoctorSlots, updateDoctorSlots, changeDoctorPassword

};