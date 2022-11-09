const formatRegExp = /%[sdj%]/g;

export function format(...args) {
  let i = 1;
  const f = args[0];
  const len = args.length;
  if (typeof f === "function") {
    return f(args.slice(1));
  }
  if (typeof f === "string") {
    const str = String(f).replace(formatRegExp, (x) => {
      if (x === "%%") {
        return "%";
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case "%s":
          return String(args[i++]);
        case "%d":
          return Number(args[i++]);
        case "%j":
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return "[Circular]";
          }
        default:
          return x;
      }
    });

    return str;
  }
  return f;
}

/**
 * Concatenate a set of data and return only the first error result
 * @param {*} arr
 * @param {*} validator
 * @param {*} callback Exit recursion, tell error checking done
 */
function _asyncValidateSerials(arr, validator, callback) {
  let index = 0;
  const arrLength = arr.length;

  function next(errors) {
    if (errors && errors.length) {
      return callback(errors);
    }
    const original = index;
    index = index + 1;
    if (original < arrLength) {
      validator(arr[original], next);
    } else {
      return callback([]);
    }
  }

  next([]);
}

/**
 * Concatenate a set of data and return only the first error result
 * @param {*} arr
 * @param {*} validator
 * @returns
 */
async function _promiseValidateSeries(arr, validator) {
  return arr.reduce(async (prevPromise, next) => {
    let errors;
    try {
      errors = await prevPromise;
    } catch (e) {
      errors = e;
    }

    if (errors && errors.length) {
      return errors;
    }

    return validator(next);
  }, []);
}

/**
 * tiling rules
 * @param  {object} objArr {name: [{value, rule}, {value, rule2}], name2: [{value2, rule3}]}
 * @return {Array} [{value, rule}, {value, rule2}, {value2, rule3}]
 */
function flattenObjArr(objArr) {
  const ret = [];
  Object.keys(objArr).forEach((k) => {
    Object.keys(objArr[k]).forEach((r) => {
      ret.push(objArr[k][r]);
    });
  });
  return ret;
}

/**
 * Asynchronous call
 * @param  {map}   objArr   Validation rule object list
 * @param  {object}   option   configuration item
 * @param  {Function} validator     each validation rule
 * @param  {Function} callback Execute after all
 */
export function asyncMap(objArr, option, validator, callback) {
  // Return when the first error is found
  if (option.first) {
    const flattenArr = flattenObjArr(objArr);
    return _asyncValidateSerials(flattenArr, validator, callback);
  }

  const objArrKeys = Object.keys(objArr);
  const objArrLength = objArrKeys.length;
  let total = 0;
  const results = [];
  const next = (errors) => {
    results.push(errors);
    total++;
    if (total === objArrLength) {
      return callback(results);
    }
  };
  objArrKeys.forEach((key) => {
    const arr = objArr[key];
    _asyncValidateSerials(arr, validator, next);
  });
}

export async function asyncMapPromise(objArr, option, validator) {
  if (option.first) {
    const flatObjArr = flattenObjArr(objArr);

    return await _promiseValidateSeries(flatObjArr, validator);
  }

  const objArrValues = Object.values(objArr);

  return await Promise.all(objArrValues.map((val) => _promiseValidateSeries(val, validator)));
}

export function complementError(rule) {
  return (oe) => {
    if (oe && oe.message) {
      oe.field = rule.field;
      return oe;
    }
    return {
      message: oe,
      field: rule.field,
    };
  };
}

/**
 *
 * @param {Array} results errors from running validation
 * @returns {Object} { errors: Array, fields: Object }
 */
export function processErrorResults(results = []) {
  let errors = [];
  let fields = {};

  function add(e) {
    if (Array.isArray(e)) {
      errors = errors.concat(e);
    } else {
      errors.push(e);
    }
  }

  for (let i = 0; i < results.length; i++) {
    add(results[i]);
  }

  if (!errors.length) {
    errors = null;
    fields = null;
  } else {
    for (let i = 0; i < errors.length; i++) {
      const field = errors[i].field;
      if (field) {
        fields[field] = fields[field] || [];
        fields[field].push(errors[i]);
      }
    }
  }

  return {
    errors,
    fields,
  };
}
