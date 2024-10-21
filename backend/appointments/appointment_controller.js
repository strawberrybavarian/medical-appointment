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

    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and Primary Concern are required.' });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

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
      return res.status(400).json({ message: `No available slots for ${timePeriod} on ${dayOfWeek}.` });
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
      appointment_type: { appointment_type: finalAppointmentType, category: "General" }, // Use the final appointment type
      status: 'Pending', // Set status to 'Pending'
    });

    const savedAppointment = await newAppointment.save();

    await Promise.all([
      Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } }),
    ]);

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
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

    console.log(`Received request to update appointment status to: ${status}`);

    // Validate status
    const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 'To-send', 'For Payment'];
    if (!validStatuses.includes(status)) {
      console.error(`Invalid status: ${status}`);
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    // Fetch the appointment with populated doctor data (if available)
    const appointment = await Appointment.findById(appointmentId).populate('doctor', 'bookedSlots availability');

    if (!appointment) {
      console.error('Appointment not found.');
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    console.log(`Fetched appointment: ${JSON.stringify(appointment, null, 2)}`);

    const { doctor, date, time } = appointment;

    // If no doctor is assigned, skip slot and availability logic
    if (!doctor) {
      console.warn('No doctor assigned to this appointment.');

      // Just update the status without dealing with doctor availability or slots
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true }
      );

      console.log(`Updated appointment without doctor: ${JSON.stringify(updatedAppointment, null, 2)}`);
      return res.status(200).json(updatedAppointment);
    }

    const [startTime] = time.split(' - ').map(convertTo24HourFormat);
    const timePeriod = parseInt(startTime.split(':')[0]) < 12 ? 'morning' : 'afternoon';

    console.log(`Time period determined as: ${timePeriod}`);

    const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    console.log(`Day of the week: ${dayOfWeek}`);

    const availability = doctor.availability?.[dayOfWeek]?.[timePeriod];
    console.log(`Availability object for ${dayOfWeek} ${timePeriod}:`, availability);

    if (!availability) {
      console.error(`No availability found for ${dayOfWeek} ${timePeriod}.`);
      return res.status(400).json({
        message: `No available slots for ${timePeriod} on ${dayOfWeek}.`,
      });
    }

    const maxPatients = availability.maxPatients;
    console.log(`Max patients for ${dayOfWeek} ${timePeriod}: ${maxPatients}`);

    if (maxPatients === undefined) {
      console.error(`Max patients for ${dayOfWeek} ${timePeriod} is undefined.`);
      return res.status(400).json({
        message: `Doctor availability not properly configured.`,
      });
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];
    const bookedSlot = doctor.bookedSlots.find(
      (slot) => slot.date.toISOString().split('T')[0] === formattedDate
    );

    if (!bookedSlot) {
      console.error(`No booked slot found for date: ${formattedDate}.`);
      return res.status(400).json({
        message: 'No booked slots found for the selected date.',
      });
    }

    const currentCount = timePeriod === 'morning' ? bookedSlot.morning : bookedSlot.afternoon;
    console.log(`Current count for ${timePeriod}: ${currentCount}`);

    // Check if the slot is already full
    if (status === 'Scheduled' && currentCount >= maxPatients) {
      console.error(`Cannot schedule. ${timePeriod} slot is already full.`);
      return res.status(400).json({
        message: `No available slots for the ${timePeriod}. Please choose another time.`,
      });
    }

    // Update the slot count based on the status change
    if (status === 'Scheduled') {
      if (timePeriod === 'morning') bookedSlot.morning += 1;
      else bookedSlot.afternoon += 1;
      console.log(`${timePeriod} slot count increased.`);
    } else if (appointment.status === 'Scheduled' && status !== 'Scheduled') {
      if (timePeriod === 'morning') bookedSlot.morning -= 1;
      else bookedSlot.afternoon -= 1;
      console.log(`${timePeriod} slot count rolled back.`);
    }

    // Save the updated doctor data
    doctor.markModified('bookedSlots');
    await doctor.save();
    console.log('Doctor slot update saved.');

    // Update the appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    console.log(`Updated appointment: ${JSON.stringify(updatedAppointment, null, 2)}`);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: `Failed to update status: ${error.message}` });
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

    // Fetch the patient's details (first and last name)
    const patientData = await Patient.findById(patientId).select('patient_firstName patient_lastName');
    if (!patientData) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch the service details
    const serviceData = await Service.findById(serviceId).select('name category availability');
    if (!serviceData) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check service availability
    if (serviceData.availability === "Not Available" || serviceData.availability === "Coming Soon") {
      return res.status(400).json({ message: `The selected service (${serviceData.name}) is currently not available.` });
    }

    // Create a new appointment object without specific doctor or time
    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      service: new mongoose.Types.ObjectId(serviceId),
      date,
      reason,
      appointment_type: {
        appointment_type: serviceData.name,
        category: serviceData.category
      },
      
    });

    // Save the new appointment
    const savedAppointment = await newAppointment.save();

    // Update the patient's appointments array
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

    // Push the audit to the patient's audits array
    await Patient.findByIdAndUpdate(patientId, { $push: { audits: audit._id } });

    // Return the saved appointment as the response
    res.status(201).json(savedAppointment);

  } catch (error) {
    console.error('Error creating service appointment:', error);
    res.status(500).json({ message: `Failed to create service appointment: ${error.message}` });
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
    );

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
