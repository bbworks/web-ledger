import {useState, useEffect, useRef} from 'react';

import InputDropdown from './../InputDropdown';

import './index.scss';

const TransactionsDataSearchForm = ({ budgetCycleTransactions, transactionProperties, searchFilters, onSubmit:onSubmitProp, onFilterClick:onFilterClickProp })=>{
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchFilter, setActiveSearchFilter] = useState(null);

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
    const escapedSearchQuery = searchQuery.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');

    if (!activeSearchFilter) 
      return transactionProperties.filter(p=>p.match(new RegExp("^"+escapedSearchQuery, "i")));

    return getUniqueTransactionsPropertiesValues(budgetCycleTransactions.all, activeSearchFilter);
  };

  const onTransactionsDataSearchFormActiveSearchFilterClick = event=>{
    setActiveSearchFilter(null);
    setSearchQuery("");
  };

  const onTransactionsDataSearchFormInputDropdownKeyDown = event=>{
    if(activeSearchFilter && event.target.value === "" && event.keyCode === 8 /* Backspace */) {
      setActiveSearchFilter(null);
      setSearchQuery("");
      return;
    }
  };

  const onTransactionsDataSearchFormInputDropdownSubmit = (value, event)=>{
    //If an active search filter has not yet been applied,
    // and a list item was selected, apply a search filter
    if (!activeSearchFilter && event.isSelectedListItem) {
      setActiveSearchFilter(value);
      setSearchQuery(""); //set to "" so it will propagate down to InputDropdown
      transactionsDataSearchFormInput.current.focus();
      return;
    }

    //Otherwise, set the new search query value
    transactionsDataSearchFormInput.current.focus();
    onSubmit(value);
  };

  const onSubmit = value=>{
    //Reset the search query
    setSearchQuery("");

    //Reset the active search suggestion
    setActiveSearchFilter(null);

    const search = {
      key: activeSearchFilter,
      value: value,
    };

    //Send the search to the parent
    onSubmitProp(search);
  };

  const onFilterClick = removedSearchFilter=>{
    onFilterClickProp(removedSearchFilter);
  };

  return (
    <form className="transactions-data-search-form" onSubmit={onSubmit}>
      <div className="transactions-data-search-form-input-container">
        <i className="transactions-data-search-form-icon fas fa-search"></i>
        {
          activeSearchFilter ?
          (
            <span className="transactions-data-search-form-active-search-suggestion badge rounded-pill" onClick={onTransactionsDataSearchFormActiveSearchFilterClick}>
              <i className="transactions-data-search-form-active-search-suggestion-x fas fa-xs fa-times me-1"></i>
              {activeSearchFilter}
            </span>
          ) :
          null
        }
        <InputDropdown className="transactions-data-search-form-input" value={searchQuery} items={getSearchSuggestions()} placeholder="Search..." inputDropdownInputRef={transactionsDataSearchFormInput} onSubmit={onTransactionsDataSearchFormInputDropdownSubmit} onInputDropdownInputKeyDown={onTransactionsDataSearchFormInputDropdownKeyDown} />
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
