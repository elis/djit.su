import _ from 'lodash'

// Source: https://gist.github.com/Yimiprod/7ee176597fef230d1451
/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
  function changes(obj, b) {
    return _.transform(obj, function (result, value, key) {
      if (!_.isEqual(value, b[key])) {
        result[key] =
          _.isObject(value) && _.isObject(b[key])
            ? changes(value, b[key])
            : value
      }
    })
  }
  return changes(object, base)
}

export default difference
