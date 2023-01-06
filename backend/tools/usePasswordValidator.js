const passwordValidator = require("password-validator");

module.exports.passwordRequirements =
  'The password must be at between 7 and 14 characters and include at least one of each of the following: uppercase letter, lowercase letter and a number. It can not contain any spaces and can not be an unsafe password like "password123".';

// Add properties to it
module.exports.usePasswordValidator = (passwordToCheck, returnList) => {
  const outputFunction = (passwordToCheck, returnList) => {
    // Create a schema
    const schema = new passwordValidator();
    schema
      .is()
      .min(7) // Minimum length 8
      .is()
      .max(14) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits(1) // Must have at least 2 digits
      .has()
      .not()
      .spaces() // Should not have spaces
      .is()
      .not()
      .oneOf(["Passw0rd", "Password123"]); // Blacklist these values}

    return {
      isValid: schema.validate(passwordToCheck),
      details: schema.validate(passwordToCheck, { details: returnList }),
    };
  };
  return outputFunction;
};
