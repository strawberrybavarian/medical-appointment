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
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason, medium, appointment_type } = req.body;
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

    // Fetch the doctor's details (first and last name)
    const doctorData = await Doctors.findById(doctor).select('dr_firstName dr_lastName availability bookedSlots');
    if (!doctorData) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Parse the selected date and determine the day of the week
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // e.g., 'monday'

    // Check the doctor's availability for the selected day of the week (morning/afternoon)
    const availability = doctorData.availability[dayOfWeek];
    const selectedHour = parseInt(time.split(":")[0]);
    const timePeriod = selectedHour < 12 ? 'morning' : 'afternoon';

    if (!availability || !availability[timePeriod] || !availability[timePeriod].available) {
      return res.status(400).json({ message: `No available slots for ${timePeriod} on ${dayOfWeek}.` });
    }

    // Check if the selected date is already in the bookedSlots array
    let bookedSlot = doctorData.bookedSlots.find(slot => 
      slot.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
    );

    if (!bookedSlot) {
      // Create a new bookedSlot entry for the selected date
      bookedSlot = { date: selectedDate, morning: 0, afternoon: 0 };
      doctorData.bookedSlots.push(bookedSlot);
    }

    const maxPatients = availability[timePeriod].maxPatients;
    const bookedCount = timePeriod === 'morning' ? bookedSlot.morning : bookedSlot.afternoon;

    if (bookedCount >= maxPatients) {
      return res.status(400).json({ message: `No available slots for ${timePeriod} on ${dayOfWeek}.` });
    }

    // Increment the booked count for the time period
    if (timePeriod === 'morning') {
      bookedSlot.morning++;
    } else {
      bookedSlot.afternoon++;
    }

    // Save the updated doctor data with the new booked slot count
    await doctorData.save();

    // Create a new appointment object
    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      doctor: new mongoose.Types.ObjectId(doctor),
      date,
      time,
      reason,
      medium,
      appointment_type,
    });

    // Save the new appointment
    const savedAppointment = await newAppointment.save();

    // Update the patient's and doctor's appointment arrays
    await Promise.all([
      Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } })
    ]);

    // Audit log for the created appointment
    const patientFullName = `${patientData.patient_firstName} ${patientData.patient_lastName}`;
    const doctorFullName = `Dr. ${doctorData.dr_firstName} ${doctorData.dr_lastName}`;

    const auditData = {
      user: patientId,  // Assuming the patient is the one creating the appointment
      userType: 'Patient',
      action: 'Create Appointment',
      description: `Appointment created for patient: ${patientFullName} with ${doctorFullName} on ${date} at ${time}. Reason: ${reason}`,
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
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    // Ensure status is valid
    const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 'Missed', 'For Payment', 'To-send'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    // Find the appointment before updating (to know the current doctor and time)
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update the status of the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    // Removed the block that increments the doctor's maxPatients slots

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: `Failed to update appointment status: ${error.message}` });
  }
};

// Your updated controller for updating appointment with time in "AM/PM" format
const updateAppointmentDetails = async (req, res) => {
  try {
      const { doctor, date, time, appointment_type, reason } = req.body;
      const appointmentId = req.params.appointmentId;

      // Update the appointment
      const updatedAppointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          { 
              doctor: new mongoose.Types.ObjectId(doctor), 
              date, 
              time,
              reason,
              appointment_type,
              status: 'Pending'
          },
          { new: true }
      );

      // Determine who performed the action
      let userType = '';
      let user = null;

      if (req.user && req.user.role === 'Patient') {
          user = await Patient.findById(req.user._id);
          userType = 'Patient';
      } else if (req.user && req.user.role === 'Admin') {
          user = await Admin.findById(req.user._id);
          userType = 'Admin';
      } else if (req.user && req.user.role === 'Medical Secretary') {
          user = await MedicalSecretary.findById(req.user._id);
          userType = 'Medical Secretary';
      } else {
          console.error('User role not recognized or req.user is undefined');
      }

      if (user) {
          // Perform the audit
          const auditData = {
              user: user._id,
              userType,
              action: 'Reschedule Appointment',
              description: `The appointment was rescheduled by ${userType} to ${date} at ${time}.`,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
          };

          try {
              // Save the audit record to the database
              const audit = await new Audit(auditData).save();

              // Initialize the audits array if it doesn't exist
              if (!Array.isArray(user.audits)) {
                  user.audits = [];
              }

              // Add the audit ID to the user's audits array
              user.audits.push(audit._id);

              // Save the user document
              try {
                  await user.save();
              } catch (userSaveError) {
                  console.error('Failed to save user after adding audit:', userSaveError.message);
              }
          } catch (auditError) {
              console.error('Failed to save audit:', auditError.message);
          }
      } else {
          console.error('User not found; audit not recorded.');
      }

      res.status(200).json(updatedAppointment);
  } catch (error) {
      console.error('Error updating appointment:', error.message);
      res.status(500).json({ message: `Failed to update appointment: ${error.message}` });
  }
};



