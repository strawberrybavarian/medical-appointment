const Doctors = require('../doctor/doctor_model'); 
const socket = require('../socket');

const updateActivityStatus = async (doctorId, status) => {
    try {

        const updateData = {
            activityStatus: status
        };


        if (status === 'Online') {
            updateData.lastActive = Date.now();
        }

        const updatedDoctor = await Doctors.findByIdAndUpdate(doctorId, updateData, { new: true });
        console.log('Doctor status updated:', status);

    
        const io = socket.getIO();  
        io.emit('doctorStatusUpdate', {
            doctorId: updatedDoctor._id.toString(),
            activityStatus: updatedDoctor.activityStatus,
            lastActive: updatedDoctor.lastActive,  
        });

    } catch (error) {
        console.log('Error updating doctor status:', error);
    }
};

module.exports = {
    updateActivityStatus
};
