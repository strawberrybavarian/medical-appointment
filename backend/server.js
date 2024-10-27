const express = require("express");
const app = express();
const port = 8000;
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const http = require('http');
const server = http.createServer(app); // Use this server for Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for your development environment
    methods: ['GET', 'POST'],
  },
});
const ChatMessage = require('./chat/chat_model');
const Patient = require('./patient/patient_model');
const MedicalSecretary = require('./medicalsecretary/medicalsecretary_model'); // Adjust the path as necessary
const Admin = require('./admin/admin_model')
require('dotenv').config();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

require("./config/mongoose");

// CORS Configuration
const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for images
app.use('/images', express.static(path.join(__dirname, 'doctor', 'images')));
app.use('/images', express.static(path.join(__dirname, 'patient', 'images')));
app.use('/images', express.static(path.join(__dirname, 'prescription', 'images')));
app.use('/images', express.static(path.join(__dirname, 'appointments', 'images')));
app.use('/images', express.static(path.join(__dirname, 'payment', 'images')));
app.use('/images', express.static(path.join(__dirname, 'announcement', 'images')));
app.use('/images', express.static(path.join(__dirname, 'news', 'images')));
app.use('/images', express.static(path.join(__dirname, 'specialty', 'images')));
app.use('/images', express.static(path.join(__dirname, 'services', 'images')));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/uploads', cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}), express.static(path.join(__dirname, 'public/uploads')));

app.get('/uploads/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', fileName);

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found.');
    }
});

app.use(express.static(path.join(__dirname, '../frontend/public')));

// Route Imports
const DoctorRoutes = require("./doctor/doctor_routes");
DoctorRoutes(app);
const PatientRoutes = require("./patient/patient_routes");
PatientRoutes(app);
const MedicalSecretaryRoutes = require("./medicalsecretary/medicalsecretary_routes");
MedicalSecretaryRoutes(app);
const CashierRoutes = require("./cashier/cashier_routes");
CashierRoutes(app);
const AdminRoutes = require('./admin/admin_routes');
AdminRoutes(app);

const FindingsRoutes = require("./findings/findings_routes");
FindingsRoutes(app);
const PrescriptionRoutes = require("./prescription/prescription_routes");
PrescriptionRoutes(app);
const AppointmentRoutes = require('./appointments/appointment_routes');
AppointmentRoutes(app);
const AnnouncementRoutes = require('./announcement/announcement.routes');
AnnouncementRoutes(app);
const ImmunizationRoutes = require('./immunization/immunization_routes');
ImmunizationRoutes(app);
const NewsRoutes = require('./news/news_routes');
NewsRoutes(app);
const LaboratoryRoutes = require('./laboratory/laboratory_routes');
LaboratoryRoutes(app);
const SpecialtyRoutes = require('./specialty/specialty_routes');
SpecialtyRoutes(app);
const ServiceRoutes = require('./services/service_routes');
ServiceRoutes(app);
const HmoRoutes = require('./hmo/hmo_routes');
HmoRoutes(app);
const ChatRoutes = require('./chat/chat_routes');
ChatRoutes(app);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

