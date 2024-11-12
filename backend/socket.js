// socket.js

const { Server } = require('socket.io');
const ChatMessage = require('./chat/chat_model');
const Patient = require('./patient/patient_model');
const MedicalSecretary = require('./medicalsecretary/medicalsecretary_model');
const Admin = require('./admin/admin_model');

let io;
const clients = {}; // Map to keep track of connected users

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*', // Adjust as needed
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Handle user identification
      socket.on('identify', async (userData) => {
        console.log('Identify event received:', userData);
        socket.userId = userData.userId.toString();
        socket.userRole = userData.userRole;
        clients[socket.userId] = socket; // Store the socket instance

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
        const senderSocket = clients[data.senderId];
        if (senderSocket) {
          senderSocket.emit('chat message', messageData);
        }

        // Emit the message to the appropriate receivers, excluding the sender
        if (data.senderModel === 'Patient') {
          // Emit to all connected Medical Secretaries and Admins
          for (let userId in clients) {
            const userSocket = clients[userId];
            if (
              (userSocket.userRole === 'Medical Secretary' || userSocket.userRole === 'Admin') &&
              userId !== data.senderId // Exclude the sender
            ) {
              userSocket.emit('chat message', messageData);
            }
          }
        } else if (data.senderModel === 'Medical Secretary' || data.senderModel === 'Admin') {
          // Emit to the patient if connected
          const receiverSocket = clients[data.receiverId];
          if (receiverSocket && receiverSocket.userRole === 'Patient') {
            receiverSocket.emit('chat message', messageData);
          }

          // Emit to other staff members (excluding the sender)
          for (let userId in clients) {
            const userSocket = clients[userId];
            if (
              (userSocket.userRole === 'Medical Secretary' || userSocket.userRole === 'Admin') &&
              userId !== data.senderId // Exclude the sender
            ) {
              userSocket.emit('chat message', messageData);
            }
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId && clients[socket.userId]) {
          delete clients[socket.userId];
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  clients: clients, // Export the clients map
};
