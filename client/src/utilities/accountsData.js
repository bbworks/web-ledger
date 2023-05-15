import {parseDbNumber} from './../utilities';

export const typeCheckAccountsData = accountsData=>{
  return accountsData.map(accountData=>({
      ...accountData,
      Balance: parseDbNumber(accountData.Balance),
    })
  );
};
