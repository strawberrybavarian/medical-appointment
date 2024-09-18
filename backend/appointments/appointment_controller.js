const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model');
const Patient = require('../patient/patient_model');
const Doctors = require('../doctor/doctor_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Notification = require('../notifications/notifications_model');
const mongoose = require('mongoose');
const Payment = require('../payments/payment_model');


const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, medium, appointment_type } = req.body; // Include appointment_type
    const patientId = req.params.uid;

    // Create the new appointment object
    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      date,
      time,
      reason,
      medium,
      appointment_type // Add appointment_type to the appointment schema
    });

    // Only add the doctor if doctorId is provided
    if (doctorId) {
      newAppointment.doctor = new mongoose.Types.ObjectId(doctorId);
    }

    // Save the new appointment
    const savedAppointment = await newAppointment.save();

    // If a doctorId is provided, update the doctor's appointments
    if (doctorId) {
      await Doctors.findByIdAndUpdate(doctorId, { $push: { dr_appointments: savedAppointment._id } });
    }

    // Update the patient's appointments
    await Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } });

    // Create notifications
    const notifications = [
      { message: `You have a pending appointment scheduled on ${date} at ${time}.`, recipient: patientId, type: 'Patient' },
    ];

    // If a doctorId is provided, create a notification for the doctor
    if (doctorId) {
      notifications.push({
        message: `You have a new pending appointment scheduled with a patient on ${date} at ${time}.`,
        recipient: doctorId,
        type: 'Doctor'
      });
    }

    // Save notifications and update respective records
    for (const notification of notifications) {
      const newNotification = new Notification({
        message: notification.message,
        recipient: new mongoose.Types.ObjectId(notification.recipient),
        recipientType: notification.type
      });
      await newNotification.save();

      if (notification.type === 'Patient') {
        await Patient.findByIdAndUpdate(notification.recipient, { $push: { notifications: newNotification._id } });
      } else if (notification.type === 'Doctor') {
        await Doctors.findByIdAndUpdate(notification.recipient, { $push: { notifications: newNotification._id } });
      }
    }

    // Return the saved appointment as a response
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
  }
};


const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;  // Extract status from the request body
    const appointmentId = req.params.id;  // Get appointment ID from the request parameters

    // Ensure status is valid (excluding 'Rescheduled')
    const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 'Missed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    // Update the status of the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },  // Only update the status field
      { new: true }  // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: `Failed to update appointment status: ${error.message}` });
  }
};
  

module.exports = {
  createAppointment,
  updateAppointmentStatus,

};
