import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getAccountsData = async ()=>{
  try {
    return await getSheetsSpreadsheetValues("Accounts Data");
  }
  catch (err) {
    throwException(err);
    return [];
  }
};
