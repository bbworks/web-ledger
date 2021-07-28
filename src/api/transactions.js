import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getTransactions = async ()=>{
  try {
    return await getSheetsSpreadsheetValues("Transactions Data");
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};

export const insertTransactions = async ()=>{
  try {
    return;
  }
  catch (err) {
    throwException(err, false);
    return;
  }
};

export const updateTransactions = async transactions=>{
  try {
    return await updateSheetsSpreadsheetValues("Transactions Data", transactions);
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};

export const deleteTransactions = async ()=>{
  try {
    return;
  }
  catch (err) {
    throwException(err, false);
    return;
  }
};
