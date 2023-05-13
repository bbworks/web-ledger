export const isFalsy = function(value) {
  return value !== 0 && (!value || value == false);
};

export const nullCoalesce = function(value) {
  if(isFalsy(arguments)) throw new Error("Function cannot accept 0 parameters.");
  return [...arguments].reduce((accumulator, value)=>accumulator = (isFalsy(accumulator) && !isFalsy(value) ? value : accumulator), null);
};

export const parseNumber = value=>{
  const potentialNumber = Number(value);
  return (value !== null && value !== undefined && !isNaN(potentialNumber) ? potentialNumber : null);
};

export const convertNumberToCurrencyString = number =>{
  if (isNaN(number)) throw `Value "${number.toString()}" cannot be casted to type Number.`;

  return Number(number)
    .toFixed(2)
    .toString()
    .replace(/(\d)(?=(\d{3})+\.\d{2})/g, "$1,") //add commas
    .replace(/(\d)/, "$$$1"); //add $
}

export const convertCurrencyToNumber = value=>{
  if(value === null || value === undefined) return NaN;
  if (isNaN(value) && typeof value === "string") value = value.replace(/(\$|,)/g, "");
  return parseNumber(value) ?? NaN;
};

export const convertCSVToJSON = function(csv, delimiter = ",") {
  //Initialize variables
  const csvData = csv
    //Break apart by new line
    .split(/(?:\r\n|\r|\n)/)
    //Begin breaking apart each line by the delimiter
    .map(line=>(!line ? null : line.split(delimiter)))
    //Remove the empty lines
    .filter(line=>line);

  //Get the headers
  const headers = csvData.splice(0,1)[0];

  //Get the data
  const obj = csvData.map(line=>{
    const lineObj = {};
    line.forEach((value, i)=>{
      lineObj[headers[i]] = value;
    })
    return lineObj;
  });

  return obj;
};

export const getSumByProp = (array, prop)=>{
  //Make sure the provided object is an array
  if (!Array.isArray(array)) {
    //If its not even a single object, return null
    if(!typeof array === "object") return null;

    //Otherwise, wrap the object in an array for processing
    array = [array]
  }

  return Number(array.reduce((sum, item)=>{
    //If this an object, use the property
    if (typeof item === "object") {
      if (!Number.isNaN(item[prop])) return sum+=item[prop];
    }

    //Otherwise, if a number, use the item directly
    if (!Number.isNaN(item)) return sum+=item;
  }, 0)) || null;
};

export const areObjectsEqual = (a,b)=>{
  //## typeof values
  //"undefined"
  //"boolean"
  //"number"
  //"bigint"
  //"string"
  //"symbol"
  //"function" (non-primitive)
  //"object"  (non-primitive) //includes null

  //
  if (a === null) {
    if (b === null) {
      return true;
    }
    return false;
  }

  //First, if not the same type, exit
  const typeofA = typeof a;
  const typeofB = typeof b;
  if (typeofA !== typeofB) return false;

  //If these are objects, recurse into them
  if (typeofA === "object") {
    const aValues = Object.entries(a);
    const bValues = Object.entries(b);

    //Short-circuit if the number of properties aren't the same
    if(aValues.length !== bValues.length) return false;

    for(let i = 0; i < aValues.length; i++) {
      const [aKey, aValue] = aValues[i];
      const [bKey, bValue] = bValues[i];
      if(aKey !== bKey) return false;
      if (!areObjectsEqual(aValue, bValue)) return false;
    }

    //If the objects properties/arrays values are all the same, return true
    return true;
  }

  //Otherwise, compare the values
  return a === b;
};

export const isDescendantOf = (element, potentialParent) => {
  if (
    element.parentElement &&
    potentialParent &&
    element.parentElement !== potentialParent
  ) return isDescendantOf(element.parentElement, potentialParent);

  return element.parentElement != null &&
    potentialParent != null &&
    element.parentElement === potentialParent;
};

export const convertToString = (value)=>{
  if (typeof value === "string" && !value.length) 
    return "";
  if (value instanceof Date) 
    return value.toJSON();
  if (typeof value === "object" && !Array.isArray(value)) 
    return JSON.stringify(value);
    
  // fallback
  // Array, Number, etc
  return value.toString();
}

export const isMatchedValue = (value, pattern)=>{
  //Convert both the value and the matched value to strings
  // for easy comparision
  value = convertToString(value);
  pattern = convertToString(pattern);
  
  // Escape the pattern with prepended '\'s (for RegEx)
  const escapedPattern = pattern.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');

  return value.match(new RegExp(`(${escapedPattern})`, "i"));
};

export const isEqual = (a,b)=>{
  //## typeof values
  //"undefined"
  //"boolean"
  //"number"
  //"bigint"
  //"string"
  //"symbol"
  //"function" (non-primitive)
  //"object"  (non-primitive) //includes null

  const type = typeof a;
    
  //First, if the types are not the same, exit
  if (type !== typeof b) return null;
    
  //If the values are both null (type `[object]`) or both undefined (type `undefined`), return true
  if ((a === null && b === null) || type === undefined) return true;

  //If arrays, check their .toString() values
  if(Array.isArray(type)) return a.toString() === b.toString();

  //If dates, check their .toJSON() values
  if(a instanceof Date) return a.toJSON() === b.toJSON();
    
  //If these are objects, recurse into them
  if (type === "object") {
    const aValues = Object.entries(a);
    const bValues = Object.entries(b);

    //Short-circuit if the number of properties aren't the same
    if(aValues.length !== bValues.length) return false;

    for(let i = 0; i < aValues.length; i++) {
      const [aKey, aValue] = aValues[i];
      const [bKey, bValue] = bValues[i];
      if(aKey !== bKey) return false;
      if (!isEqual(aValue, bValue)) return false;
    }

    //If the objects properties/arrays values are all the same, return true
    return true;
  }

  //Otherwise, compare the values
  // Works for primitives, null, undefined
  return a === b;
};

export const getObjectUpdates = (_old, _new)=>{
  return Object.entries(_new).reduce((acc, [key, newValue])=>{
      const oldValue = _old[key];

      //Compare the values
      //  If equal, ignore the value
      if(isEqual(oldValue, newValue)) return acc;

      //Otherwise, use the new value
      return {
          ...acc,
          [key]: newValue
      };
  }, {});
};

export const flattenObject = (object, parentKey='')=>{
  return Object.entries(object).reduce((acc,[key, value])=>{
      if(typeof value === "object") return {
        ...acc,
        ...flattenObject(value, key),
      };
      
      return {
        ...acc,
        [`${parentKey ? `${parentKey}.` : ''}${key}`]: value,
      };
  }, {});
};
