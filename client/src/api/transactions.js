import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getTransactions = async ()=>{
  try {
    return await fetch("/api/v1/transactions")
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
      .then(data=>data.data);
  }
  catch (err) {
    throwError("Failed to fetch transactions", err, false);
    return [];
  }
};

export const updateTransactions = async transactions=>{
  try {
    return await fetch("/api/v1/transactions", {method: "post", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({transactions})})
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
      .then(data=>data.data);
  }
  catch (err) {
    throwError("Failed to update transactions", err, false);
    return [];
  }
};
