/**
 * Utility middleware to validate that required fields exist in request body
 * @param {string[]} requiredFields 
 */
export const validateBody = (requiredFields) => {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty.'
      });
    }

    const missing = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};
