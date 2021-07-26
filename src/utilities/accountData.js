export const typeCheckAccountData = accountData=>{
  return accountData.map(data=>({
    ...data,
    CreditScore: (data.CreditScore ? Number(data.CreditScore) : null),
    LastUpdated: (data.LastUpdated ? new Date(data.LastUpdated) : null),
  }));
};
