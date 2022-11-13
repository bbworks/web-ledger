import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getAccountsData = async ()=>{
  return fetch("/api/v1/accounts")
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: "Failed to fetch accounts data",
        throw: false,
        err,
      };
    });
};
