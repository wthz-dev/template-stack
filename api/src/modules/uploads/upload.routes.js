const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const { env } = require('../../config/env');
const { authenticate } = require('../../middlewares/authenticate');
const { requireRole } = require('../../middlewares/requireRole');
const { BadRequestError } = require('../../shared/errors');
const controller = require('./upload.controller');

const uploadDirAbs = path.resolve(__dirname, '../../..', env.UPLOAD_DIR);
fs.mkdirSync(uploadDirAbs, { recursive: true });

function createFilename(originalName) {
  const ext = path.extname(originalName || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `${Date.now()}-${id}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirAbs),
  filename: (req, file, cb) => cb(null, createFilename(file.originalname))
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const blocked = new Set(['text/html', 'application/xhtml+xml', 'application/javascript']);
    if (blocked.has(file.mimetype)) {
      return cb(new BadRequestError('This file type is not allowed'));
    }
    return cb(null, true);
  }
});

const router = express.Router();
router.use(authenticate);
router.use(requireRole(['admin', 'editor']));

router.post('/', upload.single('file'), controller.uploadSingle);

module.exports = { router };
