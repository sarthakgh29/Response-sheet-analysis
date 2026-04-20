export function validateComparisonUploadRequest(req, res, next) {
  const fileA = req.files?.waveA?.[0];
  const fileB = req.files?.waveB?.[0];

  if (!fileA || !fileB) {
    return res.status(400).json({
      message: 'Both waveA and waveB files are required.',
    });
  }

  const allowed = ['text/csv', 'application/vnd.ms-excel'];

  if (!allowed.includes(fileA.mimetype) || !allowed.includes(fileB.mimetype)) {
    return res.status(400).json({
      message: 'Both uploaded files must be CSV files.',
    });
  }

  next();
}