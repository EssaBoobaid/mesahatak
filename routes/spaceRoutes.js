const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const spaceController = require('../controllers/spaceController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'spaces');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage to persist images
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}${path.extname(file.originalname)}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024, files: 12 }
});

router.get('/new', spaceController.getAddSpaceForm);
router.get('/', spaceController.listSpaces);
router.get('/:id', spaceController.getSpaceDetails);
router.post('/', upload.array('image_files', 12), spaceController.createSpace);
router.post('/new', upload.array('image_files', 12), spaceController.createSpace);

module.exports = router;
