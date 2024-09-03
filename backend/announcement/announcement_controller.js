const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model');
const Patient = require('../patient/patient_model');
const Doctors = require('../doctor/doctor_model');
const Post = require('./announcement_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Notification = require('../notifications/notifications_model');
const mongoose = require('mongoose');
const Payment = require('../payments/payment_model');

const findDoctorById = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((theDoctor) => {
            res.json({ theDoctor });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};
const addNewPostById = (req, res) => {
    const newPost = new Post({
        content: req.body.content, 
        doctor_id: req.params.id,
    });

    newPost.save()
        .then((post) => {
            return Doctors.findByIdAndUpdate(
                req.params.id,
                { $push: { dr_posts: post._id } },
                { new: true }
            ).populate('dr_posts');
        })
        .then((updatedDoctor) => {
            res.json({ updatedDoctor, message: 'New post added successfully' });
        })
        .catch((error) => {
            res.json({ message: 'Error adding post', error });
        });
};
// Retrieve all posts 
const getAllPostbyId = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((Doctor) => {
            if (!Doctor) {
                res.json({ message: 'Doctor not found' });
            }
            res.json({ posts: Doctor.dr_posts });
        })
        .catch((err) => {
            res.json({ message: 'Error retrieving posts', error: err });
        });
};
const findPostByIdDelete = async (req, res) => {
    const postIndex = req.params.index;
    const doctorId = req.params.id;

    try {
        // Find the doctor document
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Ensure that the postIndex is a valid index in the dr_posts array
        if (postIndex < 0 || postIndex >= doctor.dr_posts.length) {
            return res.status(400).json({ message: 'Invalid post index' });
        }

        // Extract the post ID to be deleted
        const postIdToDelete = doctor.dr_posts[postIndex];

        // Delete the post from the Post collection
        const deletedPost = await Post.findByIdAndDelete(postIdToDelete);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove the post reference from the doctor's dr_posts array
        doctor.dr_posts.splice(postIndex, 1);

        // Save the updated doctor document
        const updatedDoctor = await doctor.save();

        res.json({ updatedDoctor, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
const updatePostAtIndex = async (req, res) => {
    const { id: doctorId, index } = req.params;
    console.log('Received Doctor ID:', doctorId);
    console.log('Received Post Index:', index);

    // Validate Doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    try {
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if the index is within bounds
        if (index < 0 || index >= doctor.dr_posts.length) {
            return res.status(400).json({ message: 'Invalid post index' });
        }

        // Get the post ID from the doctor's dr_posts array
        const postId = doctor.dr_posts[index];

        // Update the content of the post
        const updatedPost = await Post.findByIdAndUpdate(postId, { content: req.body.content }, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ updatedPost, message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post', error });
    }
};




  

module.exports = {
  addNewPostById,
  getAllPostbyId,
  findPostByIdDelete,
  updatePostAtIndex,
  findDoctorById
};
