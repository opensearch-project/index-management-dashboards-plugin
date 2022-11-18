import { ValidateFunction } from "../interfaces";
import messages from "../messages";
import { format as messageFormat } from "../util";

const pattern = {
  email: /[\w\u4E00-\u9FA5]+([-+.][\w\u4E00-\u9FA5]+)*@[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*\.[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*/,
  url: /^(?:(?:http|https|ftp):\/\/|\/\/)(?:(?:(?:[-\w\u00a1-\uffff]+)(?:\.[-\w\u00a1-\uffff]+)+|localhost)(?::\d{2,5})?(?:(?:\/|#)[^\s]*)?)$/,
  number: /\d*/,
  tel: /^(1\d{10})$|(((400)-(\d{3})-(\d{4}))|^((\d{7,8})|(\d{3,4})-(\d{7,8})|(\d{7,8})-(\d{1,4}))$)$|^([ ]?)$/,
};

const types = {
  number(value: any) {
    if (isNaN(value)) {
      return false;
    }
    return typeof value === "number" || (typeof value === "string" && !!value.match(pattern.number));
  },
  email(value: any) {
    return typeof value === "string" && !!value.match(pattern.email) && value.length < 255;
  },
  url(value: any) {
    return typeof value === "string" && !!value.match(pattern.url);
  },
  tel(value: any) {
    return typeof value === "string" && !!value.match(pattern.tel);
  },
};

const rules = {
  required: (rule, value) => {
    if (value === undefined || value === null || value === "" || value.length === 0) {
      return messageFormat(rule.message || messages.required, rule.aliasName || rule.field);
    }
  },
  format: (rule, value) => {
    const custom = ["email", "number", "url", "tel"];
    const ruleType = rule.format;
    if (ruleType && custom.indexOf(ruleType) > -1 && !types[ruleType](value)) {
      return messageFormat(rule.message || messages.format[ruleType], rule.aliasName || rule.field, ruleType);
    }
  },
  size: (rule, value) => {
    let key: "number" | "string" | null = null;
    const isNum = typeof value === "number";
    const isStr = typeof value === "string";

    if (isNum) {
      key = "number";
    } else if (isStr) {
      key = "string";
    }

    if (!key) {
      return false;
    }

    if (typeof rule.min === "number" || typeof rule.max === "number") {
      let val = value;
      const max = Number(rule.max);
      const min = Number(rule.min);

      if (isStr) {
        val = Number(val);
      }

      if (val < min) {
        return messageFormat(messages[key].min, rule.aliasName || rule.field, "" + rule.min);
      } else if (val > max) {
        return messageFormat(messages[key].max, rule.aliasName || rule.field, "" + rule.max);
      }
    }
  },
  pattern: (rule, value: string) => {
    if (rule.pattern) {
      if (rule.pattern instanceof RegExp) {
        if (!rule.pattern.test(value)) {
          return messageFormat(messages.pattern, rule.aliasName || rule.field, value, rule.pattern.toString());
        }
      } else if (typeof rule.pattern === "string") {
        const _pattern = new RegExp(rule.pattern);
        if (!_pattern.test(value)) {
          return messageFormat(messages.pattern, rule.aliasName || rule.field, value, rule.pattern);
        }
      }
    }
  },
} as Record<string, ValidateFunction>;

export default rules as Record<keyof typeof rules, ValidateFunction>;
