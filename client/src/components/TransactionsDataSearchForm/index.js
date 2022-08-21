import {useState, useEffect, useRef} from 'react';

import InputDropdown from './../InputDropdown';

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
    const escapedSearch = (
      search ?
      search.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1') :
      ""
    );

    if (!activeSearchSuggestion) return transactionProperties.filter(p=>p.match(new RegExp("^"+escapedSearch, "i")));

    return getUniqueTransactionsPropertiesValues(budgetCycleTransactions.all, activeSearchSuggestion);
  };

  const onTransactionsDataSearchFormActiveSearchSuggestionClick = event=>{
    setActiveSearchSuggestion(null);
    setSearch("");
  };

  const onTransactionsDataSearchFormInputDropdownKeyDown = event=>{
    if(activeSearchSuggestion && event.target.value === "" && event.keyCode === 8 /* Backspace */) {
      setActiveSearchSuggestion(null);
      setSearch("");
      return;
    }
  };

  const onTransactionsDataSearchFormInputDropdownSubmit = (newSearch, event)=>{
    //If an active search filter has not yet been applied,
    // and a list item was selected, apply a search filter
    if (!activeSearchSuggestion && event.isSelectedListItem) {
      setActiveSearchSuggestion(newSearch);
      setSearch(""); //set to "" so it will propagate down to InputDropdown
      transactionsDataSearchFormInput.current.focus();
      return;
    }

    //Otherwise, set the new search value
    transactionsDataSearchFormInput.current.focus();
    onSubmit(newSearch);
  };

  const onSubmit = searchValue=>{
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
        {
          activeSearchSuggestion ?
          (
            <span className="transactions-data-search-form-active-search-suggestion badge rounded-pill" onClick={onTransactionsDataSearchFormActiveSearchSuggestionClick}>
              <i className="transactions-data-search-form-active-search-suggestion-x fas fa-xs fa-times me-1"></i>
              {activeSearchSuggestion}
            </span>
          ) :
          null
        }
        <InputDropdown className="transactions-data-search-form-input" value={search} items={getSearchSuggestions()} placeholder="Search..." inputDropdownInputRef={transactionsDataSearchFormInput} onSubmit={onTransactionsDataSearchFormInputDropdownSubmit} onInputDropdownInputKeyDown={onTransactionsDataSearchFormInputDropdownKeyDown} />
      </div>
      <div className="transactions-data-search-form-search-filters">
        {searchFilters.map(({key:searchKey, value:searchValue}, i)=>(
          <span key={i} className="transactions-data-search-form-search-filter badge rounded-pill bg-secondary" onClick={event=>onFilterClick(searchValue)}><i className="transactions-data-search-form-filter-x fas fa-xs fa-times me-1"></i>{searchKey ? `${searchKey}:` : ""}{searchValue}</span>
        ))}
      </div>
    </form>
  );
};

export default TransactionsDataSearchForm;
