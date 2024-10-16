const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');
const News = require('./news_model')
const fs = require('fs');
const path = require('path');

// Find news by Medical Secretary or Admin


const getGeneralNews = async (req, res) => {
    try {
        const newsPosts = await News.aggregate([
            {
                $lookup: {
                    from: 'medicalsecretaries',  // The collection name in MongoDB
                    localField: 'posted_by',     // The field in News that stores the Medical Secretary/Admin _id
                    foreignField: '_id',         // The field in the Medical Secretary collection that matches
                    as: 'medicalSecretaryInfo'   // The field to hold the Medical Secretary details
                }
            },
            {
                $lookup: {
                    from: 'admins',              // The Admin collection
                    localField: 'posted_by',     // The field in News that stores the Admin _id
                    foreignField: '_id',         // The field in the Admin collection that matches
                    as: 'adminInfo'              // The field to hold the Admin details
                }
            },
            {
                $project: {
                    news_ID: 1,
                    content: 1,
                    headline: 1,
                    images: 1,
                    role: 1,
                    posted_by: 1,
                    postedByInfo: {
                        $cond: {
                            if: { $eq: ['$role', 'Medical Secretary'] }, 
                            then: { $arrayElemAt: ['$medicalSecretaryInfo', 0] }, 
                            else: { $arrayElemAt: ['$adminInfo', 0] }
                        }
                    }
                }
            }
        ]);

        res.json({ news: newsPosts });
    } catch (error) {
        console.error('Error fetching general news posts:', error);
        res.status(500).json({ message: 'Error fetching general news posts', error });
    }
};



  
const findNewsByUserId = (req, res) => {
    const { id, role } = req.params;
    
    const UserModel = role === 'Medical Secretary' ? MedicalSecretary : Admin;
    
    UserModel.findOne({ _id: id })
        .populate('news')
        .then((user) => {
            res.json({ user });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};

// Add new news by Medical Secretary or Admin
const addNewNewsByUserId = async (req, res) => {
    try {
        let imagePaths = [];

        // Handle file uploads and store file paths
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                // Save file path as images/$filename
                const imagePath = `images/${file.filename}`;
                return imagePath;
            });
        }

        // Set headline automatically (you can define the logic for headline generation)
        const headline = req.body.headline || "Default Headline"; // or any other logic to set headline

        const newNews = new News({
            content: req.body.content,
            headline: headline,  // Include the headline
            posted_by: req.params.id,
            role: req.body.role,  // Either 'MedicalSecretary' or 'Admin'
            images: imagePaths,  // Store image paths instead of base64
        });

        // Save the new news entry
        const savedNews = await newNews.save();

        // Choose the correct model based on the user's role
        const UserModel = req.body.role === 'Medical Secretary' ? MedicalSecretary : Admin;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $push: { news: savedNews._id } },
            { new: true }
        ).populate('news');

        res.json({ updatedUser, message: 'New news added successfully' });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ message: 'Error adding news', error });
    }
};


// Retrieve all news
const getAllNewsByUserId = (req, res) => {
    const { id, role } = req.params;
    const UserModel = role === 'Medical Secretary' ? MedicalSecretary : Admin;

    UserModel.findOne({ _id: id })
        .populate('news')
        .then((user) => {
            if (!user) {
                res.json({ message: `${role} not found` });
            }
            res.json({ news: user.news });
        })
        .catch((err) => {
            res.json({ message: 'Error retrieving news', error: err });
        });
};

// Delete news by index
// Delete news by its _id
const deleteNewsById = async (req, res) => {
    const newsId = req.params.newsId;
    const userId = req.params.id;
    const role = req.body.role;

    try {
        const UserModel = role === 'Medical Secretary' ? MedicalSecretary : Admin;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: `${role} not found` });
        }

        const newsToDelete = await News.findByIdAndDelete(newsId);
        if (!newsToDelete) {
            return res.status(404).json({ message: 'News not found' });
        }

        // Remove the deleted news from the user's news array
        user.news = user.news.filter(id => id.toString() !== newsId);
        const updatedUser = await user.save();

        res.json({ updatedUser, message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ message: 'Error deleting news', error });
    }
};


// Update news at specific index
const updateNewsAtIndex = async (req, res) => {
    const { userId, newsId } = req.params;
    const role = req.body.role;
    
    // Log values to see if they are correctly passed
    console.log("userId:", userId);
    console.log("newsId:", newsId);
    console.log("role:", role);

    try {
        // Choose the correct user model based on the role
        const UserModel = role === 'Medical Secretary' ? MedicalSecretary : Admin;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: `${role} not found` });
        }

        // Find the news by its newsId
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        // Handle new image uploads
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                // Save file path as images/$filename
                const imagePath = `images/${file.filename}`;
                return imagePath;
            });
        }

        // Handle deleted images
        let deletedImages = [];
        if (req.body.deletedImages) {
            deletedImages = JSON.parse(req.body.deletedImages);
            // Remove the images listed in deletedImages from the news' images array
            news.images = news.images.filter(image => !deletedImages.includes(image));
        }

        // Add new images to the news (if any)
        if (imagePaths.length > 0) {
            news.images.push(...imagePaths);
        }

        // Update the content
        news.content = req.body.content || news.content;

        // Save the updated news
        const updatedNews = await news.save();

        res.json({ updatedNews, message: 'News updated successfully' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Error updating news', error });
    }
};



const getNewsById = async (req, res) => {
    try {
      const news = await News.findOne({ news_ID: req.params.id });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json({ news });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  


module.exports = {
  addNewNewsByUserId,
  getAllNewsByUserId,
  deleteNewsById,
  updateNewsAtIndex,
  findNewsByUserId,
  getGeneralNews,
  getNewsById
};
