const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({ success: false, message: 'Validation error', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'Record already exists' });
  }
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
