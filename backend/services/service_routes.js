const ServicesController = require('./service_controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
console.log('Service Routes Connected')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'images'); // Adjust the path to your 'images' directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
module.exports = app => {
    // app.post('/admin/api/signup', AdminController.NewAdminSignUp)
 

    app.post('/api/admin/add/services', upload.single('image'), ServicesController.createService);
    app.put('/api/admin/update/services/:id', upload.single('image'), ServicesController.updateService);

    app.get('/api/admin/getall/services', ServicesController.getAllServices);
    

    app.get('/api/admin/services/:id', ServicesController.getServiceById);
    


    

    app.delete('/api/admin/delete/services/:id', ServicesController.deleteService);

    app.post('/api/doctor/:doctorId/add-service/:serviceId', ServicesController.addServiceToDoctor); // Doctor adds a service they offer
    app.delete('/api/doctor/:doctorId/remove-service/:serviceId', ServicesController.removeServiceFromDoctor); // Doctor removes a service they offer
    app.get('/api/doctor/:doctorId/services-status', ServicesController.fetchDoctorServiceStatus);



}