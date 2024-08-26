const mongoose = require('mongoose');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Cashier = require('./cashier_model')


const NewCashierignUp = (req, res) => {
    Cashier.create(req.body)
        .then((newCashier) => {
            res.json({ newCashier: newCashier, status: "Successfully registered Cashier." });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong. Please try again.', error: err });
        });
};

const findAllCashier = (req, res) => {
    Cashier.find()
        .then((allDataCashier) => {
            res.json({ theCashier: allDataCashier }
                
            );
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};

const getAllAppointments = (req, res) => {
    Cashier.find()
        .populate('patient')
        .populate('doctor')
        .then((AllAppointments)  =>  {
          
            res.json({Appointments:AllAppointments} ) ;
        })
        .catch((err) => {
            res.json({message: 'Something went wrong', error: err})
        })
}

const completedAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.uid; // Appointment ID from URL parameter

        // Find the appointment and update its status to 'Completed'
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Completed' },
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



const inexactAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.uid; // Appointment ID from URL parameter

        // Find the appointment and update its status to 'Completed'
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Inexact' },
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
            message: `You have inexact amount.`,
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


module.exports = {
    NewCashierignUp,
    findAllCashier,
    completedAppointment,
    inexactAppointment


};
