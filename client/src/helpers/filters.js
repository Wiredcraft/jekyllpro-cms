import _includes from 'lodash.includes';
import _isArray from 'lodash.isarray';

const checkContainsField = (baseObj, target) => {
  return Object.keys(baseObj).reduce((isMatch, fieldName) => {
    if (isMatch) {
      let targetVal = target[fieldName];
      let baseVal = baseObj[fieldName];
      let targetMatched = true;
      if (_isArray(targetVal) && _isArray(baseVal)) {
        targetMatched = baseVal.reduce((matched, item) => {
          return matched && _includes(targetVal, item);
        }, true);
      } else {
        targetMatched = _includes(targetVal, baseVal);
      }

      return targetMatched;
    } else {
      return false;
    }
  }, true);
};

const checkEqualField = (baseObj, target) => {
  return Object.keys(baseObj).reduce((isMatch, fieldName) => {
    if (isMatch) {
      let targetVal = target[fieldName];
      let baseVal = baseObj[fieldName];
      let targetMatched = true;
      if (_isArray(targetVal) && _isArray()) {
        targetMatched =
          targetVal.toString().toLowerCase() ===
          baseVal.toString().toLowerCase();
      } else {
        targetMatched = baseVal === targetVal;
      }

      return targetMatched;
    } else {
      return false;
    }
  }, true);
};

const checkObjectArray = (objArray, target, checkFn) => {
  return objArray.reduce((pass, obj) => {
    return pass && checkFn(obj, target);
  }, true);
};

// filterObj could be like
// {
//   contains: [{category: ["menu", "food"]}],
//   equal: [{title: "some title"}]
// }
export function filterFn(filterObj, contentObj) {
  return Object.keys(filterObj).reduce((isMatch, filter) => {
    let objArray = filterObj[filter];

    if (filter === 'contains') {
      return (
        isMatch && checkObjectArray(objArray, contentObj, checkContainsField)
      );
    }
    if (filter === 'equal') {
      return isMatch && checkObjectArray(objArray, contentObj, checkEqualField);
    }

    return isMatch;
  }, true);
}
