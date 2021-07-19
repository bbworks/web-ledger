import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';

export const getTransactions = async ()=>{
  return await getSheetsSpreadsheetValues("Transactions Data")
};

export const insertTransactions = async ()=>{
  return;
};

export const updateTransactions = async transactions=>{
  return await updateSheetsSpreadsheetValues("Transactions Data", transactions);
};

export const deleteTransactions = async ()=>{
  return;
};
