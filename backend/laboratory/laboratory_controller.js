const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')
const Laboratory = require('./laboratory_model')

const createLaboratoryResult = async (req,res) =>
    {
        const { patientId, appointmentId } = req.params;
        const { interpretation, recommendations, testResults } = req.body;

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        try {
            const laboratoryResult = new Laboratory({
                patient: patientId,
                appointment: appointmentId,
                doctor: req.body.doctorId,
                testResults: JSON.parse(testResults), 
                interpretation: interpretation,
                recommendations: recommendations,
                file: {
                    path: req.file.path,
                    filename: req.file.originalname
                },
                interpretationDate: new Date(),
                remarks: req.body.remarks || ''
            });

            await laboratoryResult.save();

            res.status(201).json({
                message: 'Laboratory result created successfully.',
                data: laboratoryResult
            });
        } catch (error) {
            console.error('Error creating laboratory result:', error);
            res.status(500).json({
                message: 'Error creating laboratory result.',
                error: error.message
            });
        }
    }

const downloadLaboratoryFile = async (req,res) => {
   
        const { resultId } = req.params;
        
        try {
            const labResult = await Laboratory.findById(resultId);
            
            if (!labResult || !labResult.file || !labResult.file.path) {
                return res.status(404).send('File not found.');
            }

            res.download(labResult.file.path, labResult.file.filename);
        } catch (error) {
            console.error('Error downloading file:', error);
            res.status(500).json({
                message: 'Error downloading file.',
                error: error.message
            });
        }
   
}
module.exports = {
    createLaboratoryResult,
    downloadLaboratoryFile

};