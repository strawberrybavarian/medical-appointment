const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')
const Laboratory = require('./laboratory_model')
const path = require('path');
const fs = require('fs');
const Audit = require('../audit/audit_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const nodemailer = require('nodemailer');
const { staff_email } = require('../EmailExport');
const getLaboratoryByAppointmentID = async (req, res) => {
    try {
      const appointmentID = req.params.appointmentID;
      const laboratory = await Laboratory.findOne({ appointment: appointmentID });
      if (!laboratory) {
        return res.status(404).json({ message: "Laboratory result not found" });
      }
      res.status(200).json({ laboratory });
    } catch (error) {
      console.error("Error fetching laboratory result:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


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
        const fileUrl = `uploads/${req.file.filename}`;

        // Check if a laboratory result already exists for the given appointmentId
        let laboratoryResult = await Laboratory.findOne({ appointment: appointmentId });

        if (laboratoryResult) {
            // Update the existing laboratory result
            laboratoryResult.testResults = parsedTestResults;
            laboratoryResult.interpretation = interpretation;
            laboratoryResult.recommendations = recommendations;
            laboratoryResult.file = {
                path: fileUrl,  // Update the file URL
                filename: req.file.originalname // Update the file name
            };
            laboratoryResult.interpretationDate = new Date();
            laboratoryResult.remarks = req.body.remarks || '';

            // Save the updated laboratory result
            await laboratoryResult.save();

            return res.status(200).json({
                message: 'Laboratory result updated successfully.',
                data: laboratoryResult
            });
        }

        // Create a new laboratory result
        laboratoryResult = new Laboratory({
            patient: patientId,
            appointment: appointmentId,
            doctor: req.body.doctorId,
            testResults: parsedTestResults, 
            interpretation: interpretation,
            recommendations: recommendations,
            file: {
                path: fileUrl,
                filename: req.file.originalname
            },
            interpretationDate: new Date(),
            remarks: req.body.remarks || ''
        });

        // Save the new laboratory result
        await laboratoryResult.save();

        // Update the appointment with the new lab result
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        if (!appointment.laboratoryResults.includes(laboratoryResult._id)) {
            appointment.laboratoryResults.push(laboratoryResult._id);
            await appointment.save();
        }

        // Update the patient with the new lab result
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // Check if the laboratory result is already in the patient's array
        if (!patient.laboratoryResults.includes(laboratoryResult._id)) {
            patient.laboratoryResults.push(laboratoryResult._id);  // Add the lab result ID to the patient's laboratoryResults array
            await patient.save();  // Save the patient with the updated laboratoryResults field
        }

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


const createMedSecLaboratoryResult = async (req, res) => {
    const { patientId, appointmentId } = req.params;
    const { interpretation, recommendations, testResults = '[]' } = req.body;

    const sessionUser = req.session

    console.log('Session User:', sessionUser);  
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
        const fileUrl = `uploads/${req.file.filename}`;

        // Check if a laboratory result already exists for the given appointmentId
        let laboratoryResult = await Laboratory.findOne({ appointment: appointmentId });

        console.log('Laboratory result:', laboratoryResult); // Log the laboratory result for debugging

        // Create a new laboratory result if it doesn't exist
        if (!laboratoryResult) {
            laboratoryResult = new Laboratory({
                patient: patientId,
                appointment: appointmentId,
                doctor: req.body.doctorId,
                testResults: parsedTestResults,
                interpretation,
                recommendations,
                file: {
                    path: fileUrl,
                    filename: req.file.originalname
                },
                interpretationDate: new Date(),
                remarks: req.body.remarks || ''
            });

            // Save the new laboratory result
            await laboratoryResult.save();
        } else {
            // Update the existing laboratory result
            laboratoryResult.testResults = parsedTestResults;
            laboratoryResult.interpretation = interpretation;
            laboratoryResult.recommendations = recommendations;
            laboratoryResult.file = {
                path: fileUrl,
                filename: req.file.originalname
            };
            laboratoryResult.interpretationDate = new Date();
            laboratoryResult.remarks = req.body.remarks || '';

            // Save the updated laboratory result
            await laboratoryResult.save();
        }

        // Populate the laboratory result with appointment and patient data
        await laboratoryResult.populate([
            {
                path: 'appointment',
                populate: { path: 'patient' }
            },
            { path: 'patient' }  // Include this if 'patient' is directly referenced
        ]);

        console.log('Laboratory result after population:', laboratoryResult);

        // Now you can access the patient and appointment data via laboratoryResult
        const appointment = laboratoryResult.appointment;
        const patient = laboratoryResult.patient || laboratoryResult.appointment.patient;

        // Convert patient to plain object
        const patientObj = patient.toObject();

        // Log the appointment and patient for debugging
        console.log('Appointment:', appointment);
        console.log('Patient:', patientObj);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Update the appointment with the new lab result
        if (!appointment.laboratoryResults.includes(laboratoryResult._id)) {
            appointment.laboratoryResults.push(laboratoryResult._id);
            await appointment.save();
        }

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found in appointment.' });
        }

        if(sessionUser.role !== 'Medical Secretary'){
            return res.status(403).json({ message: 'Unauthorized access.' });
        } 

        // Find the Medical Secretary by ID
        if (sessionUser.role === 'Medical Secretary') {
            const medsecId = sessionUser._id;

            const medSec = await MedicalSecretary.findById(medsecId);
            if (!medSec) {
                return res.status(404).json({ message: 'Medical Secretary not found.' });

            }

            const audit = new Audit({
                user: medsecId,
                userType: 'Medical Secretary',
                action: 'Created laboratory result',
                description: `Laboratory result created for patient ${patientObj.patient_ID} for appointment ${appointment._id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

            await audit.save();

            await MedicalSecretary.findByIdAndUpdate(medsecId, { $push: { audits: audit._id } });



            console.log('Medical Secretary:', medSec); // Log the Medical Secretary for debugging

        } else if (sessionUser.role === 'Admin') {
            console.log('Admin user:', sessionUser);
            

        }

      

        // Check if the laboratory result is already in the patient's array
        if (!patient.laboratoryResults.includes(laboratoryResult._id)) {
            patient.laboratoryResults.push(laboratoryResult._id);
            await patient.save();
        }

        // Log patient's email and accountStatus
        console.log('Patient email:', patientObj.patient_email);
        console.log('Patient accountStatus:', patientObj.accountStatus);

        // **Send the email only if the patient's accountStatus is 'Unregistered'**
        if (patientObj.accountStatus === 'Unregistered') {
            console.log('Inside email sending block');

            // Create an audit associated with Medical Secretary
            const audit = new Audit({
                user: medSec._id,
                userType: 'Medical Secretary',
                action: 'Created laboratory result for unregistered patient',
                description: `Laboratory result created for unregistered patient ${patientObj.patient_ID} for appointment ${appointment._id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            await audit.save();

            // Send an email to patient.patient_email with patient.patient_ID and appointment._id
            const resetLink = `${req.protocol}://${req.get('host')}`;
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: staff_email.user,
                    pass: staff_email.pass,
                },
            });

            // Verify connection configuration
            transporter.verify(function (error, success) {
                if (error) {
                    console.log("SMTP configuration error:", error);
                } else {
                    console.log("Server is ready to send messages:", success);
                }
            });

            console.log('Sending email to:', patientObj.patient_email); // Use patientObj

            const mailOptions = {
                to: patientObj.patient_email,
                from: staff_email.user,
                subject: 'Laboratory Result Information',
                text: `Dear ${patientObj.patient_firstName},\n\n` +
                    `A laboratory result has been created for you.\n\n` +
                    `Patient ID: ${patientObj.patient_ID}\n` +
                    `Appointment ID: ${appointment._id}\n\n` +
                    `Please go to ${resetLink} and click Lab Result button to download the result.\n\n` +
                    `Thank you.\n\n` +
                    `Best regards,\n` +
                    `Molino Polyclinic`,
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
                // Return the response
                return res.status(201).json({
                    message: 'Laboratory result created successfully and email sent to the unregistered patient.',
                    data: laboratoryResult
                });
            } catch (error) {
                console.log('Error sending email:', error);
                // Return the response even if email fails
                return res.status(201).json({
                    message: 'Laboratory result created successfully but failed to send email to unregistered patient.',
                    data: laboratoryResult,
                    error: error.message
                });
            }
        } else {
            // For registered patients, create an audit but do not send email
            console.log('Patient is registered. Email will not be sent.');

            // Create an audit for the Medical Secretary
            const audit = new Audit({
                user: medSec._id,
                userType: 'Medical Secretary',
                action: 'Created laboratory result for registered patient',
                description: `Laboratory result created for registered patient ${patientObj.patient_ID} for appointment ${appointment._id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            await audit.save();

            // Return response without sending email
            return res.status(201).json({
                message: 'Laboratory result created successfully for registered patient.',
                data: laboratoryResult
            });
        }

    } catch (error) {
        console.error('Error creating laboratory result:', error);
        return res.status(500).json({
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
    downloadLaboratoryFile,
    getLaboratoryByAppointmentID,
    createMedSecLaboratoryResult

};