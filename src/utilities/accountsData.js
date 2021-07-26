export const typeCheckAccountsData = accountsData=>{
  return accountsData.map(accountData=>({
      ...accountData,
      Balance: (accountData.Balance ? Number(accountData.Balance) : null),
    })
  );
};
