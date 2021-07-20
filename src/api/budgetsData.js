import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getBudgetsData = async ()=>{
  try {
    return await getSheetsSpreadsheetValues("Budgets Data");
  }
  catch (err) {
    throwException(err);
    return [];
  }
};
