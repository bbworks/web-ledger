const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");
const db = require("./../db");
const mysql = require('mysql2');

const getTransactions = async ()=>{
  //return await getSheetsSpreadsheetValues("Transactions Data");
  try {
    const sql = `SELECT * FROM vwTransaction;`

    console.log("SQL:", mysql.format(sql));

    const [results] = await db.execute(sql);
    
    // console.log("results", results);
    
    return results;
  }
  catch (err) {
    throw err;
  }
};

const getTransaction = async transactionId=>{
  try {
    const sql = `START TRANSACTION;
SELECT * FROM vwTransaction WHERE TransactionId = ?;
ROLLBACK;`;

    const values = [transactionId];
    
    console.log("transactionId:", transactionId);
    console.log("SQL:", mysql.format(sql, values));

    const [results] = await db.query(sql, values);
    
    console.log("results", results);
    
    return results;
  }
  catch (err) {
    throw err;
  }
};

const createTransaction = async transaction=>{
  try {
    const sql = `START TRANSACTION;
CALL CreateTransaction (
    /* $TransactionDate = */ ?
  , /* $PostedDate = */ ?
  , /* $Account = */ ?
  , /* $Type = */ ?
  , /* $Description = */ ?
  , /* $DescriptionManual = */ ?
  , /* $DescriptionDisplay = */ ?
  , /* $BudgetCycle = */ ?
  , /* $IsAutoCategorized = */ ?
  , /* $IsUpdatedByUser = */ ?
  , /* $Amount = */ ?
  , /* $Budget = */ ?
  , /* $Notes = */ ?
  , /* $Tags = */ ?
  , /* $date_created = */ ?
  , /* $created_by = */ ?
  , /* $date_modified = */ ?
  , /* $modified_by = */ ?
  , /* $UserId = */ ?
);
ROLLBACK;`;

    const values = [
      transaction.TransactionDate,
      transaction.PostedDate,
      transaction.AccountNumber,
      transaction.Type,
      transaction.Description,
      transaction.DescriptionManual,
      transaction.DescriptionDisplay,
      transaction.BudgetCycle,
      transaction.IsAutoCategorized,
      transaction.IsUpdatedByUser,
      transaction.Amount,
      transaction.Category,
      transaction.Notes,
      transaction.Tags,
      transaction.date_created,
      transaction.created_by,
      transaction.date_modified,
      transaction.modified_by,
      transaction.UserId,
    ];
    
    console.log("transaction:", transaction);
    console.log("SQL:", mysql.format(sql, values));

    const [results] = await db.query(sql, values);
    
    console.log("results", results);
    
    return results;
  }
  catch (err) {
    throw err;
  }
};

const updateTransactions = async transactions=>{
  try {
    console.log("transactions:", transactions);
    //const [results] = await db.execute("SELECT * FROM vwTransaction;")
    // console.log("results", results);
    return false;
  }
  catch (err) {
    throw err;
  }
};

