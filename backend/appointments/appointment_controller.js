const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model');
const Patient = require('../patient/patient_model');
const Doctors = require('../doctor/doctor_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Notification = require('../notifications/notifications_model');
const mongoose = require('mongoose');
const Payment = require('../payments/payment_model');
const Audit = require('../audit/audit_model');
const Admin = require('../admin/admin_model');
const Service = require('../services/service_model');
const Doctor = require('../doctor/doctor_model');


const updateFollowUpStatus = async (req, res) => {
  const appointmentId = req.params.id;
  const { followUp } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { followUp }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.json({ message: 'Follow-up status updated successfully.', appointment });
  } catch (error) {
    console.error('Error updating follow-up status:', error);
    res.status(500).json({ message: 'Failed to update follow-up status.' });
  }
};


const decreaseSlot = async (doctorId, date, timePeriod) => {
  try {
    // Find the doctor
    const doctor = await Doctors.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Determine the day of the week from the appointment date
    const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

    // Get the availability for the corresponding day
    const availability = doctor.availability[dayOfWeek];

    if (!availability) {
      throw new Error(`No availability found for ${dayOfWeek}`);
    }

    // Update the slot based on the time period (morning/afternoon)
    if (timePeriod === 'morning' && availability.morning.maxPatients > 0) {
      availability.morning.maxPatients -= 1;
    } else if (timePeriod === 'afternoon' && availability.afternoon.maxPatients > 0) {
      availability.afternoon.maxPatients -= 1;
    } else {
      throw new Error('No slots available for the selected time period');
    }

    // Save the updated doctor document
    await doctor.save();
    console.log('Slot decreased successfully');
  } catch (error) {
    console.error('Error decreasing slot:', error.message);
    throw error;
  }
};

const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason, medium, appointment_type } = req.body;
    const patientId = req.params.uid;

    if (!date || !time || !reason) {
      return res.status(400).json({ message: 'Date, Time, and Primary Concern are required.' });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

    // **Check if the patient already has an active appointment**
    const existingAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $nin: ['Cancelled', 'Completed'] }, // Exclude cancelled and completed appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'You already have an active appointment. Please complete or cancel it before booking a new one.'
      });
    }

    // Existing code remains intact
    const [patientData, doctorData] = await Promise.all([
      Patient.findById(patientId).select('patient_firstName patient_lastName'),
      Doctors.findById(doctor).select('dr_firstName dr_lastName availability bookedSlots'),
    ]);

    if (!patientData) return res.status(404).json({ message: 'Patient not found.' });
    if (!doctorData) return res.status(404).json({ message: 'Doctor not found.' });

    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const availability = doctorData.availability[dayOfWeek];

    // Convert time to 24-hour format
    const [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);

    const timePeriod = parseInt(startTime.split(':')[0]) < 12 ? 'morning' : 'afternoon';

    if (!availability || !availability[timePeriod]?.available) {
      return res.status(400).json({
        message: `No available slots for ${timePeriod} on ${dayOfWeek}.`
      });
    }

    // Default to 'Consultation' if no appointment_type is provided
    const finalAppointmentType = appointment_type?.appointment_type || "Consultation";

    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      doctor: new mongoose.Types.ObjectId(doctor),
      date,
      time: `${startTime} - ${endTime}`, // Save time in 24-hour format
      reason,
      medium,
      appointment_type: { appointment_type: finalAppointmentType, category: "General" },
      status: 'Pending', // Set status to 'Pending'
    });

    const savedAppointment = await newAppointment.save();

    await Promise.all([
      Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } }),
    ]);

    // **Send Notifications to Medical Secretaries and Admins**
    const [medicalSecretaries, admins] = await Promise.all([
      MedicalSecretary.find({}, '_id'),
      Admin.find({}, '_id'),
    ]);

    const recipients = [...medicalSecretaries.map(ms => ms._id), ...admins.map(ad => ad._id)];

    const notificationMessage = `New pending appointment created by ${patientData.patient_firstName} ${patientData.patient_lastName}.`;

    const notification = new Notification({
      message: notificationMessage,
      recipient: recipients,
      recipientType: 'Admin', // Adjust based on your schema
      type: 'Appointment',
    });

    await notification.save();

    // Optionally, update each recipient's notifications array
    // Uncomment the following code if you have notifications array in your Admin and MedicalSecretary models
    /*
    await Promise.all(
      recipients.map(userId => {
        // Replace User with Admin or MedicalSecretary model as appropriate
        return Admin.findByIdAndUpdate(userId, { $push: { notifications: notification._id } });
      })
    );
    */

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
  }
};


