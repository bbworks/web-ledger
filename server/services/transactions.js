const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("../googleApi/gapi");
const db = require("../db");
const mysql = require('mysql2');

class TransactionService {
  async getTransactions() {
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

  async getTransaction(transactionId) {
    try {
      const sql = `SELECT * FROM vwTransaction WHERE TransactionId = ?;`;

      const values = [transactionId];
      
      console.log("transactionId:", transactionId);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      const [transaction] = results;
      
      console.log("results", results);
      
      return transaction;
    }
    catch (err) {
      throw err;
    }
  };

  async createTransaction(transaction) {
    try {
      const sql = `CALL CreateTransaction (
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
  );`;

      const values = [
        new Date(transaction.TransactionDate),
        new Date(transaction.PostedDate),
        transaction.AccountNumber /* Account */,
        transaction.Type,
        transaction.Description,
        transaction.DescriptionManual,
        transaction.DescriptionDisplay,
        new Date(transaction.BudgetCycle),
        Boolean(transaction.IsAutoCategorized),
        Boolean(transaction.IsUpdatedByUser),
        transaction.Amount,
        transaction.Category /* Budget */,
        transaction.Notes,
        transaction.Tags.toString(),
        new Date(transaction.date_created),
        transaction.created_by,
        new Date(transaction.date_modified),
        transaction.modified_by,
        transaction.User,
      ];
      
      console.log("transaction:", transaction);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      const lastInsertId = results[0][0]["LAST_INSERT_ID()"];
      
      console.log("results", results);
      console.log("LAST_INSERT_ID()", lastInsertId);
      
      const newTransaction = await this.getTransaction(lastInsertId);
      
      console.log("newTransaction", newTransaction);
      
      return newTransaction;
    }
    catch (err) {
      throw err;
    }
  };

  async updateTransactions(transactions) {
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

  async updateTransaction(transactionDetailId, updatedTransaction, updates) {
    try {
      //If there are no updates, return false
      if (!Object.keys(updates).length) {
        console.log(`Nothing to update for transaction detail id ${transactionDetailId}--returning.`);
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
      .filter(statement=>!!statement)  //filter out empty entries (like Tags)
      .join(",\r\n  ");

      const sql = `START TRANSACTION;
  ${
    !setStatements
    ?
    ''
    :
    `# Update the TransactionMaster and TransactionDetail tables
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
      , ? AS Tags
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
  `}${
    !_updates.Tags
    ?
    ''
    :
    `# Insert tags, if exists
  CALL ConvertArrayToList(?, ',');

  INSERT INTO Tag (Name, ColorId, UserId)
  SELECT 
      newTags.value
      , NULL
      , ?
  FROM listTable newTags
  LEFT OUTER JOIN Tag
      ON newTags.value = Tag.Name
  WHERE Tag.TagId IS NULL;

  INSERT INTO TransactionTag (TransactionId, TagId, UserId)
  SELECT 
    ?
    , Tag.TagId
    , ?
  FROM listTable newTags
  INNER JOIN Tag
      ON newTags.value = Tag.Name
  LEFT OUTER JOIN TransactionTag
      ON TransactionTag.TagId = Tag.TagId
      AND TransactionTag.TransactionId = ?
  WHERE TransactionTag.TagId IS NULL;

  DELETE TransactionTag
  FROM TransactionTag
  INNER JOIN Tag
    ON Tag.TagId = TransactionTag.TagId
  LEFT OUTER JOIN listTable newTags
    ON newTags.value = Tag.Name
  WHERE newTags.value IS NULL;`}

  COMMIT;`;
      // const values = [
      //   updatedTransaction.Type
      //   , new Date(updatedTransaction.BudgetCycle)
      //   , updatedTransaction.AccountNumber /* Account */
      //   , updatedTransaction.Category /* Budget */
      //   , updatedTransaction.User
      //   , _updates
      //   , transactionDetailId
      // ];
      const values = [
        ...(
          !setStatements
          ?
          []
          :
          [
            updatedTransaction.TransactionId
            , new Date(updatedTransaction.TransactionDate)
            , new Date(updatedTransaction.PostedDate)
            , updatedTransaction.AccountNumber /* Account */
            , updatedTransaction.Type
            , updatedTransaction.Description
            , updatedTransaction.DescriptionManual
            , updatedTransaction.DescriptionDisplay
            , new Date(updatedTransaction.BudgetCycle)
            , Boolean(updatedTransaction.IsAutoCategorized)
            , Boolean(updatedTransaction.IsUpdatedByUser)
            , new Date(updatedTransaction.date_created)
            , updatedTransaction.created_by
            , new Date(updatedTransaction.date_modified)
            , updatedTransaction.modified_by
            , updatedTransaction.User
            , updatedTransaction.TransactionDetailId
            , updatedTransaction.Amount
            , updatedTransaction.Category /* Budget */
            , updatedTransaction.Notes
            , updatedTransaction.Tags.toString()
            , new Date(updatedTransaction.detail_date_created)
            , updatedTransaction.detail_created_by
            , new Date(updatedTransaction.detail_date_modified)
            , updatedTransaction.detail_modified_by
            , updatedTransaction.detail_User
          ]
        ),
        ...(
          !_updates.Tags
          ?
          []
          :
          [
              updatedTransaction.Tags.toString()
            , updatedTransaction.User
            , updatedTransaction.TransactionId
            , updatedTransaction.User
            , updatedTransaction.TransactionId
          ]
        ),
        updatedTransaction.TransactionDetailId
      ];
      
      console.log("updates:", _updates);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      console.log("results", results);
      
      //If there are no changes, return false
      if (results[1].changedRows === 0) {
        console.log(`Nothing to update for transaction ${transactionDetailId}--returning.`);
        return false;
      };
      
      const transaction = await this.getTransaction(updatedTransaction.TransactionId);
      
      console.log("updatedTransaction", transaction);
      
      return transaction;
    }
    catch (err) {
      throw err;
    }
  };

  async deleteTransaction(transactionId) {
    try {
      const sql = `DELETE FROM TransactionMaster WHERE TransactionId = ?;`;

      const values = [transactionId];
      
      console.log("transactionId:", transactionId);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      
      console.log("results", results);
      
      if (results.affectedRows === 0) throw new Error("No rows affected.");
      return results;
    }
    catch (err) {
      throw err;
    }
  };
}

module.exports = TransactionService;
