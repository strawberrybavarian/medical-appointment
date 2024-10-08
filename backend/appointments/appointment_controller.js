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
    const { doctor, date, time, reason, medium, appointment_type } = req.body; 
    const patientId = req.params.uid;

    // Validate essential data
    if (!date || !reason || !appointment_type) {
      return res.status(400).json({ message: 'Date, reason, and appointment type are required.' });
    }

    // Create a new appointment object
    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      date,
      time,
      reason,
      medium,
      appointment_type 
    });

    // Attach the doctor if provided
    if (doctor) {
      newAppointment.doctor = new mongoose.Types.ObjectId(doctor);
    }

    // Save the new appointment
    const savedAppointment = await newAppointment.save();

    // Update doctor and patient records concurrently
    const updateTasks = [
      Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } })
    ];

    if (doctor) {
      updateTasks.push(
        Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } })
      );
    }

    await Promise.all(updateTasks);

    // Prepare notifications
    const notifications = [
      { message: `You have a pending appointment scheduled on ${date} at ${time}.`, recipient: patientId, type: 'Patient' },
    ];

    if (doctor) {
      notifications.push({
        message: `You have a new pending appointment scheduled with a patient on ${date} at ${time}.`,
        recipient: doctor,
        type: 'Doctor'
      });
    }

    // Save notifications concurrently
    const notificationTasks = notifications.map(async (notification) => {
      const newNotification = new Notification({
        message: notification.message,
        recipient: new mongoose.Types.ObjectId(notification.recipient),
        recipientType: notification.type
      });

      const savedNotification = await newNotification.save();

      if (notification.type === 'Patient') {
        return Patient.findByIdAndUpdate(notification.recipient, { $push: { notifications: savedNotification._id } });
      } else if (notification.type === 'Doctor') {
        return Doctors.findByIdAndUpdate(notification.recipient, { $push: { notifications: savedNotification._id } });
      }
    });

    await Promise.all(notificationTasks);

    // Return the saved appointment as a response
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
  }
};


const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: `Failed to fetch appointment: ${error.message}` });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;  // Extract status from the request body
    const appointmentId = req.params.id;  // Get appointment ID from the request parameters

    // Ensure status is valid (excluding 'Rescheduled')
    const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 'Missed', 'For Payment', "To-send"];
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

// Your updated controller for updating appointment with time in "AM/PM" format
const updateAppointmentDetails = async (req, res) => {
  try {
      const { doctor, date, time, appointment_type } = req.body; // time should be in "01:00 PM" format
      const appointmentId = req.params.appointmentId;

      // Find the appointment by its ID and update the fields
      const updatedAppointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          { 
              doctor: new mongoose.Types.ObjectId(doctor), 
              date, 
              time,
              appointment_type // Save time as a string, e.g., "01:00 PM"
          },
          { new: true }
      );

      res.status(200).json(updatedAppointment);
  } catch (error) {
      res.status(500).json({ message: `Failed to update appointment: ${error.message}` });
  }
};


module.exports = {
  createAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointmentDetails,

};
