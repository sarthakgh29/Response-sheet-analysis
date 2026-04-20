export function validateUploadRequest(req, _res, next) {
  if (!req.file) {
    const error = new Error('CSV file is required.');
    error.statusCode = 400;
    return next(error);
  }
  if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
    const error = new Error('Only .csv files are supported.');
    error.statusCode = 400;
    return next(error);
  }
  next();
}
