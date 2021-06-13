import {useState, useEffect} from 'react';
import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON} from './../../utilities.js';
import './index.css';

import TagBadge from './../TagBadge';

const TransactionDetailModal = ({ transaction, buttonsOptions, isOpen, transactionDetailModalOnSubmit })=>{
  const [PostedDate, setPostedDate] = useState(null);
  const [TransactionDate, setTransactionDate] = useState(null);
  const [Card, setCard] = useState(null);
  const [Amount, setAmount] = useState(null);
  const [Description, setDescription] = useState(null);
  const [Category, setCategory] = useState(null);
  const [Type, setType] = useState(null);
  const [Notes, setNotes] = useState(null);
  const [Tags, setTags] = useState([]);

  useEffect(()=>{
    if(!transaction) return;
    console.log("Updating TransactionDetailModal state based on updated prop \"transaction\".", transaction, PostedDate, TransactionDate, Card, Amount, Description, Category, Notes, Type, Tags)
    setPostedDate(transaction.display.PostedDate);
    setTransactionDate(transaction.display.TransactionDate);
    setCard(transaction.display.Card);
    setAmount(transaction.display.Amount);
    setDescription(transaction.display.Description);
    setCategory(transaction.display.Category);
    setNotes(transaction.display.Notes);
    setType(transaction.data.Type);
    setTags(transaction.data.Tags);
  }, [transaction]);

  const transactionFields= [
    {name: "PostedDate", placeholder: "PostedDate", value: PostedDate, tag: "input", tagType: "text", setState: setPostedDate},
    {name: "TransactionDate", placeholder: "TransactionDate", value: TransactionDate, tag: "input", tagType: "text", setState: setTransactionDate},
    {name: "Card", placeholder: "Card", value: Card, tag: "input", tagType: "text", setState: setCard},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text", setState: setAmount},
    {name: "Description", placeholder: "Description", value: Description, tag: "input", tagType: "text", setState: setDescription},
    {name: "Category", placeholder: "Category", value: Category, tag: "input", tagType: "text", setState: setCategory},
    {name: "Type", placeholder: "Type", value: Type, tag: "input", tagType: "text", setState: setType},
    {name: "Notes", placeholder: "Notes", value: Notes, tag: "textarea", tagType: null, setState: setNotes},
    {name: "Tags", placeholder: "Tags", value: Tags, tag: "input", tagType: "text", setState: setTags},
  ];

  const transactionFieldOnClick = event=>{
    const transactionFieldElement = event.target;
    transactionFieldElement.disabled = false;
    transactionFieldElement.focus();
  };

  const transactionFieldOnBlur = event=>{
    const transactionFieldElement = event.target;
    transactionFieldElement.disabled = true;
  };

  const transactionFieldOnKeyDown = event=>{
    const transactionFieldElement = event.target;
    if (event.keyCode === 9 /* Tab */) {
      event.preventDefault();
      const nextOrPrevious = (event.shiftKey === true ? -1 : 1);
      const inputsArray = [...document.querySelectorAll(".transaction-modal-input")];
      const nextInput = inputsArray[inputsArray.indexOf(transactionFieldElement)+nextOrPrevious];
      if (nextInput) {
        nextInput.disabled = false;
        nextInput.focus();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();

      if (transactionFieldElement.classList.contains("transaction-modal-input-tags")) {
        setTags([...Tags, transactionFieldElement.value]);

        //Reset the input
        transactionFieldElement.value = '';

        return;
      }

      transactionFieldElement.disabled = true;
      return;
    }
  };

  const transactionModalFormOnSubmit = event=>{
    const transactionModalForm = event.target;

    //Prevent the form from submitting
    event.preventDefault();

    //Aggregate the form data into an object
    const data = [...transactionModalForm.querySelectorAll("[name]")].reduce((accumulator,input)=>{
      const obj = {};
      let {name, value} = input;
      value = (name === "Tags" ? value.split(/\s*,\s*/) : value);

      obj[name] = nullCoalesce(value);
      return accumulator = {...accumulator, ...obj};
    }, {});
    console.log("Data submitted from TransactionDetailModal", data);

    //Update the transaction with the new form data
    const updatedTransaction = {
      ...transaction,
      data: {
        ...transaction.data,
        Tags: data.Tags,
      },
      display: {
        ...transaction.display,
        ...data,
        Description: transaction.data.Description,
      }
    };

    console.log("Updated transaction submitted from TransactionDetailModal", updatedTransaction);

    transactionDetailModalOnSubmit(transaction, updatedTransaction);
  };

  const tagBadgeOnClick = tag=>setTags(Tags.filter(t=>t!==tag));

  return (
    <div id="transaction-modal" className="modal fade">
      <div className="modal-dialog">
        <form className="transaction-modal-form" onSubmit={transactionModalFormOnSubmit}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Transaction Detail</h3>
              <button className="btn-close" type="button" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {transactionFields.map((transactionField, i)=>(
                <div key={`${transactionField.name}-container`} onClick={transactionFieldOnClick} onBlur={transactionFieldOnBlur}>
                  {(
                    transactionField.name === "Tags" ?
                    (
                      <div className="transaction-modal-input-tags-container form-control">
                        <input className="transaction-modal-input-tags-hidden form-control" type="hidden" name="Tags" value={transactionField.value.join(",")} />
                        <div className="transaction-modal-input-tags-badge-container">
                          {transactionField.value.map(tag=><TagBadge key={tag} tag={tag} onClick={event=>tagBadgeOnClick(tag)} />)}
                        </div>
                        <transactionField.tag className="transaction-modal-input transaction-modal-input-tags form-control" type={transactionField.tagType} placeholder={transactionField.placeholder} tabIndex={i+1} onKeyDown={transactionFieldOnKeyDown}></transactionField.tag>
                      </div>
                    ) :
                    <transactionField.tag className="transaction-modal-input transaction-modal-input-text form-control" value={transactionField.value} name={transactionField.name} type={transactionField.tagType} placeholder={transactionField.placeholder} tabindex={i+1} value={transactionField.value} disabled onKeyDown={transactionFieldOnKeyDown} onChange={event=>transactionField.setState(event.target.value)}>{transactionField.tag !== "input" ? transactionField.value : null}</transactionField.tag>
                  )}
                </div> //disabled inputs don't fire events; wrap in something that will fire an event
              ))}
            </div>
            <div className="modal-footer">
              {Object.entries(buttonsOptions).map(buttonObj=>(
                <button key={buttonObj[0]} className={`btn ${(buttonObj[0] === "okButton" ? "btn-primary" : (buttonObj[0] === "cancelButton" ? "btn-secondary" : ''))}`} type={(buttonObj[0] === "okButton" ? "submit" : "button")} {...(buttonObj[0] === "cancelButton" ? {"data-bs-dismiss": "modal"} : '')}>{buttonObj[1]}</button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
