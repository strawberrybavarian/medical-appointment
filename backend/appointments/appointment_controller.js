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
const socket = require('../socket');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { staff_email } = require('../EmailExport');

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
    const doctor = await Doctors.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const availability = doctor.availability[dayOfWeek];
    if (!availability) {
      throw new Error(`No availability found for ${dayOfWeek}`);
    }
    if (timePeriod === 'morning' && availability.morning.maxPatients > 0) {
      availability.morning.maxPatients -= 1;
    } else if (timePeriod === 'afternoon' && availability.afternoon.maxPatients > 0) {
      availability.afternoon.maxPatients -= 1;
    } else {
      throw new Error('No slots available for the selected time period');
    }
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
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

    // Check if the patient already has an active appointment
    const existingAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $nin: ['Cancelled', 'Completed', 'Missed', 'Rescheduled'] }, // Excluding finished statuses
    });

    console.log(existingAppointment); // Debugging log to see if there are any existing appointments

    if (existingAppointment) {
      return res.status(400).json({
        message: 'You already have an active appointment. Please complete or cancel it before booking a new one.',
      });
    }

    const [patientData, doctorData] = await Promise.all([
      Patient.findById(patientId).select('patient_firstName patient_lastName'),
      Doctors.findById(doctor).select('dr_firstName dr_lastName availability bookedSlots'),
    ]);

    if (!patientData) return res.status(404).json({ message: 'Patient not found.' });
    if (!doctorData) return res.status(404).json({ message: 'Doctor not found.' });

    const [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);
    const finalAppointmentType = appointment_type?.appointment_type || "Consultation";

    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      doctor: new mongoose.Types.ObjectId(doctor),
      date,
      time: `${startTime} - ${endTime}`,
      reason,
      medium,
      appointment_type: { appointment_type: finalAppointmentType, category: "General" },
      status: 'Pending',
    });

    const savedAppointment = await newAppointment.save();

    await Promise.all([
      Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } }),
      Doctors.findByIdAndUpdate(doctor, { $push: { dr_appointments: savedAppointment._id } }),
    ]);

    
    if(req.session.role === 'Patient') {
      const auditData = {
        user: patientId,
        userType: 'Patient',
        action: 'Create Appointment',
        description: `Appointment created for patient ${patientData.patient_firstName} ${patientData.patient_lastName} with Dr. ${doctorData.dr_firstName} ${doctorData.dr_lastName} on ${date} at ${time}. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const audit = new Audit(auditData);
      await audit.save();
  
      await Patient.findByIdAndUpdate(patientId, { $push: { audits: audit._id } });

    } else if (req.session.role === 'Admin') {

      const auditData = {
        user: req.session.user,
        userType: 'Admin',
        action: 'Create Appointment',
        description: `Appointment created for patient ${patientData.patient_firstName} ${patientData.patient_lastName} with Dr. ${doctorData.dr_firstName} ${doctorData.dr_lastName} on ${date} at ${time}. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const audit = new Audit(auditData);
      await audit.save();
  
      await Admin.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
    } else if (req.session.role === 'Medical Secretary') {
      const auditData = {
        user: req.session.user,
        userType: 'Medical Secretary',  
        action: 'Create Appointment',
        description: `Appointment created for patient ${patientData.patient_firstName} ${patientData.patient_lastName} with Dr. ${doctorData.dr_firstName} ${doctorData.dr_lastName} on ${date} at ${time}. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const audit = new Audit(auditData);
      await audit.save();
      
      await MedicalSecretary.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Notifications for Admins and Secretaries
    const [medicalSecretaries, admins] = await Promise.all([
      MedicalSecretary.find({}, '_id'),
      Admin.find({}, '_id'),
    ]);

    const recipients = [...medicalSecretaries.map(ms => ms._id), ...admins.map(ad => ad._id)];
    const notificationMessage = `New pending appointment created by ${patientData.patient_firstName} ${patientData.patient_lastName}.`;

    const notificationAdmin = new Notification({
      message: notificationMessage,
      receiver: recipients,
      receiverModel: 'Admin',
      isRead: false,
      link: `/admin/appointments`,
      type: 'Appointment',
      recipientType: 'Admin',
    });

    const notificationMedsec = new Notification({
      message: notificationMessage,
      receiver: recipients,
      receiverModel: 'Medical Secretary',
      isRead: false,
      link: `/medsec/appointments`,
      type: 'Appointment',
      recipientType: 'Medical Secretary',
    });

    await notificationMedsec.save();
    await notificationAdmin.save();

    await Promise.all(
      medicalSecretaries.map(ms => {
        return MedicalSecretary.findByIdAndUpdate(ms._id, { $push: { notifications: notificationMedsec._id } });
      })
    );

    await Promise.all(
      admins.map(ad => {
        return Admin.findByIdAndUpdate(ad._id, { $push: { notifications: notificationAdmin._id } });
      })
    );

    const io = socket.getIO();
    const clients = socket.clients;

    if (io && clients) {
      for (let userId in clients) {
        const userSocket = clients[userId];
        const userRole = userSocket.userRole;

        if (userRole === 'Medical Secretary' || userRole === 'Admin') {
          userSocket.emit('newAppointment', {
            message: notificationMessage,
            appointmentId: savedAppointment._id,
            patientName: `${patientData.patient_firstName} ${patientData.patient_lastName}`,
            doctorName: `${doctorData.dr_firstName} ${doctorData.dr_lastName}`,
            date: savedAppointment.date,
            time: savedAppointment.time,
            link: `/medsec/appointments`,
          });
        }
      }
    }

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: `Failed to create appointment: ${error.message}` });
  }
};

const createServiceAppointment = async (req, res) => {
  try {

    const sessionUser = req.session.user;

    if(!sessionUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { date, reason, appointment_type, serviceId } = req.body;
    const patientId = req.params.uid;
    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and Primary Concern are required' });
    }
    const existingAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $nin: ['Cancelled', 'Completed', 'Missed' , 'Rescheduled'] },
    });
    if (existingAppointment) {
      return res.status(400).json({
        message: 'You already have an active appointment. Please complete or cancel it before booking a new one.',
      });
    }
    const patientData = await Patient.findById(patientId).select('patient_firstName patient_lastName');
    if (!patientData) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const serviceData = await Service.findById(serviceId).select('name category availability');
    if (!serviceData) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (serviceData.availability === 'Not Available' || serviceData.availability === 'Coming Soon') {
      return res.status(400).json({ message: `The selected service (${serviceData.name}) is currently not available.` });
    }


    const newAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      service: new mongoose.Types.ObjectId(serviceId),
      date,
      reason,
      appointment_type: {
        appointment_type: serviceData.name,
        category: serviceData.category,
      },
      status: 'Pending',
    });
    const savedAppointment = await newAppointment.save();
    await Patient.findByIdAndUpdate(patientId, { $push: { patient_appointments: savedAppointment._id } });

    ///For auditing the actions (activity log)
    if(req.session.role === 'Patient') {
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
  } else if (req.session.role === 'Admin') {
    const auditData = {
      user: req.session.user,
      userType: 'Admin',
      action: 'Create Service Appointment',
      description: `Appointment created for patient: ${patientData.patient_firstName} ${patientData.patient_lastName} for service: ${serviceData.name} on ${date}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const audit = new Audit(auditData);
    await audit.save();

    await Admin.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
  } else if (req.session.role === 'Medical Secretary') {
    const auditData = {
      user: req.session.user,
      userType: 'Medical Secretary',
      action: 'Create Service Appointment',
      description: `Appointment created for patient: ${patientData.patient_firstName} ${patientData.patient_lastName} for service: ${serviceData.name} on ${date}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'), 
    };

    const audit= new Audit(auditData);
    await audit.save();

    await MedicalSecretary.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
    const [medicalSecretaries, admins] = await Promise.all([
      MedicalSecretary.find({}, '_id'),
      Admin.find({}, '_id'),
    ]);
    const recipients = [...medicalSecretaries.map((ms) => ms._id), ...admins.map((ad) => ad._id)];
    const notificationMessage = `New service appointment created by ${patientData.patient_firstName} ${patientData.patient_lastName} for ${serviceData.name}.`;
    const notification = new Notification({
      message: notificationMessage,
      recipient: recipients,
      recipientType: 'Admin',
      receiverModel: 'Admin',
      type: 'Appointment',
    });
    await notification.save();
    await Promise.all(
      medicalSecretaries.map((ms) => {
        return MedicalSecretary.findByIdAndUpdate(ms._id, { $push: { notifications: notification._id } });
      })
    );
    await Promise.all(
      admins.map((ad) => {
        return Admin.findByIdAndUpdate(ad._id, { $push: { notifications: notification._id } });
      })
    );
    const io = socket.getIO();
    const clients = socket.clients;
    if (io && clients) {
      for (let userId in clients) {
        const userSocket = clients[userId];
        const userRole = userSocket.userRole;
        if (userRole === 'Medical Secretary' || userRole === 'Admin') {
          userSocket.emit('newAppointment', {
            message: notificationMessage,
            appointmentId: savedAppointment._id,
            link: `/appointments/${savedAppointment._id}`,
          });
        }
      }
    }
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating service appointment:', error);
    res.status(500).json({ message: `Failed to create service appointment: ${error.message}` });
  }
};

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

    // Define the statuses to be included in the count
    const statuses = ['Scheduled', 'Completed', 'Ongoing', 'To-send', 'For Payment', 'Upcoming',];

    const morningCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: new Date(date),
      time: { $regex: /^(0[0-9]|1[01]):[0-5][0-9]/ }, // Morning time regex
      status: { $in: statuses }, // Include all desired statuses
    });

    const afternoonCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: new Date(date),
      time: { $regex: /^(1[2-9]|2[0-3]):[0-5][0-9]/ }, // Afternoon time regex
      status: { $in: statuses }, // Include all desired statuses
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

    const sessionUser = req.session.user;
    
    if(!sessionUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { status } = req.body;
    const appointmentId = req.params.id;
    const validStatuses = [
      'Pending', 'Scheduled', 'Completed', 'Cancelled', 'Ongoing', 
      'To-send', 'For Payment', 'Upcoming'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'dr_firstName dr_lastName bookedSlots availability activityStatus')
      .populate('patient', 'patient_firstName patient_lastName patient_email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const io = socket.getIO();
    const clients = socket.clients;

    // Helper function to determine the notification type based on the appointment status
    function getNotificationType(newStatus) {
      switch (newStatus) {
        case 'Scheduled':
          return 'Scheduled';
        case 'Ongoing':
          return 'Ongoing';
        case 'Completed':
          return 'Completed';
        case 'Cancelled':
          return 'Cancelled';
        default:
          return 'StatusUpdate'; // fallback
      }
    }

    // If appointment is now Ongoing, set the doctor's activity status to In Session (only if doctor exists)
    if (status === 'Ongoing' && appointment.doctor) {
      await Doctors.findByIdAndUpdate(appointment.doctor._id, { activityStatus: 'In Session' }, { new: true });
      const updatedDoctor = await Doctors.findById(appointment.doctor._id).select('activityStatus');
    
      // Emit to all clients (including doctors) to notify the doctor that their status is "In Session"
      io.emit('doctorStatusUpdate', {
        doctorId: appointment.doctor._id.toString(),
        activityStatus: updatedDoctor.activityStatus,
      });
    }

    // If appointment is Completed, For Payment, Cancelled, or Scheduled, revert the doctor's activity status to Online (only if doctor exists)
    if ((status === 'Completed' || status === 'For Payment' || status === 'Cancelled' || status === 'Scheduled') && appointment.doctor) {
      const updatedDoctor = await Doctors.findById(appointment.doctor._id).select('activityStatus');
      if (!updatedDoctor) {
        await Doctors.findByIdAndUpdate(appointment.doctor._id, { activityStatus: 'Online' }, { new: true });
      } else {
        await Doctors.findByIdAndUpdate(appointment.doctor._id, { activityStatus: 'Online' }, { new: true });
      }

      // Emit to all clients to notify that the doctor's status is back to "Online"
      io.emit('doctorStatusUpdate', {
        doctorId: appointment.doctor._id.toString(),
        activityStatus: updatedDoctor.activityStatus,
      });
    }

    // Notify Doctor if status is 'Scheduled' or 'Upcoming' (only if doctor exists)
    if ((status === 'Scheduled' || status === 'Upcoming') && appointment.doctor) {
      const notificationMessage = `Appointment with ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName} is now ${status}.`;
      const doctorNotification = new Notification({
        message: notificationMessage,
        receiver: appointment.doctor._id,
        receiverModel: 'Doctor',
        isRead: false,
        link: `/mainappointment?outerTab=mypatients`,
        type: getNotificationType(status),
        recipientType: 'Doctor',
      });
      await doctorNotification.save();

      await Doctors.findByIdAndUpdate(appointment.doctor._id, {
        $push: { notifications: doctorNotification._id }
      });

      const doctorSocket = clients[appointment.doctor._id.toString()];
      if (doctorSocket && doctorSocket.userRole === 'Doctor') {
        doctorSocket.emit('appointmentStatusUpdate', {
          message: notificationMessage,
          appointmentId: appointment._id,
          doctorId: appointment.doctor._id,
          status: status,
          link: `/mainappointment?outerTab=mypatients`,
        });
      }
    }

    // Notify Patient if status changes to one of the specified statuses (and oldStatus is different from new status)
    if (['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].includes(status) && oldStatus !== status) {
      // Notify patient
      const patientNotification = new Notification({
        message: `Your appointment ${appointment.appointment_ID || appointment._id} status has been updated to ${status}.`,
        receiver: appointment.patient._id,
        receiverModel: 'Patient',
        isRead: false,
        link: `/myappointment`,
        type: 'StatusUpdate',
        recipientType: 'Patient',
      });
      await patientNotification.save();
    
      await Patient.findByIdAndUpdate(appointment.patient._id, { $push: { notifications: patientNotification._id } });
    
      const patientSocket = clients[appointment.patient._id.toString()];
      if (patientSocket && patientSocket.userRole === 'Patient') {
        patientSocket.emit('appointmentStatusUpdate', {
          message: `Your appointment ${appointment.appointment_ID || appointment._id} status has been updated to ${status}.`,
          appointmentId: appointment._id,
          patientId: appointment.patient._id,
          status: status,
          link: `/myappointment`,
        });
      }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: staff_email.user,
        pass: staff_email.pass,
      },
    });

    // If status is 'Scheduled', send an email to the patient
    if (status === 'Scheduled') {
      const mailOptions = {
        from: staff_email.user,
        to: appointment.patient.patient_email,
        subject: 'Your Appointment is Scheduled',
        text: `Dear ${appointment.patient.patient_firstName},
              Your appointment (${appointment.appointment_ID || appointment._id}) has been scheduled successfully.
              Best regards,
              Your Clinic Team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    // If status is 'Completed', send an email to the patient
    if (status === 'Completed') {
      const mailOptions = {
        from: staff_email.user,
        to: appointment.patient.patient_email,
        subject: 'Your Appointment is Completed',
        text: `Dear ${appointment.patient.patient_firstName},
              Your appointment (${appointment.appointment_ID || appointment._id}) has been successfully completed.
              Thank you for choosing our services.
              Best regards,
              Your Clinic Team`,
        };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Completion email sent:', info.response);
        }
      });
    }

    if(req.session.role === 'Doctor') {
      const auditData = {
        user: appointment.doctor._id,
        userType: 'Doctor',
        action: 'Update Appointment Status',
        description: `Appointment status updated to ${status} for patient ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}.`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
      const audit = new Audit(auditData);
      await audit.save();
      await Doctors.findByIdAndUpdate(appointment.doctor._id, { $push: { audits: audit._id } });
    } else if (req.session.role === 'Admin') {
      const auditData = {
        user: req.session.user,
        userType: 'Admin',
        action: 'Update Appointment Status',
        description: `Appointment status updated to ${status} for patient ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}.`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
      const audit = new Audit(auditData);
      await audit.save();
      await Admin.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
    } else if (req.session.role === 'Medical Secretary') {
      const auditData = {
        user: req.session.user,
        userType: 'Medical Secretary',
        action: 'Update Appointment Status',
        description: `Appointment status updated to ${status} for patient ${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}.`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
      const audit = new Audit(auditData);
      await audit.save();
      await MedicalSecretary.findByIdAndUpdate(req.session.user, { $push: { audits: audit._id } });
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

// AppointmentController.js

const getPastAppointments = async (req, res) => {
  try {
    const { patientId, doctorName } = req.query; // doctorName for search filter
    const appointments = await Appointment.find({ patient: patientId, date: { $lt: new Date() } })
      .populate('doctor')
      .populate('patient');

    // Filter by doctor name if provided
    const filteredAppointments = doctorName
      ? appointments.filter(app => app.doctor.name.toLowerCase().includes(doctorName.toLowerCase()))
      : appointments;

    res.status(200).json(filteredAppointments);
  } catch (error) {
    console.error('Error fetching past appointments:', error);
    res.status(500).json({ message: 'Failed to fetch past appointments' });
  }
};


const updateAppointmentDetails = async (req, res) => {
  try {
    const { doctor, date, time, appointment_type, reason } = req.body;
    const appointmentId = req.params.appointmentId;
    let startTime, endTime;
    if (time.includes(' - ')) {
      [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);
    } else {
      startTime = convertTo24HourFormat(time);
      endTime = '';
    }
    const updateData = {
      date,
      time: endTime ? `${startTime} - ${endTime}` : startTime,
      reason,
      appointment_type,
      status: 'Pending',
    };
    if (doctor) {
      updateData.doctor = new mongoose.Types.ObjectId(doctor);
    } else {
      updateData.$unset = { doctor: "" };
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate('patient', 'patient_firstName patient_lastName');
    const notificationMessage = `Your appointment details have been updated. Please check the new details.`;
    const patientNotification = new Notification({
      message: notificationMessage,
      recipient: [updatedAppointment.patient._id],
      recipientType: 'Patient',
      type: 'AppointmentUpdate',
      receiverModel: 'Patient'
    });
    await patientNotification.save();
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
      time: `${startTime} - ${endTime}`,
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
    const patientNotification = new Notification({
      message: `Your follow-up appointment has been scheduled on ${date} at ${time}.`,
      recipient: [oldAppointment.patient],
      recipientType: 'Patient',
      type: 'Appointment',
    });
    await patientNotification.save();
    await Patient.findByIdAndUpdate(oldAppointment.patient, { $push: { notifications: patientNotification._id } });
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
  updatePatientAppointmentDetails,
  getPastAppointments,  
};
