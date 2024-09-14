const Doctors = require('../doctor/doctor_model'); 

const updateActivityStatus = async (doctorId, status) => {
    try {
        const updateData = {
            activityStatus: status
        };
        if (status === 'Online') {
            updateData.lastActive = Date.now();
        }
        await Doctors.findByIdAndUpdate(doctorId, updateData);
        console.log(`Doctor ${doctorId} status updated to ${status}.`);
    } catch (err) {
        console.error('Error updating activity status:', err);
        throw new Error('Failed to update activity status');
    }
};

module.exports = {
    updateActivityStatus
};
