// appointment_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Function to generate a 10-character random string
function generateAppointmentID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let appointmentID = '';
  for (let i = 0; i < 10; i++) {
    appointmentID += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return appointmentID;
}

const AppointmentSchema = new Schema({
  appointment_ID: {
    type: String,
    unique: true,        // Ensure that the appointment_ID is unique
    required: true,
  },
  appointment_type: [
    {
      appointment_type: {
        type: String, // Store the name of the service
      },
      category: {
        type: String, // Store the category of the service
      },
    },
  ],
  followUp: {
    type: Boolean,
    default: false,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  secretary: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalSecretary',
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  reason: {
    type: String,
  },
  cancelReason: {
    type: String,
  },
  rescheduledReason: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  medium: {
    type: String,
    enum: ['Online', 'Face to Face'],
  },
  prescription: {
    type: Schema.Types.ObjectId,
    ref: 'Prescription',
  },
  findings: {
    type: Schema.Types.ObjectId,
    ref: 'Findings',
  },
  immunization: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Immunization',
    },
  ],
  payment: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  laboratoryResults: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
  ],
}, { timestamps: true });

// Use pre-validation middleware to generate appointment_ID before validation
AppointmentSchema.pre('validate', async function (next) {
  if (this.isNew && !this.appointment_ID) {
    let isUnique = false;
    while (!isUnique) {
      this.appointment_ID = generateAppointmentID();
      try {
        const existingAppointment = await mongoose.models.Appointment.findOne({ appointment_ID: this.appointment_ID });
        if (!existingAppointment) {
          isUnique = true;
        }
      } catch (err) {
        return next(err);
      }
    }
  }
  next();
});

const Appointment = model('Appointment', AppointmentSchema);
module.exports = Appointment;
