import {parseNumber} from './../utilities';

export const parseDbNumber = value=>{
  return parseNumber(value);
};

export const parseDbDate = JSON=>{
  const potentialDate = new Date(JSON);
  return (JSON && !isNaN(potentialDate.getTime()) ? potentialDate : null);
};
