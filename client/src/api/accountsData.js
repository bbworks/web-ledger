export const getAccountsData = async ()=>{
  return fetch(`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/accounts`)
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
