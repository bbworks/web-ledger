import {parseDbNumber, parseDbDate} from './../utilities';

export const typeCheckAccountData = accountData=>{
  return accountData.map(data=>({
    ...data,
    CreditScore: parseDbNumber(data.CreditScore),
    LastUpdated: parseDbDate(data.LastUpdated),
  }));
};
