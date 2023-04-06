import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getBudgetsData = async ()=>{
  return fetch(`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/budgets`)
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: "Failed to fetch budgets",
        throw: false,
        err,
      };
    });
};

export const updateBudgetsData = async budgetsData=>{
  return fetch(`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/budgets`, {method: "post", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({budgetsData})})
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: "Failed to update budgets",
        throw: false,
        err,
      };
    });
};
