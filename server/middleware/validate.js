const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = source === "query" ? req.query : req.body;
    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      res.status(400);
      throw new Error(errorMessage);
    }
    next();
  };
};

module.exports = validate;