const users = {}; // To keep track of connected users

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user identification
  socket.on('identify', async (userData) => {
    socket.userId = userData.userId.toString();
    socket.userRole = userData.userRole;
    users[socket.userId] = {
      socketId: socket.id,
      userRole: socket.userRole,
    };

    console.log(`${socket.userRole} connected: ${socket.userId}`);

    if (socket.userRole === 'Medical Secretary' || socket.userRole === 'Admin') {
      // Send the list of patients who have chatted
      const patients = await ChatMessage.aggregate([
        {
          $match: {
            senderModel: 'Patient',
          },
        },
        {
          $group: { _id: '$sender' },
        },
        {
          $lookup: {
            from: 'patients',
            localField: '_id',
            foreignField: '_id',
            as: 'patientInfo',
          },
        },
        {
          $unwind: '$patientInfo',
        },
        {
          $project: {
            _id: 0,
            _id: '$patientInfo._id',
            name: {
              $concat: [
                '$patientInfo.patient_firstName',
                ' ',
                '$patientInfo.patient_lastName',
              ],
            },
          },
        },
      ]);

      socket.emit('patient list', patients);
    }
  });

  // Handle incoming chat messages
  socket.on('chat message', async (data) => {
    console.log('Message received:', data);

    let receivers = [];

    if (data.senderModel === 'Patient') {
      // Patient is sending a message to staff
      // Get all Medical Secretary and Admin IDs
      const medSecs = await MedicalSecretary.find({}, '_id');
      const admins = await Admin.find({}, '_id');
      receivers = [
        ...medSecs.map((medSec) => medSec._id.toString()),
        ...admins.map((admin) => admin._id.toString()),
      ];
      data.receiverModel = 'Staff';
    } else if (data.senderModel === 'Medical Secretary' || data.senderModel === 'Admin') {
      if (data.receiverId) {
        // Staff is sending a message to a patient
        receivers = [data.receiverId.toString()];
        data.receiverModel = 'Patient';
      } else {
        console.error('Receiver ID is required for staff messages');
        return;
      }
    } else {
      console.error('Invalid sender model');
      return;
    }

    const chatMessage = new ChatMessage({
      sender: data.senderId,
      senderModel: data.senderModel,
      receiver: receivers,
      receiverModel: data.receiverModel,
      message: data.message,
    });

    // Get sender's name
    const senderName = await getSenderName(chatMessage.sender, chatMessage.senderModel);
    chatMessage.senderName = senderName;

    await chatMessage.save();

    const messageData = {
      _id: chatMessage._id.toString(),
      sender: chatMessage.sender.toString(),
      senderModel: chatMessage.senderModel,
      senderName: senderName,
      receiver: chatMessage.receiver.map((id) => id.toString()),
      receiverModel: chatMessage.receiverModel,
      message: chatMessage.message,
      createdAt: chatMessage.createdAt,
    };

    // Function to get the sender's name based on their model
    async function getSenderName(senderId, senderModel) {
      if (senderModel === 'Patient') {
        const patient = await Patient.findById(senderId);
        return `${patient.patient_firstName} ${patient.patient_lastName}`;
      } else if (senderModel === 'Medical Secretary') {
        const medSec = await MedicalSecretary.findById(senderId);
        return `${medSec.medSec_firstName} ${medSec.medSec_lastName}`;
      } else if (senderModel === 'Admin') {
        const admin = await Admin.findById(senderId);
        return `${admin.admin_firstName} ${admin.admin_lastName}`;
      } else {
        return 'Unknown Sender';
      }
    }

    // Emit the message back to the sender
    const senderSocket = users[data.senderId];
    if (senderSocket) {
      io.to(senderSocket.socketId).emit('chat message', messageData);
    }

    // Emit the message to the appropriate receivers, excluding the sender
    if (data.senderModel === 'Patient') {
      // Emit to all connected Medical Secretaries and Admins
      for (let userId in users) {
        const user = users[userId];
        if (
          (user.userRole === 'Medical Secretary' || user.userRole === 'Admin') &&
          user.userId !== data.senderId // Exclude the sender
        ) {
          io.to(user.socketId).emit('chat message', messageData);
        }
      }
    } else if (data.senderModel === 'Medical Secretary' || data.senderModel === 'Admin') {
      // Emit to the patient if connected
      const receiverSocket = users[data.receiverId];
      if (receiverSocket && receiverSocket.userRole === 'Patient') {
        io.to(receiverSocket.socketId).emit('chat message', messageData);
      }

      // Emit to other staff members (excluding the sender)
      for (let userId in users) {
        const user = users[userId];
        if (
          (user.userRole === 'Medical Secretary' || user.userRole === 'Admin') &&
          user.userId !== data.senderId // Exclude the sender
        ) {
          io.to(user.socketId).emit('chat message', messageData);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove the user from the users object
    for (let userId in users) {
      if (users[userId].socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

  
// Start the server
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});