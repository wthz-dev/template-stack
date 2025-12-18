const { BadRequestError } = require('../../shared/errors');

async function uploadSingle(req, res, next) {
  try {
    if (!req.file) {
      throw new BadRequestError('File is required');
    }

    const filePath = `/uploads/${req.file.filename}`;
    const url = `${req.protocol}://${req.get('host')}${filePath}`;

    return res.status(201).json({
      item: {
        url,
        path: filePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { uploadSingle };
