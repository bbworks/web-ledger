import {getSheetsSpreadsheetValues} from './../googleApi';
import {throwError} from './../utilities';

export const getAccountsData = async ()=>{
  try {
    return await fetch("/api/v1/accounts")
      .then(response=>{if(!response.ok) throw response; return response;})
      .then(response=>response.json())
	.then(data=>data.data);
  }
  catch (err) {
    throwError("Failed to fetch accounts data", err, false);
    return [];
  }
};
