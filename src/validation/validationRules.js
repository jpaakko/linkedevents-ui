// Use Formsy React validation rules as a base https://github.com/christianalfoni/formsy-react

let _isExisty = function _isExisty(value) {
  return value !== null && value !== undefined;
}

let isEmpty = function isEmpty(value) {
  return value === '';
}

var validations = {
    isDefaultRequiredValue: function isDefaultRequiredValue(values, value) {
        return value === undefined || value === '';
    },
    isExisty: function isExisty(values, value) {
        return _isExisty(value);
    },
    matchRegexp: function matchRegexp(values, value, regexp) {
        return !_isExisty(value) || isEmpty(value) || regexp.test(value);
    },
    isUndefined: function isUndefined(values, value) {
        return value === undefined;
    },
    isEmptyString: function isEmptyString(values, value) {
        return isEmpty(value);
    },
    isEmail: function isEmail(values, value) {
        return validations.matchRegexp(values, value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    },
    isUrl: function isUrl(values, value) {
        return validations.matchRegexp(values, value, /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
    },
    isTrue: function isTrue(values, value) {
        return value === true;
    },
    isFalse: function isFalse(values, value) {
        return value === false;
    },
    isNumeric: function isNumeric(values, value) {
        if (typeof value === 'number') {
            return true;
        }
        return validations.matchRegexp(values, value, /^[-+]?(?:\d*[.])?\d+$/);
    },
    isAlpha: function isAlpha(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z]+$/i);
    },
    isAlphanumeric: function isAlphanumeric(values, value) {
        return validations.matchRegexp(values, value, /^[0-9A-Z]+$/i);
    },
    isInt: function isInt(values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:0|[1-9]\d*))$/);
    },
    isFloat: function isFloat(values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:\d+))?(?:\.\d*)?(?:[eE][\+\-]?(?:\d+))?$/);
    },
    isWords: function isWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s]+$/i);
    },
    isSpecialWords: function isSpecialWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s\u00C0-\u017F]+$/i);
    },
    isLength: function isLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length === length;
    },
    equals: function equals(values, value, eql) {
        return !_isExisty(value) || isEmpty(value) || value == eql;
    },
    equalsField: function equalsField(values, value, field) {
        return value == values[field];
    },
    maxLength: function maxLength(values, value, length) {
        return !_isExisty(value) || value.length <= length;
    },
    minLength: function minLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length >= length;
    },
    isTime: function isTime(values, value) {
        return validations.matchRegexp(values, value, /^(2[0-3]|1[0-9]|0[0-9]|[0-9])((:|.)[0-5][0-9]|[0-9])?$/i);
    },
    isDate: function isDate(values, value) {
        return validations.matchRegexp(values, value, /^([1-9]|0[1-9]|[1-2][0-9]|3[0-1])\.([1-9]|0[1-9]|1[0-2])\.[0-9]{4}$/i);
    },
    required: function required(values, value) {
        return _isExisty(value)
    },
    requiredString: function requiredString(values, value) {
        if(typeof value === 'string' && value.length > 0) {
            return true
        }
        return false
    },
    requiredMulti: function requiredMulti(values, value) {
        if(typeof value !== 'object') {
            return false
        }
        if(_.keys(value).length === 0) {
            return false
        }

        let hasOneValue = false

        _.each(value, item => {
            if(item.length && item.length > 0) {
                hasOneValue = true
            }
        })

        return hasOneValue
    },
    requiredAtId: function requiredAtId(values, value) {
        if(typeof value !== 'object') {
            return false
        }
        if(typeof value['@id'] !== 'string') {
            return false
        }
        if(value['@id'].length === 0) {
            return false
        }

        return true
    },
    atLeastOne: function atLeastOne(values, value) {
        if(value && value.length && value.length > 0) {
            return true
        }
        return false
    }
};

module.exports = validations;
