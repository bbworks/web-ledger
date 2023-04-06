import {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getTransactions = async ()=>{
  return fetch("/api/v1/transactions")
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: "Failed to fetch transactions",
        throw: false,
        err,
      };
    });
};

export const updateTransactions = async transactions=>{
  return fetch("/api/v1/transactions", {method: "post", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({transactions})})
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: "Failed to update transactions",
        throw: false,
        err,
      };
    });
};