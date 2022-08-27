import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getAccountData = async ()=>{
  try {
    return await fetch("/api/v1/account").then(response=>response.json()).then(data=>data.data);
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};
