const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')
const Laboratory = require('./laboratory_model')
const path = require('path');
const fs = require('fs');

const createLaboratoryResult = async (req, res) => {
    const { patientId, appointmentId } = req.params;
    const { interpretation, recommendations, testResults = '[]' } = req.body;

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Safely parse testResults, default to an empty array if not provided
        let parsedTestResults;
        try {
            parsedTestResults = JSON.parse(testResults);
        } catch (parseError) {
            return res.status(400).json({ message: 'Invalid testResults format.', error: parseError.message });
        }

        // Generate the relative URL to be stored in the database
        const fileUrl = `/uploads/${req.file.filename}`;

        // Create the laboratory result
        const laboratoryResult = new Laboratory({
            patient: patientId,
            appointment: appointmentId,
            doctor: req.body.doctorId,
            testResults: parsedTestResults, // Will be an empty array if not passed
            interpretation: interpretation,
            recommendations: recommendations,
            file: {
                path: fileUrl, // Store the relative URL
                filename: req.file.originalname
            },
            interpretationDate: new Date(),
            remarks: req.body.remarks || ''
        });

        await laboratoryResult.save();

        // Update the appointment with this lab result
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        appointment.laboratoryResults.push(laboratoryResult._id);
        await appointment.save();

        // Update the patient with this lab result
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        patient.laboratoryResults.push(laboratoryResult._id);
        await patient.save();

        res.status(201).json({
            message: 'Laboratory result created successfully and associated with appointment and patient.',
            data: laboratoryResult
        });

    } catch (error) {
        console.error('Error creating laboratory result:', error);
        res.status(500).json({
            message: 'Error creating laboratory result.',
            error: error.message
        });
    }
};


  
   



  
  const downloadLaboratoryFile = async (req, res) => {
    const { resultId } = req.params;

    try {
        // Find the laboratory result by ID
        const labResult = await Laboratory.findById(resultId);
        
        if (!labResult || !labResult.file || !labResult.file.path) {
            return res.status(404).json({ message: 'File not found.' });
        }

        // Path to the saved file inside 'public/uploads'
        const filePath = path.join(__dirname, '../public/uploads', path.basename(labResult.file.path));
        console.log('File path:', filePath); // Log the file path for debugging

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server.' });
        }

        // Serve the file for download
        res.download(filePath, labResult.file.filename, (err) => {
            if (err) {
                console.error('Error downloading the file:', err);
                return res.status(500).json({ message: 'Error downloading file.', error: err.message });
            }
        });
    } catch (error) {
        console.error('Error fetching laboratory result:', error);
        res.status(500).json({
            message: 'Error downloading file.',
            error: error.message
        });
    }
};

  
module.exports = {
    createLaboratoryResult,
    downloadLaboratoryFile

};