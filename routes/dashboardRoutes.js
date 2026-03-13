const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const rentPerformanceController = require('../controllers/rentPerformanceController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'spaces');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}${path.extname(file.originalname)}`);
	}
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 8 } });

router.get('/', dashboardController.getDashboard);
router.get('/add-space', dashboardController.getAddSpace);
router.get('/my-booking', dashboardController.getMyBooking);
router.get('/my-rent', dashboardController.getMyRent);
router.get('/rent-performance', rentPerformanceController.getRentPerformance);
router.post('/my-rent/:id/update', dashboardController.updateMyRentSpace);
router.post('/my-rent/:id/images', upload.array('image_files', 8), dashboardController.addSpaceImages);
router.post('/my-rent/:id/archive', dashboardController.archiveSpace);
router.post('/my-rent/:id/delete', dashboardController.deleteSpace);

module.exports = router;
