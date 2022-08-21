import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getBudgetsData = async ()=>{
  try {
    return await getSheetsSpreadsheetValues("Budgets Data");
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};

export const updateBudgetsData = async budgetsData=>{
  try {
    return await updateSheetsSpreadsheetValues("Budgets Data", budgetsData);
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};
