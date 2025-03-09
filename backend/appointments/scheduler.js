// scheduler.js

const cron = require('node-cron');
const Appointment = require('./appointment_model');
const Notification = require('../notifications/notifications_model');
const Patient = require('../patient/patient_model');
const Doctor = require('../doctor/doctor_model');
const socket = require('../socket'); 
const { DateTime } = require('luxon'); 

const TIME_ZONE = 'Asia/Manila'; 

const updateMissedAppointments = async () => {
  try {
    console.log('Running updateMissedAppointments job...');

    const now = DateTime.now().setZone(TIME_ZONE);
    console.log('Current date and time:', now.toISO());

    const appointments = await Appointment.find({
      status: { $nin: ['Completed', 'Cancelled', 'Missed'] },
    })
      .populate('doctor', 'dr_firstName dr_lastName')
      .populate('patient', 'patient_firstName patient_lastName');

    console.log(`Fetched ${appointments.length} appointments for evaluation.`);

    const missedAppointments = [];

    for (const appointment of appointments) {
      // Ensure appointment has a date and time
      if (!appointment.date || !appointment.time) {
        console.warn(`Appointment ${appointment._id} is missing date or time. Skipping.`);
        continue;
      }

      // Correctly parse appointment date in UTC and convert to TIME_ZONE
      const appointmentDateTime = DateTime.fromJSDate(appointment.date, { zone: 'utc' }).setZone(TIME_ZONE);
      const appointmentDateStr = appointmentDateTime.toFormat('yyyy-MM-dd');

      const timeRange = appointment.time;
      const timeParts = timeRange.split(' - ');

      if (timeParts.length !== 2) {
        console.warn(`Appointment ${appointment._id} has invalid time format. Skipping.`);
        continue;
      }

      const [_, endTimeStr] = timeParts;

      // Combine date and end time
      const appointmentEndDateTime = DateTime.fromFormat(
        `${appointmentDateStr} ${endTimeStr}`,
        'yyyy-MM-dd HH:mm',
        { zone: TIME_ZONE }
      );

      if (!appointmentEndDateTime.isValid) {
        console.warn(`Appointment ${appointment._id} has invalid end datetime. Skipping.`);
        continue;
      }

      // Log the calculated values for debugging
      console.log(`Appointment ID: ${appointment._id}`);
      console.log(`Appointment Date: ${appointmentDateStr}`);
      console.log(`Appointment End Time: ${endTimeStr}`);
      console.log(`Appointment End DateTime: ${appointmentEndDateTime.toISO()}`);
      console.log(`Current DateTime: ${now.toISO()}`);

      // Compare appointmentEndDateTime with now
      if (appointmentEndDateTime <= now) {
        console.log(`Appointment ${appointment._id} is missed.`);
        missedAppointments.push(appointment);
      } else {
        console.log(`Appointment ${appointment._id} is not missed.`);
      }
    }

    console.log(`Found ${missedAppointments.length} missed appointments.`);

    const io = socket.getIO();
    const clients = socket.clients;

    for (const appointment of missedAppointments) {
      const oldStatus = appointment.status;
      appointment.status = 'Missed';

      await appointment.save();

      // Patient Notification
      const patientNotificationMessage = `Your appointment ${
        appointment.appointment_ID || appointment._id
      } has been marked as Missed.`;
      const patientNotification = new Notification({
        message: patientNotificationMessage,
        receiver: appointment.patient._id,
        receiverModel: 'Patient',
        isRead: false,
        link: `/myappointment`,
        type: 'StatusUpdate',
        recipientType: 'Patient',
      });
      await patientNotification.save();

      await Patient.findByIdAndUpdate(appointment.patient._id, {
        $push: { notifications: patientNotification._id },
      });

      const patientSocket = clients[appointment.patient._id.toString()];
      if (patientSocket && patientSocket.userRole === 'Patient') {
        patientSocket.emit('appointmentStatusUpdate', {
          message: patientNotificationMessage,
          appointmentId: appointment._id,
          patientId: appointment.patient._id,
          status: 'Missed',
          link: `/myappointment`,
          notificationId: patientNotification._id.toString(),
        });
      }

      // Doctor Notification
      const doctorNotificationMessage = `Appointment with ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName} has been marked as Missed.`;
      const doctorNotification = new Notification({
        message: doctorNotificationMessage,
        receiver: appointment.doctor._id,
        receiverModel: 'Doctor',
        isRead: false,
        link: `/appointments/${appointment._id}`,
        type: 'StatusUpdate',
        recipientType: 'Doctor',
      });
      await doctorNotification.save();

      await Doctor.findByIdAndUpdate(appointment.doctor._id, {
        $push: { notifications: doctorNotification._id },
      });

      const doctorSocket = clients[appointment.doctor._id.toString()];
      if (doctorSocket && doctorSocket.userRole === 'Doctor') {
        doctorSocket.emit('appointmentStatusUpdate', {
          message: doctorNotificationMessage,
          appointmentId: appointment._id,
          doctorId: appointment.doctor._id,
          status: 'Missed',
          link: `/appointments/${appointment._id}`,
          notificationId: doctorNotification._id.toString(),
        });
      }

      console.log(`Appointment ${appointment._id} marked as Missed.`);
    }

    console.log('updateMissedAppointments job completed.');
  } catch (error) {
    console.error('Error updating missed appointments:', error);
  }
};

// cron.schedule('* * * * *', () => {
//   updateMissedAppointments();
// });

module.exports = {
  updateMissedAppointments,
};