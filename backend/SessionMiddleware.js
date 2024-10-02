// SessionMiddleware.js
const ensurePatientSession = (req, res, next) => {
    if (req.session.role === "Patient" && req.session.userId) {
        return next(); // User is authenticated as a patient
    } else {
        res.status(401).json({ message: "Unauthorized access" });
    }
};

const ensureDoctorSession = (req, res, next) => {
    if (req.session.role === "Doctor" && req.session.userId) {
        return next(); // User is authenticated as a patient
    } else {
        res.status(401).json({ message: "Unauthorized access" });
    }
};

module.exports = { ensurePatientSession, ensureDoctorSession };
