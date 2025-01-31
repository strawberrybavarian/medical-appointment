// news_controller.js

const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');
const News = require('./news_model');
const fs = require('fs');
const path = require('path');
const Notification = require('../notifications/notifications_model');
const Patient = require('../patient/patient_model');
const Doctor = require('../doctor/doctor_model');
const socket = require('../socket'); // Import the socket module;

const getGeneralNews = async (req, res) => {
    try {
        const newsPosts = await News.aggregate([
            {
                $lookup: {
                    from: 'medicalsecretaries',
                    localField: 'posted_by',
                    foreignField: '_id',
                    as: 'medicalSecretaryInfo'
                }
            },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'posted_by',
                    foreignField: '_id',
                    as: 'adminInfo'
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


const addNewNewsByUserId = async (req, res) => {
  try {
    let imagePaths = [];

    // Handle file uploads and store file paths
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => {
        const imagePath = `images/${file.filename}`;
        return imagePath;
      });
    }

    // Set headline
    const headline = req.body.headline || 'Default Headline';

    const newNews = new News({
      content: req.body.content,
      headline: headline,
      posted_by: req.params.id,
      role: req.body.role,
      images: imagePaths,
    });

    // Save the new news entry
    const savedNews = await newNews.save();

    // Choose the correct model based on the user's role
    const UserModel =
      req.body.role === 'Medical Secretary' ? MedicalSecretary : Admin;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $push: { news: savedNews._id } },
      { new: true }
    ).populate('news');

    // Send notifications to all Patients and Doctors
    try {
      const patients = await Patient.find();
      const doctors = await Doctor.find();

      const notificationMessage = `New News: ${headline}`;
      const link = `/news/${savedNews.news_ID}`;

      // Create notifications for patients
      const patientNotifications = patients.map((patient) => {
        return new Notification({
          message: notificationMessage,
          receiver: patient._id,
          receiverModel: 'Patient',
          isRead: false,
          link: link,
          type: 'News',
          recipientType: 'Patient',
        });
      });

      // Create notifications for doctors
      const doctorNotifications = doctors.map((doctor) => {
        return new Notification({
          message: notificationMessage,
          receiver: doctor._id,
          receiverModel: 'Doctor',
          isRead: false,
          link: link,
          type: 'News',
          recipientType: 'Doctor',
        });
      });

      // Save all notifications to the database
      const allNotifications = [...patientNotifications, ...doctorNotifications];
      const savedNotifications = await Notification.insertMany(allNotifications);

      // Update patients with the notifications
      await Promise.all(
        patients.map(async (patient) => {
          const notification = savedNotifications.find((n) =>
            n.receiver.toString() === patient._id.toString()
          );
          if (notification) {
            await Patient.findByIdAndUpdate(patient._id, {
              $push: { notifications: notification._id },
            });
          }
        })
      );

      // Update doctors with the notifications
      await Promise.all(
        doctors.map(async (doctor) => {
          const notification = savedNotifications.find((n) =>
            n.receiver.toString() === doctor._id.toString()
          );
          if (notification) {
            await Doctor.findByIdAndUpdate(doctor._id, {
              $push: { notifications: notification._id },
            });
          }
        })
      );

      // Emit socket.io event to patients and doctors
      const io = socket.getIO(); // Get the initialized io instance
      const clients = socket.clients; // Get the clients map

      if (io && clients) {
        // Send to all connected patients and doctors
        for (let userId in clients) {
          const userSocket = clients[userId];
          const userRole = userSocket.userRole;

          console.log(`Emitting newNews event to userId: ${userId}, userRole: ${userRole}`);

          if (userRole === 'Patient' || userRole === 'Doctor') {
            userSocket.emit('newNews', {
              message: notificationMessage,
              link: `/news/${savedNews.news_ID}`,
              news_ID: savedNews.news_ID,
              headline: headline,
              images: imagePaths,
              notificationId: savedNotifications.find(
                (n) => n.receiver.toString() === userId
              )?._id.toString(), // Include notification ID
            });
          }
        }
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Handle notification error, but do not block the response
    }

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
              return res.json({ message: `${role} not found` }); // Add return here
          }
          res.json({ news: user.news });
      })
      .catch((err) => {
          res.json({ message: 'Error retrieving news', error: err });
      });
};

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

        // Update the content and headline
        news.content = req.body.content || news.content;
        news.headline = req.body.headline || news.headline;

        // Save the updated news
        const updatedNews = await news.save();

        return res.json({ updatedNews, message: 'News updated successfully' });
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

const markAsRead = async (req, res) => {
    try {
      const notificationId = req.params.id;
  
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read', error });
    }
  };

module.exports = {
    addNewNewsByUserId,
    getAllNewsByUserId,
    deleteNewsById,
    updateNewsAtIndex,
    findNewsByUserId,
    getGeneralNews,
    getNewsById,
    markAsRead
};
