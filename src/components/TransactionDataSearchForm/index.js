import {useState, useEffect} from 'react';

import './index.scss';

const TransactionDataSearchForm = ({ searchFilters, onSubmit:onSubmitProp, onFilterClick:onFilterClickProp })=>{
  const [search, setSearch] = useState("");

  const onChange = event=>{
    const searchText = event.target.value;
    setSearch(searchText);
  };

  const onSubmit = event=>{
    event.preventDefault();

    //Save the search value
    const searchValue = search;

    //Reset the search value
    setSearch("");

    //Send the search value to the parent
    onSubmitProp(searchValue);
  };

  const onFilterClick = removedSearchFilter=>{
    onFilterClickProp(removedSearchFilter);
  };

  return (
    <form className="transaction-data-search-form" onSubmit={onSubmit}>
      <div className="transaction-data-search-form-input-container">
        <i className="transaction-data-search-form-icon fas fa-search"></i>
        <input className="transaction-data-search-form-input" type="input" placeholder="Search..." value={search} onChange={onChange}/>
      </div>
      <div className="transaction-data-search-form-search-filters">
        {searchFilters.map((SearchFilter, i)=>(
          <span key={i} className="transaction-data-search-form-search-filter badge rounded-pill bg-secondary" onClick={event=>onFilterClick(SearchFilter)}><i className="transaction-data-search-form-filter-x fas fa-xs fa-times me-1"></i>{SearchFilter}</span>
        ))}
      </div>
    </form>
  );
};

export default TransactionDataSearchForm;
