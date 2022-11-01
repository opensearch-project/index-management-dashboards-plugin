/* eslint-disable callback-return */
import { complementError, asyncMap, asyncMapPromise, processErrorResults } from "./util";
import defaultMessages from "./messages";
import { getValidationMethod } from "./validator";

function noop() {}
/**
 * @param {Object} source {name: value, name2: value2}
 * @param {Object} rules {name: [rule1, rule2]}
 * @returns {Object} {name:[{value,rule1},{value, rule2}]}
 */
function serializeRules(source, rules) {
  // serialize rules
  let arr;
  let value;
  const series = {};
  const names = Object.keys(rules);
  names.forEach((name) => {
    arr = rules[name];
    value = source[name];

    if (!Array.isArray(arr)) {
      arr = [arr];
    }

    arr.forEach((rule) => {
      rule.validator = getValidationMethod(rule);
      rule.field = name;
      if (!rule.validator) {
        return;
      }
      series[name] = series[name] || [];
      series[name].push({ rule, value, source, field: name });
    });
  });

  return series;
}
class Schema {
  constructor(rules, options = {}) {
    this._rules = rules;
    this._options = {
      ...options,
      messages: {
        ...defaultMessages,
        ...options.messages,
      },
    };
    this.complete = [];
  }

  abort() {
    for (let i = 0; i < this.complete.length; i++) {
      this.complete[i] = noop;
    }
  }

  messages(messages) {
    this._options.messages = Object.assign({}, this._options.messages, messages);
  }

  /**
   *
   * @param {Object} source - map of field names and values to use in validation
   * @param {Function} callback - OPTIONAL - callback to run after all
   * @returns {null | Promise}
   *          - { null } - if using callbacks
   *          - { Promise }
   *              - { errors: null } - if no rules or no errors
   *              - { errors: Array, fields: Object } - errors from validation and fields that have errors
   */
  validate(source, callback) {
    if (!callback) {
      return this.validatePromise(source);
    }

    if (!this._rules || Object.keys(this._rules).length === 0) {
      if (callback) {
        callback(null);
      }
      return;
    }

    const series = serializeRules(source, this._rules);

    if (Object.keys(series).length === 0) {
      callback(null);
    }

    // callback function for all rules return
    function complete(results) {
      let i;
      let field;
      let errors = [];
      let fields = {};

      function add(e) {
        if (Array.isArray(e)) {
          errors = errors.concat(e);
        } else {
          errors.push(e);
        }
      }

      for (i = 0; i < results.length; i++) {
        add(results[i]);
      }
      if (!errors.length) {
        errors = null;
        fields = null;
      } else {
        for (i = 0; i < errors.length; i++) {
          field = errors[i].field;
          fields[field] = fields[field] || [];
          fields[field].push(errors[i]);
        }
      }
      callback(errors, fields);
    }

    // The reason for using an array here is to facilitate external abort calls
    // eg: When the input onChange is called, the asynchronous validator is called multiple times asynchronously, and we only take the last call. Otherwise, the previous validator may return resulting in
    this.complete.push(complete);
    const idx = this.complete.length;

    // async validate
    asyncMap(
      series,
      this._options,
      (data, next) => {
        const rule = data.rule;
        rule.field = data.field;

        function cb(e) {
          let errors = e;

          // fix e=/""/null/undefiend.
          // ignore e=true/false;
          if (typeof errors !== "boolean" && !errors) {
            errors = [];
          }

          if (!Array.isArray(errors)) {
            errors = [errors];
          }

          // 自定义错误
          if (errors.length && rule.message) {
            errors = [].concat(rule.message);
          }

          errors = errors.map(complementError(rule));

          next(errors);
        }

        const res = rule.validator(rule, data.value, cb, this._options);
        if (res && res.then) {
          res.then(
            () => cb(),
            (e) => cb(e)
          );
        }
      },
      (results) => {
        this.complete[idx - 1](results);
      }
    );
  }

  /**
   *
   * @param {Object} source - map of field names and values to use in validation
   * @returns {Promise}
   *          - { errors: null } if no rules or no errors
   *          - { errors: Array, fields: Object } - errors from validation and fields that have errors
   */
  async validatePromise(source) {
    if (!this._rules || Object.keys(this._rules).length === 0) {
      return { errors: null };
    }

    const series = serializeRules(source, this._rules);

    if (Object.keys(series).length === 0) {
      return { errors: null };
    }

    const results = await asyncMapPromise(series, this._options, async (data) => {
      const rule = data.rule;
      rule.field = data.field;

      let errors;

      try {
        errors = await new Promise((resolve, reject) => {
          function cb(e) {
            resolve(e);
          }

          const res = rule.validator(rule, data.value, cb, this._options);
          if (res && res.then) {
            res.then(
              () => cb(),
              (e) => cb(e)
            );
          }
        });
      } catch (error) {
        errors = error;
      }

      if (errors) {
        // fix e=/""/null/undefiend.
        // ignore e=true/false;
        if (typeof errors !== "boolean" && !errors) {
          errors = [];
        }

        if (!Array.isArray(errors)) {
          errors = [errors];
        }

        // custom error
        if (errors.length && rule.message) {
          errors = [].concat(rule.message);
        }

        return errors.map(complementError(rule));
      } else {
        return [];
      }
    });

    return processErrorResults(results);
  }
}

export default Schema;
