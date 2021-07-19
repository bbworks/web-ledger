import {getSheetsSpreadsheetValues} from './../googleApi';

export const getAccountData = async ()=>{
  //Transactions data
return await getSheetsSpreadsheetValues("Account Data");
};
