import * as util from "../util";

const pattern = {
  email: /[\w\u4E00-\u9FA5]+([-+.][\w\u4E00-\u9FA5]+)*@[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*\.[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*/,
  url: /^(?:(?:http|https|ftp):\/\/|\/\/)(?:(?:(?:[-\w\u00a1-\uffff]+)(?:\.[-\w\u00a1-\uffff]+)+|localhost)(?::\d{2,5})?(?:(?:\/|#)[^\s]*)?)$/,
  number: /\d*/,
  tel: /^(1\d{10})$|(((400)-(\d{3})-(\d{4}))|^((\d{7,8})|(\d{3,4})-(\d{7,8})|(\d{7,8})-(\d{1,4}))$)$|^([ ]?)$/,
};

const types = {
  number(value) {
    if (isNaN(value)) {
      return false;
    }
    return typeof value === "number" || (typeof value === "string" && !!value.match(pattern.number));
  },
  email(value) {
    return typeof value === "string" && !!value.match(pattern.email) && value.length < 255;
  },
  url(value) {
    return typeof value === "string" && !!value.match(pattern.url);
  },
  tel(value) {
    return typeof value === "string" && !!value.match(pattern.tel);
  },
  IDNumber(value) {
    return validatorIDNumber(value);
  },
};

/**
 *  Rule for validating the type of a value.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
function format(rule, value, errors, options) {
  const custom = ["email", "number", "url", "tel", "IDNumber"];
  const ruleType = rule.format;
  if (custom.indexOf(ruleType) > -1 && !types[ruleType](value)) {
    errors.push(util.format(options.messages.format[ruleType], rule.aliasName || rule.field, rule.format));
  }
}

/**
 * @params {string} idcode
 *
 * The function parameter must be a string, because the second-generation ID number is eighteen digits, and in javascript, the value of eighteen digits will exceed the calculation range, resulting in inaccurate results.
 * As a result, the last two digits are inconsistent with the calculated value, so the function fails (see the range of values ​​in javascript for details).
 * To avoid this error, idcode must be a string
 *
 * Regular way of thinking:
 *   The first bit cannot be 0
 *   The second to sixth digits can be 0-9
 *   The seventh to tenth digits are the year, so the seventh and eighth digits are 19 or 20
 *   The eleventh and twelfth digits are the month, and the two digits are values ​​between 01-12
 *   The thirteenth and fourteenth digits are the date, which is a numerical value from 01-31
 *   Fifteen, sixteen, seventeen are numbers 0-9
 *   Eighteen digits may be numbers 0-9, or X
 * */
function validatorIDNumber(idCode) {
  if (typeof idCode !== "string") {
    return false;
  }
  const idCardPatter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;
  // Check if the format is correct
  const format = idCardPatter.test(idCode);
  if (!format) {
    return false;
  }
  // Weighting factor
  const weightFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // check code
  const checkCode = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  const last = idCode[17]; //last
  const seventeen = idCode.substring(0, 17);
  // ISO 7064:1983.MOD 11-2
  // Determine whether the last check code is correct
  const arr = seventeen.split("");
  const len = arr.length;
  let num = 0;
  for (let i = 0; i < len; i++) {
    num += arr[i] * weightFactor[i];
  }
  // get remainder
  const lastNo = checkCode[num % 11];
  // Return the verification result, the verification code and the format are correct at the same time to be considered a legal ID number
  return last === lastNo;
}

export default format;
