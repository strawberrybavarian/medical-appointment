const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')

const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { gender, dateOfConsultation, doctorId, medications } = req.body;
    const imagePath = req.file ? `images/${req.file.filename}` : '';

    // Ensure patientId, doctorId, and appointmentId are provided
    if (!patientId || !doctorId || !appointmentId) {
      return res.status(400).json({ message: 'Missing required fields: patientId, doctorId, or appointmentId' });
    }

    // Ensure that medications is parsed correctly
    let parsedMedications = [];

    if (medications) {
      if (typeof medications === 'string') {
        // If medications is a JSON string, parse it
        try {
          parsedMedications = JSON.parse(medications);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid medications format' });
        }
      } else if (Array.isArray(medications)) {
        parsedMedications = medications;
      } else {
        return res.status(400).json({ message: 'Medications should be an array or a valid JSON string' });
      }
    }

    // Ensure doctorId is provided
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    // Check if a prescription already exists for the patient, doctor, and appointment
    let prescription = await Prescription.findOne({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
    });

    if (prescription) {
      // Update existing prescription
      prescription.gender = gender;
      prescription.dateOfConsultation = dateOfConsultation;
      prescription.medications = parsedMedications;
      if (imagePath) prescription.prescriptionImage = imagePath; // Update image if provided
      await prescription.save();
    } else {
      // Create new prescription
      prescription = new Prescription({
        patient: patientId,
        appointment: appointmentId || null,
        gender,
        dateOfConsultation,
        doctor: doctorId,
        medications: parsedMedications,
        prescriptionImage: imagePath,
      });
      await prescription.save();

      // Update the patient's record
      const patient = await Patient.findById(patientId);
      if (patient) {
        patient.prescriptions.push(prescription._id);
        await patient.save();
      }

      // Update the doctor's record
      const doctorRecord = await Doctors.findById(doctorId);
      if (doctorRecord) {
        doctorRecord.dr_prescriptions.push(prescription._id);
        await doctorRecord.save();
      }

      // Update the appointment
      if (appointmentId) {
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          appointment.prescription = prescription._id;
          await appointment.save();
        }
      }
    }

    res.status(201).json({ message: 'Prescription saved successfully', prescription });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};





const updatePrescriptionImage = async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const imagePath = `images/${req.file.filename}`; 

    const updatedPrescription = await Prescription.findByIdAndUpdate(prescriptionId, { prescriptionImage: imagePath }, { new: true });
    res.json({ updatedPrescription, message: 'Prescription image updated successfully' });
  } catch (error) {
    console.error('Error updating prescription image:', error);
    res.status(500).json({ message: 'Error updating prescription image', error });
  }
};


module.exports = {
  createPrescription,
  updatePrescriptionImage
};