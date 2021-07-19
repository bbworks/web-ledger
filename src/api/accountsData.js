import {getSheetsSpreadsheetValues} from './../googleApi';

export const getAccountsData = async ()=>{
  return await getSheetsSpreadsheetValues("Accounts Data");
};
