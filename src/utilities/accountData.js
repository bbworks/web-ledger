import {parseGoogleSheetsNumber, parseGoogleSheetsDate} from './../googleApi';

export const typeCheckAccountData = accountData=>{
  return accountData.map(data=>({
    ...data,
    CreditScore: parseGoogleSheetsNumber(data.CreditScore),
    LastUpdated: parseGoogleSheetsDate(data.LastUpdated),
  }));
};
