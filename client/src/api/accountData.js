import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getAccountData = async (accountId)=>{
  try {
    return await fetch(`/api/v1/account/${accountId}`)
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
	.then(data=>data.data);
  }
  catch (err) {
    throwError(`Failed to fetch account ${accountId}`, err, false);
    return [];
  }
};
