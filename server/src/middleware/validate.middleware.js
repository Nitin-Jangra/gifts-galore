/**
 * Generic Zod validation middleware for Express routes
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // assign sanitized data
      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          status: 'fail',
          code: 'VALIDATION_ERROR',
          message: 'Request input validation failed.',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}
