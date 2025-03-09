const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model');
const Patient = require('../patient/patient_model');
const Doctors = require('../doctor/doctor_model');
const Post = require('./announcement_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Notification = require('../notifications/notifications_model');
const mongoose = require('mongoose');
const Payment = require('../payments/payment_model');
const fs = require('fs');
const path = require('path');

// Find doctor by ID
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

// Add a new post by ID
const addNewPostById = async (req, res) => {
    try {
        let imagePaths = [];

        console.log('Files received:', req.files); // Debug: Log the files information

        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                // Store the file path instead of Base64
                const imagePath = `images/${file.filename}`;
                return imagePath;
            });
        }

        const newPost = new Post({
            content: req.body.content,
            doctor_id: req.params.id,
            images: imagePaths, // Store array of image file paths
        });

        console.log('New Post Object:', newPost); // Debug: Check the post object before saving

        const savedPost = await newPost.save();
        const updatedDoctor = await Doctors.findByIdAndUpdate(
            req.params.id,
            { $push: { dr_posts: savedPost._id } },
            { new: true }
        ).populate('dr_posts');

        res.json({ updatedDoctor, message: 'New post added successfully' });
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ message: 'Error adding post', error });
    }
};

// Retrieve all posts
const getAllPostbyId = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((Doctor) => {
            if (!Doctor) {
                return res.json({ message: 'Doctor not found' });
            }
            return res.json({ posts: Doctor.dr_posts });
        })
        .catch((err) => {
            return res.json({ message: 'Error retrieving posts', error: err });
        });
};

// Delete post by ID
const findPostByIdDelete = async (req, res) => {
    const postId = req.params.postId;  // Capture the post ID from the request parameters
    const doctorId = req.params.id;    // Doctor's ID

    try {
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        if (!doctor.dr_posts.includes(postId)) {
            return res.status(404).json({ message: 'Post not found in doctor posts' });
        }

        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found in the database' });
        }

        doctor.dr_posts = doctor.dr_posts.filter((id) => id.toString() !== postId);

        const updatedDoctor = await doctor.save();

        res.json({ updatedDoctor, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};

// Update post by ID
const updatePostAtIndex = async (req, res) => {
    const { doctorId, postId } = req.params;
    
    console.log("Doctor ID:", doctorId);
    console.log("Post ID:", postId);
    console.log("Request Body Content:", req.body.content);
    console.log("Request Files:", req.files); // Log uploaded files

    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid doctor or post ID' });
    }

    try {
        const doctor = await Doctors.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                // Save file path as images/$filename
                const imagePath = `images/${file.filename}`;
                
                // Optionally delete the file (if you don't want to keep the temporary upload)
                // fs.unlinkSync(file.path); // Uncomment if you want to delete

                return imagePath;
            });
        }

        let deletedImages = [];
        if (req.body.deletedImages) {
            deletedImages = JSON.parse(req.body.deletedImages);
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove images from the post if requested
        if (deletedImages.length > 0) {
            post.images = post.images.filter(image => !deletedImages.includes(image));
        }

        // Add new images to the post (if any)
        if (imagePaths.length > 0) {
            post.images.push(...imagePaths);
        }

        // Update the post content
        post.content = req.body.content;

        const updatedPost = await post.save();

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
