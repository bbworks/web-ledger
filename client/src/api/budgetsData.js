import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getBudgetsData = async ()=>{
  try {
    return await fetch("/api/v1/budgets")
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
      .then(data=>data.data);
  }
  catch (err) {
    throwError("Failed to fetch budgets", err, false);
    return [];
  }
};

export const updateBudgetsData = async budgetsData=>{
  try {
    return await fetch("/api/v1/budgets", {method: "post", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({budgetsData})})
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
	.then(data=>data.data);
  }
  catch (err) {
    throwError("Failed to update budgets", err, false);
    return [];
  }
};
