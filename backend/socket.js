const { Server } = require('socket.io');
const ChatMessage = require('./chat/chat_model');
const Patient = require('./patient/patient_model');
const MedicalSecretary = require('./medicalsecretary/medicalsecretary_model');
const Admin = require('./admin/admin_model');
const Doctor = require('./doctor/doctor_model'); 

let io;
const clients = {}; 

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      // console.log('A user connected:', socket.id);

      socket.on('identify', async (userData) => {
        console.log('Identify event received:', userData);

        if (!userData.userId) {
          console.error('User ID is undefined in identify event');
          return;
        }

        socket.userId = userData.userId.toString();
        socket.userRole = userData.userRole;
        clients[socket.userId] = socket;

        // If user is a doctor, check their ongoing session
        if (socket.userRole === 'Doctor') {
          const doctor = await Doctor.findById(socket.userId).populate('dr_appointments');
          
          if (doctor) {
            const lastAppointment = doctor.dr_appointments[doctor.dr_appointments.length - 1];  // Get the last appointment
            console.log("Last appointment:", lastAppointment.status);  
            // Check if the last appointment is "Ongoing"
            if (lastAppointment && lastAppointment.status === 'Ongoing') {
              const updatedDoctor = await Doctor.findByIdAndUpdate(
                socket.userId, 
                { activityStatus: 'In Session' }, 
                { new: true });
                if(updatedDoctor) {
                  io.emit("doctorStatusUpdate", {
                    doctorId: updatedDoctor._id.toString(),
                    activityStatus: 'In Session',
                    patientId: updatedDoctor.patientId, // track patient ID if in session
                  });
    
                }
   
              console.log("Doctor is in session:", updatedDoctor.activityStatus);
             
            } else {
              const updatedDoctor = await Doctor.findByIdAndUpdate(
                socket.userId,
                { activityStatus: 'Online' },
                { new: true }
              );
              if (updatedDoctor) {
                io.emit("doctorStatusUpdate", {
                  doctorId: updatedDoctor._id.toString(),
                  activityStatus: updatedDoctor.activityStatus,
              
                });

                console.log("Doctor is in session:", updatedDoctor.activityStatus);
              }
            }
          }
        }

        // Handle other roles like Medical Secretary or Admin
        if (socket.userRole === 'Medical Secretary' || socket.userRole === 'Admin') {
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

      socket.on('disconnect', async () => {
        // console.log('User disconnected:', socket.id);

        if (socket.userRole === 'Doctor') {
          const updatedDoctor = await Doctor.findByIdAndUpdate(
            socket.userId,
            { activityStatus: 'Offline', lastActive: Date.now() },
            { new: true }
          );
          if (updatedDoctor) {
            io.emit('doctorStatusUpdate', {
              doctorId: updatedDoctor._id.toString(),
              activityStatus: updatedDoctor.activityStatus,
              lastActive: updatedDoctor.lastActive,
            });
            console.log("Doctor disconnected, status updated:", updatedDoctor.activityStatus);
          }
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
  clients: clients,

  broadcastGeneralNotification: (notificationData) => {
    for (let userId in clients) {
      const userSocket = clients[userId];
      if (userSocket.userRole === 'Medical Secretary' || userSocket.userRole === 'Admin') {
        userSocket.emit('newGeneralNotification', notificationData);
      }
    }
  },

  broadcastNotificationToAdmins: (notificationData) => {
    for (let userId in clients) {
      const userSocket = clients[userId];
      if (userSocket.userRole === 'Admin') {
        userSocket.emit('newGeneralNotification', notificationData);
      }
    }
  },

  broadcastNotificationToMedSecs: (notificationData) => {
    for (let userId in clients) {
      const userSocket = clients[userId];
      if (userSocket.userRole === 'Medical Secretary') {
        userSocket.emit('newGeneralNotification', notificationData);
      }
    }
  },
};

async function getSenderName(senderId, senderModel) {
  if (senderModel === 'Patient') {
    const patient = await Patient.findById(senderId);
    return `${patient.patient_firstName} ${patient.patient_lastName}`;
  } else if (senderModel === 'Medical Secretary') {
    const medSec = await MedicalSecretary.findById(senderId);
    return `${medSec.ms_firstName} ${medSec.ms_lastName}`;
  } else if (senderModel === 'Admin') {
    const admin = await Admin.findById(senderId);
    return `${admin.firstName} ${admin.lastName}`;
  } else {
    return 'Unknown Sender';
  }
}
