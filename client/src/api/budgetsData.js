import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwException} from './../utilities';

export const getBudgetsData = async ()=>{
  try {
    return await fetch("/api/v1/budgets").then(response=>response.json()).then(data=>data.data);
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};

export const updateBudgetsData = async budgetsData=>{
  try {
    return await fetch("/api/v1/budgets", {method: "post", body: {budgetsData}}).then(response=>response.json());
  }
  catch (err) {
    throwException(err, false);
    return [];
  }
};
