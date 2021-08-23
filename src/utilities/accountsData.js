import {parseGoogleSheetsNumber, parseGoogleSheetsDate} from './../googleApi';

export const typeCheckAccountsData = accountsData=>{
  return accountsData.map(accountData=>({
      ...accountData,
      Balance: parseGoogleSheetsNumber(accountData.Balance),
    })
  );
};