const countBookedPatients = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  try {
      // Count appointments for the doctor on the given date, grouped by morning and afternoon
      const morningCount = await Appointment.countDocuments({
          doctor: doctorId,
          date: new Date(date),
          time: { $gte: "06:00", $lt: "12:00" } // Morning times
      });

      const afternoonCount = await Appointment.countDocuments({
          doctor: doctorId,
          date: new Date(date),
          time: { $gte: "12:00", $lt: "18:00" } // Afternoon times
      });

      res.json({ morning: morningCount, afternoon: afternoonCount });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error counting booked patients' });
  }
};


const updatePatientAppointmentDetails = async (req, res) => {
  try {
    const { doctor, date, time, appointment_type, reason, prescription, findings, cancelReason } = req.body;
    const oldAppointmentId = req.params.appointmentId;

    // Find the old appointment
    const oldAppointment = await Appointment.findById(oldAppointmentId);
    if (!oldAppointment) {
      return res.status(404).json({ message: 'Original appointment not found' });
    }

    // Update the old appointment's status to 'Archived' and set followUp to false
    oldAppointment.status = 'Archived';
    oldAppointment.followUp = false; // Update according to your logic
    await oldAppointment.save();

    // Get the old prescription
    const oldPrescription = oldAppointment.prescription;

    // Decide what prescription to use: new one from request or old one
    const newPrescription = prescription || oldPrescription;

    // Create a new appointment with the provided details
    const newAppointmentData = {
      patient: oldAppointment.patient,
      doctor: doctor,
      date: date,
      time: time,
      reason: reason,
      appointment_type: appointment_type,
      status: 'Pending',
      followUp: true,
      findings: findings,
      prescription: newPrescription, // Use the new or old prescription
    };

    const newAppointment = new Appointment(newAppointmentData);
    const savedAppointment = await newAppointment.save();

    // Update the patient's and doctor's appointments arrays using Promise.all
    await Promise.all([
      Patient.findByIdAndUpdate(oldAppointment.patient, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } })
    ]);

    // Perform auditing for follow-up appointments
    // ... (rest of your auditing code remains the same)

    // Perform auditing for appointment cancellation if `cancelReason` is provided
    const doctorsapp = await Doctors.findById(oldAppointment.doctor);
    const auditData = {
      user: oldAppointment.patient._id, // Assuming the patient is cancelling the appointment
      userType: 'Patient', // Specify the user type
      action: 'Scheduled Follow Up Appointment',
      description: `You have scheduled a follow-up appointment with Dr. ${doctorsapp.dr_firstName} ${doctorsapp.dr_lastName} on ${oldAppointment.date.toLocaleDateString()} at ${oldAppointment.time}. The previous appointment was cancelled. Reason: ${cancelReason}`,
      ipAddress: req.ip,  // Get the IP address from the request
      userAgent: req.get('User-Agent'),  // Get the User-Agent (browser/device info)
    };

    console.log(auditData);
    // Save the audit record
    const audit = await new Audit(auditData).save();

    // Add the audit ID to the patient's `audits` array
    const patient = await Patient.findById(oldAppointment.patient);
    if (patient) {
      if (!Array.isArray(patient.audits)) {
        patient.audits = [];
      }
      patient.audits.push(audit._id);
      await patient.save();
    }

    res.status(201).json(savedAppointment);
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
