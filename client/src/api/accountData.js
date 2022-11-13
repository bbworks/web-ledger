import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getAccountData = async (accountId)=>{
  return fetch(`/api/v1/account/${accountId}`)
    .then(response=>{if(!response.ok) throw response; return response;})
    .then(response=>response.json())
    .then(data=>data.data)
    .catch(err=>{
      throw {
        message: `Failed to fetch account ${accountId}`,
        throw: false,
        err,
      };
    });
};
