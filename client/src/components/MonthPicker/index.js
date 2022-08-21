// # MONTH PICKER
//
// Month date picker that will return the UTC Date of the chosen month (i.e. 2022-03-01T00:00:00.000Z)
// In month (default) view, you will see the 12 months to choose from, along with the current value's month highlighted (if also on the current value's year)
// When going into year view, you will see the 10-year span of the currently selected year, as well as the currently selected year (not the current value's year) highlighted


import {useState, useEffect} from 'react';

import {getBudgetCycleFromDate, getBudgetCycleFromBudgetCycleString} from './../../utilities';

import './index.scss';

const MonthPicker = ({value:initialValue, onChange:onChangeProp, onToggle:onToggleProp})=>{
  //Create helper functions
  const convertYearMonthToMonthDate = (year, month)=>{
    return getBudgetCycleFromDate(new Date(year, month));
  };

  const convertMonthStringToMonthDate = date=>{
    return getBudgetCycleFromDate(date);
  };

  const isValidInitialDate = initialValue instanceof Date && !isNaN(initialValue.getTime());

  const MIN_DATE = convertMonthStringToMonthDate(new Date(new Date(-8640000000000000).setUTCMonth(new Date(-8640000000000000).getUTCMonth()+1))); //as we can't go lower than the min date, increment 1 month
  const MAX_DATE = convertMonthStringToMonthDate(new Date(8640000000000000));

  const getYearRangeMin = year=>{
    return Math.floor(year/10)*10;
  };

  const currentDate = new Date();
  const startingValue = (isValidInitialDate ? initialValue : currentDate);

  const [value, setValue] = useState(convertYearMonthToMonthDate(startingValue));
  const [selectedYear, setSelectedYear] = useState(startingValue.getUTCFullYear());
  const [selectedMonth, setSelectedMonth] = useState(startingValue.getUTCMonth());
  const [isInYearView, setIsInYearView] = useState(false);
  const [yearRangeMin, setYearRangeMin] = useState(getYearRangeMin(selectedYear));

  const [isOpen, setIsOpen] = useState(false);

  const startYear = Math.floor(selectedYear/10)*10-1;
  const endYear = Math.ceil(selectedYear/10)*10;

  const months = [
    {name: "January", monthIndex: 0},
    {name: "February", monthIndex: 1},
    {name: "March", monthIndex: 2},
    {name: "April", monthIndex: 3},
    {name: "May", monthIndex: 4},
    {name: "June", monthIndex: 5},
    {name: "July", monthIndex: 6},
    {name: "August", monthIndex: 7},
    {name: "September", monthIndex: 8},
    {name: "October", monthIndex: 9},
    {name: "November", monthIndex: 10},
    {name: "December", monthIndex: 11},
  ];

  //Create helper functions
  const setValueWrapper = value=>{
    return setValue(new Date(Math.max(Math.min(value, MAX_DATE), MIN_DATE)));
  };

  const setSelectedYearWrapper = value=>{
    setSelectedYear(previousSelectedYear=>{
      if(typeof value === "function") value = value(previousSelectedYear);
      return Math.max(Math.min(value, MAX_DATE.getUTCFullYear()), MIN_DATE.getUTCFullYear());
    });
  };

  const setYearRangeMinWrapper = value=>{
    setYearRangeMin(previousYearRangeMin=>{
      if(typeof value === "function") value = value(previousYearRangeMin);
      return Math.max(Math.min(value, MAX_DATE.getUTCFullYear()), MIN_DATE.getUTCFullYear());
    });
  }

  const isGrayedYear = selectedYear=>{
    return selectedYear === yearRangeMin-1 || selectedYear === yearRangeMin+10;
  };


  //Create event listeners
  const onArrowClick = event=>{
    if (!isInYearView) {
      const increment = Number(event.target.getAttribute("data-increment"));
      if (isNaN(increment)) return;
      return setSelectedYearWrapper(previousSelectedYear=>previousSelectedYear+increment);
    }

    const increment = Number(event.target.getAttribute("data-increment"));
    if (isNaN(increment)) return;
    return setYearRangeMinWrapper(previousYearRangeMin=>previousYearRangeMin+(increment*10));
  };

  const onSelectedYearClick = event=>{
    //Whether we were or weren't in year mode already, set (or keep) true
    setIsInYearView(true);
  };

  const onToggle = event=>{
    setIsOpen(previousIsOpen=>!previousIsOpen);
  };

  const onChange = event=>{
    const datePart = event.target.getAttribute("data-datepart");

    //If no month or year value can be determined,
    // just close the month picker
    if (!["year","month"].includes(datePart)) return setIsOpen(false);

    //Otherwise, get the newly selected value
    const newSelection = Number(event.target.getAttribute(`data-${datePart}`));

    //If in month view, select & forward the new date value
    if (!isInYearView) {
      //Update the selected month
      setSelectedMonth(newSelection);

      //Close the month picker
      setIsOpen(false);

      //Also, update the current value in state
      const newValue = convertYearMonthToMonthDate(datePart === "year" ? newSelection : selectedYear, datePart === "month" ? newSelection : selectedMonth);
      setValue(newValue);
      //console.log(newValue.toJSON());

      //Forward the newly selected value
      if(onChangeProp) onChangeProp(newValue);
      return;
    }

    //Otherwise, a year was clicked on

    //If clicked on a grayed out year, scroll the year range
    if (isGrayedYear(newSelection))
      //Update the value
      return setYearRangeMinWrapper(Math.floor(newSelection/10)*10);

    //Otherwise, a new year has been selected
    setSelectedYearWrapper(newSelection);
    setIsInYearView(false);
    return;
  };

  //Create side effects

  //WHen the inital value passed in changes, update the value in state
  useEffect(()=>{
    if(!initialValue) return;
    setValueWrapper(initialValue);
    setSelectedYear(initialValue.getUTCFullYear());
    setSelectedMonth(initialValue.getUTCMonth());
  }, [initialValue]);

  return (
    <div className="month-picker-container">
      <button className="month-picker-toggle" type="button">
        <i className={`month-picker-toggle-icon fas ${isOpen ? "fa-calendar-minus" : "fa-calendar-plus"}`} onClick={onToggle}>
        </i>
      </button>
      {
        !isOpen ?
        null : (
        <div className="month-picker">
          <div className="month-picker-header">
            <button className="month-picker-header-arrow" type="button" data-increment="-1" {...(selectedYear <= MIN_DATE.getUTCFullYear() && {disabled: true})} onClick={onArrowClick}><i className="fas fa-chevron-left"></i></button>
            <button className="month-picker-header-year" type="button" {...(!isInYearView && {onClick: onSelectedYearClick})}>{!isInYearView ? selectedYear.toString() : `${yearRangeMin.toString()}-${(yearRangeMin+9).toString()}`}</button>
            <button className="month-picker-header-arrow" type="button" data-increment="1" {...(selectedYear >= MAX_DATE.getUTCFullYear() && {disabled: true})} onClick={onArrowClick}><i className="fas fa-chevron-right"></i></button>
          </div>
          {
            !isInYearView ?
            (
              <div className="grid month-picker-grid">
                {months.map(({name, monthIndex})=>(
                  <div key={monthIndex} className={`grid-item month-picker-grid-month${monthIndex === value.getUTCMonth() && selectedYear === value.getUTCFullYear() ? " selected" : ""}`} data-datepart="month" data-month={monthIndex} onClick={onChange}>{name}</div>
                ))}
              </div>
            ) :
            (
              <div className="grid year-picker-grid">
                {Array(12).fill().map((el,i)=>{
                    const y = yearRangeMin-1+i;
                    return <div key={i} className={`grid-item year-picker-grid-year${y === selectedYear ? " selected" : ""}${isGrayedYear(y) ? " grayed" : ""}`} data-datepart="year" data-year={y} onClick={onChange}>{y}</div>
                  })}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
};

export default MonthPicker;
