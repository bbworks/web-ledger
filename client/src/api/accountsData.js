import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getAccountsData = async ()=>{
  try {
    return await fetch("/api/v1/accounts").then(response=>response.json()).then(data=>data.data);
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};
