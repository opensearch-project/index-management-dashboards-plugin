export default {
  default: "%s verification failed",
  required: "%s is a required field",
  format: {
    number: "%s is not a legal number",
    email: "%s is not a valid email address",
    url: "%s is not a valid URL address",
    tel: "%s is not a valid phone number",
  },
  number: {
    length: "%s length must be %s",
    min: "%s field value must not be less than %s",
    max: "%s field value must not be greater than %s",
    minLength: "%s field character length must be at least %s",
    maxLength: "%s field character length cannot exceed %s",
  },
  string: {
    length: "%s length must be %s",
    min: "%s field value must not be less than %s",
    max: "%s field value must not be greater than %s",
    minLength: "%s field character length must be at least %s",
    maxLength: "%s field character length cannot exceed %s",
  },
  array: {
    length: "%s length must be %s",
    minLength: "%s must not be less than %s",
    maxLength: "%s must not exceed %s",
  },
  pattern: "%s field value %s does not match the regular %s",
};
