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
      const { doctorId, date, time, reason, medium, paymentMethod } = req.body;
      const patientId = req.params.uid;
      const proofOfPayment = req.file ? `images/${req.file.filename}` : '';

      const newAppointment = new Appointment({
          patient: new mongoose.Types.ObjectId(patientId),
          doctor: new mongoose.Types.ObjectId(doctorId),
          date,
          time,
          reason,
          medium
      });

      const savedAppointment = await newAppointment.save();

      // Set payment status based on payment method
      let paymentStatus;
      if (paymentMethod === "Cash") {
          paymentStatus = "Unpaid";
      } else if (paymentMethod === "GCash" || paymentMethod === "Bank Transfer") {
          paymentStatus = "Review";
      }

      // Create a new payment document
      const newPayment = new Payment({
          appointment: savedAppointment._id,
          paymentMethod,
          paymentStatus,
          proofOfPayment 
      });

      const savedPayment = await newPayment.save();

      // Reference the payment in the appointment
      savedAppointment.payment = savedPayment._id;
      await savedAppointment.save();

      // Update related documents
      await Doctors.findByIdAndUpdate(doctorId, { $push: { dr_appointments: savedAppointment._id } });
      await Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } });

      // Create notifications
      const notifications = [
          { message: `You have a pending appointment scheduled on ${date} at ${time}.`, recipient: patientId, type: 'Patient' },
          { message: `You have a new pending appointment scheduled with a patient on ${date} at ${time}.`, recipient: doctorId, type: 'Doctor' }
      ];

      for (const notification of notifications) {
          const newNotification = new Notification({
              message: notification.message,
              recipient: new mongoose.Types.ObjectId(notification.recipient),
              recipientType: notification.type
          });
          await newNotification.save();

          // Update the corresponding patient's or doctor's notifications array
          if (notification.type === 'Patient') {
              await Patient.findByIdAndUpdate(notification.recipient, { $push: { notifications: newNotification._id } });
          } else if (notification.type === 'Doctor') {
              await Doctors.findByIdAndUpdate(notification.recipient, { $push: { notifications: newNotification._id } });
          }
      }

      res.status(201).json(savedAppointment);
  } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
  }
};



const updatePaymentStatus = (req, res) => {
  const appointmentId = req.params.id;
  const { paymentStatus, inexactAmount } = req.body;

  console.log('Request body:', req.body);

  if (!['Paid', 'Unpaid', 'Inexact', 'Refund'].includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  Appointment.findById(appointmentId)
    .populate('payment')
    .populate('patient')
    .populate('doctor')
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const updateFields = { paymentStatus };

      if (paymentStatus === 'Inexact') {
        if (typeof inexactAmount === 'undefined' || inexactAmount === null) {
          return res.status(400).json({ message: 'Inexact amount is required for inexact payment status' });
        }
        updateFields.inexactAmount = Number(inexactAmount);
      } else {
        updateFields.inexactAmount = null;
      }

      return Payment.findByIdAndUpdate(appointment.payment._id, updateFields, { new: true })
        .then(updatedPayment => {
          if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
          }

          if (paymentStatus === 'Inexact') {
            const patientName = `${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}`;
            const doctorName = `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_lastName}`;
            const message = `Patient ${patientName} has an inexact payment of ₱${inexactAmount} for the appointment with Dr. ${doctorName} on ${new Date(appointment.date).toLocaleDateString()}.`;

            const newNotification = new Notification({
              message,
              recipient: appointment.patient._id,
              recipientType: 'Patient'
            });

            //Pushing the id into the notification of the patient
            return newNotification.save().then(savedNotification => {
              appointment.patient.notifications.push(savedNotification._id);

              return appointment.patient.save().then(() => {
                res.status(200).json({
                  message: 'Payment status updated successfully, notification sent to patient',
                  payment: updatedPayment
                });
              });
            });
          }
          
          // add another elif
          
          
          else {
            res.status(200).json({
              message: 'Payment status updated successfully',
              payment: updatedPayment
            });
          }
        });
    })
    .catch(error => {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: `Failed to update payment status: ${error.message}` });
    });
};





  

module.exports = {
  createAppointment,
  updatePaymentStatus
};
