const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('../admin/admin_model')
const Service = require('../services/service_model')
const Specialty = require('../specialty/specialty_model')

// Create a new service
const createService = async (req, res) => {
  try {
      const { name, description, category, availability, requirements, doctors } = req.body;

      // Handle image upload
      let imageUrl = '';
      if (req.file) {
          const imagePath = `images/${req.file.filename}`; // Path to saved image
          imageUrl = imagePath;
      }

      // Create a new service
      const newService = new Service({
          name,
          description,
          category,
          availability,
          requirements: requirements.split(','), // Assuming requirements are sent as a comma-separated string
          doctors,
          imageUrl,
      });

      // Save the service to the database
      await newService.save();

      res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
      console.error("Error saving service:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  
  // Get all services
  const getAllServices = async (req, res) => {
    try {
      const services = await Service.find().populate('doctors'); // Optionally, populate doctors
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get a single service by ID
  const getServiceById = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findById(id).populate('doctors'); // Optionally, populate doctors
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Update a service
  const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, availability, requirements, doctors } = req.body;

        let updatedData = {
            name,
            description,
            category,
            availability,
            requirements: requirements.split(','), // Assuming requirements are sent as a comma-separated string
            doctors,
        };

        // Handle image upload
        if (req.file) {
            const imagePath = `images/${req.file.filename}`; // Path to saved image
            updatedData.imageUrl = imagePath;
        }

        // Find and update the service
        const updatedService = await Service.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
  
  // Delete a service
  const deleteService = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the service
      const deletedService = await Service.findByIdAndDelete(id);
  
      if (!deletedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


// doctor_controller.js

const addServiceToDoctor = async (req, res) => {
  try {
      const { doctorId, serviceId } = req.params;

      const doctor = await Doctors.findById(doctorId);
      const service = await Service.findById(serviceId);

      if (!doctor || !service) {
          return res.status(404).json({ message: 'Doctor or Service not found' });
      }

      if (!doctor.dr_services.includes(serviceId)) {
          doctor.dr_services.push(serviceId);
          await doctor.save();
      }

      // Return the updated list of services
      await doctor.populate('dr_services');

      res.status(200).json({ dr_services: doctor.dr_services });
  } catch (error) {
      console.error('Error adding service to doctor:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


  // Allow a doctor to stop offering a service
  const removeServiceFromDoctor = async (req, res) => {
    try {
        const { doctorId, serviceId } = req.params;

        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.dr_services = doctor.dr_services.filter(id => id.toString() !== serviceId);
        await doctor.save();

        // Return the updated list of services
        await doctor.populate('dr_services');

        res.status(200).json({ dr_services: doctor.dr_services });
    } catch (error) {
        console.error('Error removing service from doctor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const fetchDoctorServiceStatus = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
      const doctor = await Doctors.findById(doctorId).populate('dr_services');
      if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
      }

      res.status(200).json({ dr_services: doctor.dr_services });
  } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};







  
  
  // Export all the functions
  module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
    removeServiceFromDoctor,
    addServiceToDoctor,
    fetchDoctorServiceStatus
  };
