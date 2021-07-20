import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getAccountData = async ()=>{
  try {
    return await getSheetsSpreadsheetValues("Account Data");
  }
  catch (err) {
    throwException(err);
    return [];
  }
};
