const mongoose = require('mongoose');
const MedicalSecretary = require('./medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')



const NewMedicalSecretaryignUp = (req, res) => {
    MedicalSecretary.create(req.body)
        .then((newMedicalSecretary) => {
             res.json({ newMedicalSecretary: newMedicalSecretary, status: "Successfully registered Medical Secretary." });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong. Please try again.', error: err });
        });
};

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

        // Find the appointment and update its status to 'Completed'
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
        today.setHours(0, 0, 0, 0);

        // Count total pending patients
        const pendingPatientsCount = await Appointment.countDocuments({ status: 'Pending' });

        // Count total today's patients
        const todaysPatientsCount = await Appointment.countDocuments({
            date: today,
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




module.exports = {
    NewMedicalSecretaryignUp,
    findAllMedicalSecretary,
    getAllAppointments,
    ongoingAppointment,
    getPatientStats


};
