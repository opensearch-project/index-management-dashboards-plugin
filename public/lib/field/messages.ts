/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
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
