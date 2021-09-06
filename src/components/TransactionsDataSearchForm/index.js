import {useState, useEffect, useRef} from 'react';

import './index.scss';

const TransactionsDataSearchForm = ({ budgetCycleTransactions, transactionProperties, searchFilters, onSubmit:onSubmitProp, onFilterClick:onFilterClickProp })=>{
  const [search, setSearch] = useState("");
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
  const [activeSearchSuggestion, setActiveSearchSuggestion] = useState(null);

  const transactionsDataSearchFormInput = useRef(null);

  const getUniqueTransactionsPropertiesValues = (budgetCycleTransactions, property)=>{
    return [
      ...new Set(
        budgetCycleTransactions.map(t=>{
          const value = t[property];
          return (value instanceof Date ? value.toJSON() : value)
        })
        .filter(t=>(Array.isArray(t) ? t.length : t))
      )
    ]
      .sort((a,b)=>a<b ? -1 : b<a ? 1 : 0);
  };

  const getSearchSuggestions = ()=>{
    const escapedSearch = search.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');

    if (!activeSearchSuggestion) return transactionProperties.filter(p=>p.match(new RegExp("^"+escapedSearch, "i")));

    return getUniqueTransactionsPropertiesValues(budgetCycleTransactions.all, activeSearchSuggestion);
  };

  const openSearchSuggestions = ()=>{
    setIsSearchSuggestionsOpen(true);
  };

  const closeSearchSuggestions = ()=>{
    setIsSearchSuggestionsOpen(false);
  };

  const onTransactionsDataSearchFormInputFocus = event=>{
    //if (activeSearchSuggestion) return;

    openSearchSuggestions();
  };

  const onTransactionsDataSearchFormInputBlur = event=>{
    //closeSearchSuggestions();
  };

  const onTransactionsDataSearchFormSearchSuggestionClick = event=>{
    const suggestion = event.target.innerText;

    if (!activeSearchSuggestion) {
      transactionsDataSearchFormInput.current.focus();
      setActiveSearchSuggestion(suggestion);
      return;
    }

    transactionsDataSearchFormInput.current.focus();
    setSearch(suggestion);
    closeSearchSuggestions();
  };

  const onTransactionsDataSearchFormActiveSearchSuggestionClick = event=>{
    setActiveSearchSuggestion(null);
  };

  const onTransactionsDataSearchFormInputKeyDown = event=>{
    if(activeSearchSuggestion && event.target.value === "" && event.keyCode === 8) {
      setActiveSearchSuggestion(null);
    }
  };

  const onTransactionsDataSearchFormInputChange = event=>{
    const searchText = event.target.value;
    setSearch(searchText);
  };

  const onSubmit = event=>{
    event.preventDefault();

    //Save the search value
    const searchValue = search;

    //Reset the search value
    setSearch("");

    //Reset the active search suggestion
    setActiveSearchSuggestion(null);

    const searchObject = {
      key: activeSearchSuggestion,
      value: searchValue,
    };

    //Send the search value to the parent
    onSubmitProp(searchObject);
  };

  const onFilterClick = removedSearchFilter=>{
    onFilterClickProp(removedSearchFilter);
  };

  return (
    <form className="transactions-data-search-form" onSubmit={onSubmit}>
      <div className="transactions-data-search-form-input-container">
        <i className="transactions-data-search-form-icon fas fa-search"></i>
        {activeSearchSuggestion ? (
          <span className="transactions-data-search-form-active-search-suggestion badge rounded-pill" onClick={onTransactionsDataSearchFormActiveSearchSuggestionClick}>
            <i className="transactions-data-search-form-active-search-suggestion-x fas fa-xs fa-times me-1"></i>
            {activeSearchSuggestion}
          </span>
        ) : null}
        <input className="transactions-data-search-form-input" type="input" placeholder="Search..." value={search} ref={transactionsDataSearchFormInput} onChange={onTransactionsDataSearchFormInputChange} onKeyDown={onTransactionsDataSearchFormInputKeyDown} onFocus={onTransactionsDataSearchFormInputFocus} onBlur={onTransactionsDataSearchFormInputBlur}/>
      </div>
      <div className="transactions-data-search-form-search-filters">
        {searchFilters.map(({key:searchKey, value:searchValue}, i)=>(
          <span key={i} className="transactions-data-search-form-search-filter badge rounded-pill bg-secondary" onClick={event=>onFilterClick(searchValue)}><i className="transactions-data-search-form-filter-x fas fa-xs fa-times me-1"></i>{searchKey ? `${searchKey}:` : ""}{searchValue}</span>
        ))}
      </div>
      <div className={`transactions-data-search-form-search-suggestions ${isSearchSuggestionsOpen && getSearchSuggestions().length ? "" : "d-none"}`}>
        {getSearchSuggestions().map(p=>(
          <div className="transactions-data-search-form-search-suggestion" onClick={onTransactionsDataSearchFormSearchSuggestionClick}>{p}</div>
        ))}
      </div>
    </form>
  );
};

export default TransactionsDataSearchForm;