const updateTransaction = async (transactionDetailId, newTransaction, updates)=>{
  try {
    //If there are no updates, return false
    if (!Object.keys(updates).length) {
      console.log(`Nothing to update for transaction ${transactionDetailId}--returning.`);
      return false;
    };
    
    const _updates = Object.entries(updates).reduce((acc,[key, value])=>{
      let _key = key;
      if (key === "Category") _key = "Budget";
      if (key === "AccountNumber") _key = "Account";
      return {
          ...acc,
          [_key]: value
      };
    }, {});

    const setStatements = Object.entries(_updates).map(([updateColumn, updateValue])=>[
        ["Transaction", "TransactionMaster.TransactionId = denormalized.TransactionId"],
        ["TransactionDate", "TransactionMaster.TransactionDate = denormalized.TransactionDate"],
        ["PostedDate", "TransactionMaster.PostedDate = denormalized.PostedDate"],
        ["Account", "TransactionMaster.AccountId = Account.AccountId"],
        ["Type", "TransactionMaster.TypeId = Type.TypeId"],
        ["Description", "TransactionMaster.Description = denormalized.Description"],
        ["DescriptionManual", "TransactionMaster.DescriptionManual = denormalized.DescriptionManual"],
        ["DescriptionDisplay", "TransactionMaster.DescriptionDisplay = denormalized.DescriptionDisplay"],
        ["BudgetCycle", "TransactionMaster.BudgetCycleId = BudgetCycle.BudgetCycleId"],
        ["IsAutoCategorized", "TransactionMaster.IsAutoCategorized = denormalized.IsAutoCategorized"],
        ["IsUpdatedByUser", "TransactionMaster.IsUpdatedByUser = denormalized.IsUpdatedByUser"],
        ["date_created", "TransactionMaster.date_created = denormalized.date_created"],
        ["created_by", "TransactionMaster.created_by = denormalized.created_by"],
        ["date_modified", "TransactionMaster.date_modified = denormalized.date_modified"],
        ["modified_by", "TransactionMaster.modified_by = denormalized.modified_by"],
        ["User", "TransactionMaster.UserId = User.UserId"],
        ["Transaction", "TransactionDetail.TransactionId = denormalized.TransactionId"],
        ["Amount", "TransactionDetail.Amount = denormalized.Amount"],
        ["Budget", "TransactionDetail.BudgetId = Budget.BudgetId"],
        ["Notes", "TransactionDetail.Notes = denormalized.Notes"],
        ["detail_date_created", "TransactionDetail.date_created = denormalized.detail_date_created"],
        ["detail_created_by", "TransactionDetail.created_by = denormalized.detail_created_by"],
        ["detail_date_modified", "TransactionDetail.date_modified = denormalized.detail_date_modified"],
        ["detail_modified_by", "TransactionDetail.modified_by = denormalized.detail_modified_by"],
        ["User", "TransactionDetail.UserId = User.UserId"],
      ]
      .filter(([column, statement])=>column === updateColumn)
      .map(([column, statement])=>statement)
      .join(",\r\n  ")
    )
    .join(",\r\n  ");

    const sql = `#START TRANSACTION;
WITH denormalized AS (
SELECT
  ? AS TransactionId
  , ? AS TransactionDate
  , ? AS PostedDate
  , ? AS Account
  , ? AS Type
  , ? AS Description
  , ? AS DescriptionManual
  , ? AS DescriptionDisplay
  , ? AS BudgetCycle
  , ? AS IsAutoCategorized
  , ? AS IsUpdatedByUser
  , ? AS date_created
  , ? AS created_by
  , ? AS date_modified
  , ? AS modified_by
  , ? AS User
  , ? AS TransactionDetailId
  , ? AS Amount
  , ? AS Budget
  , ? AS Notes
  , ? AS detail_date_created
  , ? AS detail_created_by
  , ? AS detail_date_modified
  , ? AS detail_modified_by
  , ? AS detail_User
)
UPDATE TransactionMaster
INNER JOIN TransactionDetail
  ON TransactionMaster.TransactionId=TransactionDetail.TransactionId
INNER JOIN denormalized
  ON denormalized.TransactionDetailId = TransactionDetail.TransactionDetailId
LEFT OUTER JOIN Type
  ON Type.Name = denormalized.Type
  AND Type.ResourceType = 'T'
LEFT OUTER JOIN BudgetCycle
  ON BudgetCycle.BudgetCycle = denormalized.BudgetCycle
LEFT OUTER JOIN Account
  ON Account.AccountNumber = denormalized.Account
LEFT OUTER JOIN Budget
  ON Budget.Name = denormalized.Budget
  AND Budget.BudgetCycleId = BudgetCycle.BudgetCycleId
/*LEFT OUTER JOIN User
  ON User.Username = denormalized.User*/
/*LEFT OUTER JOIN User detailUser
  ON detailUser.Username = denormalized.detail_User*/
SET 
  ${setStatements}
WHERE TransactionDetail.TransactionDetailId = denormalized.TransactionDetailId
;
SELECT * FROM vwTransaction WHERE TransactionDetailId = ?;
#ROLLBACK;
# UPDATE TransactionMaster
# INNER JOIN TransactionDetail
#   ON TransactionMaster.TransactionId=TransactionDetail.TransactionId
# LEFT OUTER JOIN Type
#     ON Type.Name = ?
#     AND Type.ResourceType = 'T'
# LEFT OUTER JOIN BudgetCycle
#     ON BudgetCycle.BudgetCycle = ?
# LEFT OUTER JOIN Account
#     ON Account.AccountNumber = ?
# LEFT OUTER JOIN Budget
#     ON Budget.Name = ?
#     AND Budget.BudgetCycleId = BudgetCycle.BudgetCycleId
# /*LEFT OUTER JOIN User
#     ON User.Username = ?*/
# SET ?
# WHERE TransactionDetail.TransactionDetailId = ?
# ;
`;
    // const values = [
    //   newTransaction.Type
    //   , new Date(newTransaction.BudgetCycle)
    //   , newTransaction.AccountNumber /* Account */
    //   , newTransaction.Category /* Budget */
    //   , newTransaction.User
    //   , _updates
    //   , transactionDetailId
    // ];
    const values = [
      newTransaction.TransactionId
      , new Date(newTransaction.TransactionDate)
      , new Date(newTransaction.PostedDate)
      , newTransaction.AccountNumber /* Account */
      , newTransaction.Type
      , newTransaction.Description
      , newTransaction.DescriptionManual
      , newTransaction.DescriptionDisplay
      , new Date(newTransaction.BudgetCycle)
      , Boolean(newTransaction.IsAutoCategorized)
      , Boolean(newTransaction.IsUpdatedByUser)
      , new Date(newTransaction.date_created)
      , newTransaction.created_by
      , new Date(newTransaction.date_modified)
      , newTransaction.modified_by
      , newTransaction.User
      , newTransaction.TransactionDetailId
      , newTransaction.Amount
      , newTransaction.Category /* Budget */
      , newTransaction.Notes
      , new Date(newTransaction.detail_date_created)
      , newTransaction.detail_created_by
      , new Date(newTransaction.detail_date_modified)
      , newTransaction.detail_modified_by
      , newTransaction.detail_User
      , newTransaction.TransactionDetailId
    ];
    
    console.log("updates:", _updates);
    console.log("SQL:", mysql.format(sql, values));

    const [results] = await db.query(sql, values);
    const updatedTransaction = results[2];
    console.log("results", results);
    console.log("updatedTransaction", updatedTransaction);

    //If there are no changes, return false
    if (results[1].changedRows === 0) {
      console.log(`Nothing to update for transaction ${transactionDetailId}--returning.`);
      return false;
    };
    
    return updatedTransaction;
  }
  catch (err) {
    throw err;
  }
};

const deleteTransaction = async transactionId=>{
  try {
    const sql = `START TRANSACTION;
DELETE FROM vwTransaction WHERE TransactionId = ?;
ROLLBACK;`;

    const values = [transactionId];
    
    console.log("transactionId:", transactionId);
    console.log("SQL:", mysql.format(sql, values));

    const [results] = await db.query(sql, values);
    
    console.log("results", results);
    
    return results;
  }
  catch (err) {
    throw err;
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransactions,
  updateTransaction,
  deleteTransaction,
};
