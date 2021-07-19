import {getSheetsSpreadsheetValues} from './../googleApi';

export const getBudgetsData = async ()=>{
  return await getSheetsSpreadsheetValues("Budgets Data");
};