const createServiceAppointment = async (req, res) => {
  try {
    const { date, reason, appointment_type, serviceId } = req.body;
    const patientId = req.params.uid;

    // Validate essential data
    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and Primary Concern are required' });
    }

    // **Check if the patient already has an active appointment**
    const existingAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $nin: ['Cancelled', 'Completed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'You already have an active appointment. Please complete or cancel it before booking a new one.'
      });
    }

    // Existing code remains intact
    const patientData = await Patient.findById(patientId).select('patient_firstName patient_lastName');
    if (!patientData) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const serviceData = await Service.findById(serviceId).select('name category availability');
    if (!serviceData) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check service availability
    if (serviceData.availability === "Not Available" || serviceData.availability === "Coming Soon") {
      return res.status(400).json({ message: `The selected service (${serviceData.name}) is currently not available.` });
    }

    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      service: new mongoose.Types.ObjectId(serviceId),
      date,
      reason,
      appointment_type: {
        appointment_type: serviceData.name,
        category: serviceData.category
      },
      status: 'Pending',
    });

    const savedAppointment = await newAppointment.save();

    await Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } });

    // Audit log for the created service appointment
    const patientFullName = `${patientData.patient_firstName} ${patientData.patient_lastName}`;
    const auditData = {
      user: patientId,
      userType: 'Patient',
      action: 'Create Service Appointment',
      description: `Appointment created for patient: ${patientFullName} for service: ${serviceData.name} on ${date}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const audit = new Audit(auditData);
    await audit.save();

    await Patient.findByIdAndUpdate(patientId, { $push: { audits: audit._id } });

    // **Send Notifications to Medical Secretaries and Admins**
    const [medicalSecretaries, admins] = await Promise.all([
      MedicalSecretary.find({}, '_id'),
      Admin.find({}, '_id'),
    ]);

    const recipients = [...medicalSecretaries.map(ms => ms._id), ...admins.map(ad => ad._id)];

    const notificationMessage = `New service appointment created by ${patientData.patient_firstName} ${patientData.patient_lastName} for ${serviceData.name}.`;

    const notification = new Notification({
      message: notificationMessage,
      recipient: recipients,
      recipientType: 'Admin', // Adjust if needed
      type: 'Appointment',
    });

    await notification.save();

    // Optionally, add notification to each recipient's notifications array
    /*
    await Promise.all(
      recipients.map(userId => {
        return Admin.findByIdAndUpdate(userId, { $push: { notifications: notification._id } });
      })
    );
    */

    res.status(201).json(savedAppointment);

  } catch (error) {
    console.error('Error creating service appointment:', error);
    res.status(500).json({ message: `Failed to create service appointment: ${error.message}` });
  }
};




// Utility function to convert 12-hour time to 24-hour format
function convertTo24HourFormat(time) {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


function convertTo24HourFormat(time) {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Helper function to convert 12-hour format to 24-hour format

//Counter para sa booked patient and also pang roll back if may nag cancel ng appointment nila
const countBookedPatients = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  try {
    const doctor = await Doctors.findById(doctorId).select('bookedSlots');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    const formattedDate = new Date(date).toISOString().split('T')[0];

    let bookedSlot = doctor.bookedSlots.find(
      (slot) => slot.date.toISOString().split('T')[0] === formattedDate
    );

    if (!bookedSlot) {
      bookedSlot = { date: new Date(date), morning: 0, afternoon: 0 };
      doctor.bookedSlots.push(bookedSlot);
      await doctor.save();
    }

    const morningCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: new Date(date),
      time: { $regex: /^(0[0-9]|1[01]):[0-5][0-9]/ },
      status: 'Scheduled', // Only count scheduled appointments
    });

    const afternoonCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: new Date(date),
      time: { $regex: /^(1[2-9]|2[0-3]):[0-5][0-9]/ },
      status: 'Scheduled', // Only count scheduled appointments
    });

    bookedSlot.morning = morningCount;
    bookedSlot.afternoon = afternoonCount;

    doctor.markModified('bookedSlots');
    await doctor.save();

    res.json({ morning: bookedSlot.morning, afternoon: bookedSlot.afternoon });
  } catch (error) {
    console.error('Error counting booked patients:', error);
    res.status(500).json({ message: 'Error counting booked patients' });
  }
};


const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    // Validate status
    const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 'To-send', 'For Payment', 'Upcoming'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    // Fetch the appointment with populated doctor and patient data
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'dr_firstName dr_lastName bookedSlots availability')
      .populate('patient', 'patient_firstName patient_lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;

    // Save appointment status update
    await appointment.save();

    // **Send Notification to Doctor if status becomes 'Scheduled' or 'Upcoming'**
    if ((status === 'Scheduled' || status === 'Upcoming') && appointment.doctor) {
      const notificationMessage = `Appointment with ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName} is now ${status}.`;
      const doctorNotification = new Notification({
        message: notificationMessage,
        recipient: [appointment.doctor._id],
        recipientType: 'Doctor',
        type: 'StatusUpdate',
      });
      await doctorNotification.save();

      // Optionally, add notification to doctor's notifications array
      await Doctors.findByIdAndUpdate(appointment.doctor._id, { $push: { notifications: doctorNotification._id } });
    }

    // **Send Notification to Patient if status changes**
    if (['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].includes(status) && oldStatus !== status) {
      // Include the appointment_ID in the notification message
      const notificationMessage = `Your appointment ${appointment.appointment_ID} status has been updated to ${status}.`;
      const patientNotification = new Notification({
        message: notificationMessage,
        recipient: [appointment.patient._id],
        recipientType: 'Patient',
        type: 'StatusUpdate',
      });
      await patientNotification.save();

      // Optionally, add notification to patient's notifications array
      await Patient.findByIdAndUpdate(appointment.patient._id, { $push: { notifications: patientNotification._id } });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: `Failed to update status: ${error.message}` });
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

// Your updated controller for updating appointment with time in "AM/PM" format
const updateAppointmentDetails = async (req, res) => {
  try {
    const { doctor, date, time, appointment_type, reason } = req.body;
    const appointmentId = req.params.appointmentId;

    // Check if the time is a single value or a range
    let startTime, endTime;
    if (time.includes(' - ')) {
      [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);
    } else {
      startTime = convertTo24HourFormat(time);
      endTime = ''; // No end time in the single-time case
    }

    // Build the update object dynamically
    const updateData = {
      date,
      time: endTime ? `${startTime} - ${endTime}` : startTime,
      reason,
      appointment_type,
      status: 'Pending',
    };

    // If a doctor is provided, add it to the update object; otherwise, unset it
    if (doctor) {
      updateData.doctor = new mongoose.Types.ObjectId(doctor);
    } else {
      updateData.$unset = { doctor: "" }; // Unset the doctor field if not provided
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate('patient', 'patient_firstName patient_lastName');

    // **Send Notification to Patient about Appointment Update**
    const notificationMessage = `Your appointment details have been updated. Please check the new details.`;
    const patientNotification = new Notification({
      message: notificationMessage,
      recipient: [updatedAppointment.patient._id],
      recipientType: 'Patient',
      type: 'AppointmentUpdate',
    });
    await patientNotification.save();

    // Optionally, add notification to patient's notifications array
    await Patient.findByIdAndUpdate(updatedAppointment.patient._id, { $push: { notifications: patientNotification._id } });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error.message);
    res.status(500).json({ message: `Failed to update appointment: ${error.message}` });
  }
};

const updatePatientAppointmentDetails = async (req, res) => {
  try {
    const { doctor, date, time, appointment_type, reason, findings, cancelReason } = req.body;
    const oldAppointmentId = req.params.appointmentId;

    const oldAppointment = await Appointment.findById(oldAppointmentId);
    if (!oldAppointment) {
      return res.status(404).json({ message: 'Original appointment not found' });
    }

    oldAppointment.status = 'Archived';
    oldAppointment.followUp = false;
    await oldAppointment.save();

    const [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);

    const newAppointmentData = {
      patient: oldAppointment.patient,
      doctor: doctor,
      date: date,
      time: `${startTime} - ${endTime}`, // Store time in 24-hour format
      reason: reason,
      appointment_type: appointment_type,
      status: 'Pending',
      followUp: true,
      findings: findings,
    };

    const newAppointment = new Appointment(newAppointmentData);
    const savedAppointment = await newAppointment.save();

    await Promise.all([
      Patient.findByIdAndUpdate(oldAppointment.patient, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } })
    ]);

    const doctorsapp = await Doctors.findById(oldAppointment.doctor);
    const auditData = {
      user: oldAppointment.patient._id,
      userType: 'Patient',
      action: 'Scheduled Follow Up Appointment',
      description: `Follow-up with Dr. ${doctorsapp.dr_firstName} ${doctorsapp.dr_lastName} on ${oldAppointment.date.toLocaleDateString()} at ${oldAppointment.time} was cancelled. Reason: ${cancelReason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const audit = await new Audit(auditData).save();
    const patient = await Patient.findById(oldAppointment.patient);
    if (patient) {
      patient.audits.push(audit._id);
      await patient.save();
    }

    // **Send Notifications**

    // Notify Patient about the new follow-up appointment
    const patientNotification = new Notification({
      message: `Your follow-up appointment has been scheduled on ${date} at ${time}.`,
      recipient: [oldAppointment.patient],
      recipientType: 'Patient',
      type: 'Appointment',
    });
    await patientNotification.save();

    await Patient.findByIdAndUpdate(oldAppointment.patient, { $push: { notifications: patientNotification._id } });

    // Notify Doctor about the new appointment
    const doctorNotification = new Notification({
      message: `New follow-up appointment scheduled with patient ID ${oldAppointment.patient}.`,
      recipient: [doctor],
      recipientType: 'Doctor',
      type: 'Appointment',
    });
    await doctorNotification.save();

    await Doctors.findByIdAndUpdate(doctor, { $push: { notifications: doctorNotification._id } });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error scheduling follow-up appointment:', error.message);
    res.status(500).json({ message: `Failed to schedule follow-up appointment: ${error.message}` });
  }
};




module.exports = {
  createAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointmentDetails,
  countBookedPatients, 
  createServiceAppointment,
  updateFollowUpStatus,
  updatePatientAppointmentDetails

};
