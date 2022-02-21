// ## FEATUERS
// - InputDropdown list opens when:
//    * clicked anywhere inside of
//    * when the .input-dropdown-input receives input
//    * when the "Up" or "Down" keys are pressed with the .input-dropdown-input focused
// - InputDropdown list closes when:
//    * a selection is clicked or chosen with the "Enter" key
//    * a click occurs outside of the InputDropdown
//    * the InputDropdown loses focus (activates after 100ms, to not conflict with cilck events)
//    * another element is focused on
//    * the "Esc" key is pressed
//    * the chevron is clicked while the InputDropdown is open
// - InputDropdown list items can be selected by:
//    * clicking on a list item using
//    * using the "Up" and "Down" keys along with the "Enter" key (when .input-dropdown-input focused)
// - InputDropdown list items can be filtered/highlighted by inputting into .input-dropdown-input
// ## DESIGN
// - .input-dropdown-input takes 100% of InputDropdown width
// - .input-dropdown-list height maxes out and scrolls afterward
// - .input-dropdown-list will scroll as selection moves
// - .input-dropdown-list will only move the selection if the InputDropdown list was already open--if the .input-dropdown-list was opened using the "Up" or "Down" key, the selection will remain on the current value
// ## OPTIONS
// - setToStartingValueOnInputDropdownClose
// - selectTopListItemOnInputDropdownInputChange


import {useState, useEffect, useRef} from 'react';

import {isDescendantOf, matchValueAgainstValue} from './../../utilities';

//import './InputDropdown.js';
import './InputDropdown.css';
import './index.scss';

const InputDropdown = (props)=>{
  const { name, value:initialValue="", items:initialItems=[], placeholder, tabIndex, inputDropdownInputRef, className, onSubmit:onSubmitProp } = props;

  const options = {
    setToStartingValueOnInputDropdownClose: false,
    selectTopListItemOnInputDropdownInputChange: false,
  };

  const inputDropdownInputListeners = Object.entries(props)
    .filter(([propName, propValue])=>propName.match("onInputDropdownInput[A-Z]"))
    .filter(([propName])=>!["onInputDropdownInputChange", "onInputDropdownInputFocus"].includes(propName)) //remove listeners that will be attached to component-level listeners
    .map(([propName, propValue])=>{const matches = propName.match(/onInputDropdownInput(\w+)/);
      return [
        (matches ? `on${matches[1]}` : propName),
        propValue,
      ];
    })
    .reduce((acc, [propName, propValue])=>({
      ...acc,
      [propName]: propValue,
    }), {});

  const filterListItems = (items, searchFilter)=>{
    if (!searchFilter) return items;

    //Add .hidden to unmatched items
    return items.filter(item=>matchValueAgainstValue(item, searchFilter));
  };

  const [value, setValue] = useState(initialValue);
  const [startingValue, setStartingValue] = useState(null);
  const [searchFilter, setSearchFilter] = useState(null)
  const [filteredListItems, setFilteredListItems] = useState(filterListItems(initialItems, searchFilter));
  const [selectedListItem, setSelectedListItem] = useState(null);
  const [isInputDropdownOpen, setIsInputDropdownOpen] = useState(false);
  const [wasInputDropdownOpen, setWasInputDropdownOpen] = useState(false);

  const inputDropdownListRef = useRef(null);
  const inputDropdownRef = useRef(null);

  //Declare helper functions
  const isDescendantOfDropdown = element => {
    if (
      !element.classList.contains("input-dropdown") &&
      element.parentElement
    ) return isDescendantOfDropdown(element.parentElement);

    if (element.classList.contains("input-dropdown")) return element;

    return false;
  };

  //Declare functions
  const checkInputDropdownListSelectionScroll = ()=>{
    //If there is no selected item, exit
    if(!selectedListItem) return;

    //Find the selected list item's DOM node
    const selectedListItemNode = [...inputDropdownListRef.current.querySelectorAll(".input-dropdown-list-item")].find(item=>item.innerText === selectedListItem);

    if (!selectedListItemNode) return;

    const selectedListItemNodeRect = selectedListItemNode.getBoundingClientRect();
    const inputDropdownListViewport = inputDropdownListRef.current.getBoundingClientRect();
    const topIsBelowNotAboveViewportTop = selectedListItemNodeRect.top >= inputDropdownListViewport.top;
    const bottomIsAboveNotBelowViewportBottom = selectedListItemNodeRect.bottom <= inputDropdownListViewport.bottom;

    //Shift the view of the dropdown list (via scroll), if necessary

    //If the top is above the viewport, attempt to scroll the viewport to the top of the selection (or to the bottom scrollable area, if selection is at the bottom)
    if (!topIsBelowNotAboveViewportTop) {
      return inputDropdownListRef.current.scroll({top: inputDropdownListRef.current.scrollTop + (selectedListItemNodeRect.top - inputDropdownListViewport.top)});
    }

    //Or, if the bottom is below the viewport, scroll the viewport down 1 height unit until we can see the selection bottom
    if (!bottomIsAboveNotBelowViewportBottom) {
      //return inputDropdownListRef.current.scroll({top: inputDropdownListRef.current.scrollTop + (selectedListItemNodeRect.height * (Math.floor((selectedListItemNodeRect.bottom - inputDropdownListViewport.bottom)/selectedListItemNodeRect.height)+1))});
      return inputDropdownListRef.current.scroll({top: inputDropdownListRef.current.scrollTop + (selectedListItemNodeRect.bottom - inputDropdownListViewport.bottom)});
    }
  };

  const addInputDropdownListItemSelection = (text, selectedListItem)=>{
    if (!selectedListItem) return "";

    //Add .hidden to unmatched items
    return (
      text === selectedListItem ?
      "selected" :
      ""
    );
  };

  const getInputDropdownListItemFilteredText = (text, searchFilter)=>{
    //If no value was passed, exit
    if(!searchFilter) return text;

    const match = matchValueAgainstValue(text, searchFilter);
    if (!match) return text;
    return text.replace(match[1], `<mark class="input-dropdown-list-item-highlight">$&</mark>`);
  };

  const openInputDropdown = ()=>{
    setIsInputDropdownOpen(previouslyOpen=>{
      setWasInputDropdownOpen(previouslyOpen);
      if (previouslyOpen) return true;

      //If opening from a closed state, save the starting value
      setStartingValue(value);

      //Set the selected value to the current value
      setSelectedListItem(value);

      return true;
    });
  };

  const closeInputDropdown = ()=>{
    //Reset the search filter
    setSearchFilter(null);

    //Reset the selected list item
    setSelectedListItem(null);

    //Close the input dropdown
    setIsInputDropdownOpen(false);
  };

  const onOutsideClick = ()=>{
    //Reset the value
    if (options.setToStartingValueOnInputDropdownClose) setValue(startingValue);

    //Close the input dropdown
    closeInputDropdown();
  };

  //Declare event listeners
  const onInputDropdownInputChange = event=>{
    const newValue = event.target.value;

    //Update the component's state
    setValue(newValue);

    //Update the search filter
    setSearchFilter(newValue);

    //Assure the input dropdown is open
    openInputDropdown();

    //Call the passed listener, if provided
    if (props.onInputDropdownInputChange) props.onInputDropdownInputChange(event);
  };

  const onInputDropdownInputFocus = event=>{
    //Assure the input dropdown is open
    openInputDropdown();

    //Call the passed listener, if provided
    if (props.onInputDropdownInputFocus) props.onInputDropdownInputFocus(event);
  };

  const onInputDropdownListItemMouseDown = event=>{
    //NOTE: Switching from onClick to onMouseDown due to browser issue
    // where onClick is not registered due to list items disappearing
    // from component re-render on onBlur
    // https://github.com/facebook/react/issues/4210
    const newValue = event.target.innerText;

    //Set the value
    setValue(newValue);

    //Close the input dropdown
    closeInputDropdown();

    onSubmit({
      ...event,
      isSelectedListItem: true,
    }, newValue);
  };

  const onInputDropdownListItemMouseMove = event=>{
    const newSelectedListItem = event.target.innerText;

    //Set the selected list item
    setSelectedListItem(newSelectedListItem);
  };

  const onInputDropdownListMouseLeave = event=>{
    //Clear the selected list item
    setSelectedListItem(null);
  };

  const onClick = event=>{
    const newValue = event.target.innerText;
    const inputDropdownInput = event.target.closest(".input-dropdown-input");

    //If the input dropdown was already open,
    // and the click was not on the input,
    // close the input dropdown
    if (isInputDropdownOpen && !inputDropdownInput) return closeInputDropdown();

    //Otherwise, open the input dropdown
    openInputDropdown();
  };

  const onKeyDown = event=>{
    //If the user pressed the "Up" or "Down" arrow,
    //  "Home" or "End" keys
    if (
      event.keyCode === 38 /* Up */ ||
      event.keyCode === 40 /* Down */ ||
      event.keyCode === 36 /* Home */ ||
      event.keyCode === 35 /* End */
    ) {
      event.preventDefault();

      //If the user pressed the "Up" or "Down" arrow,
      // and the input dropdown is not already open, open it
      if (event.keyCode === 38 /* Up */ || event.keyCode === 40 /* Down */) {
        if (!isInputDropdownOpen) return openInputDropdown();
      }

      //If the input dropdown is already open,
      // select the next or previous dropdown list item
      // based on the key pressed
      let newSelectedListItemIndex;
      if (event.keyCode === 38 /* Up */ || event.keyCode === 40 /* Down */) {
        //If no list item is found for the current value,
        // default to the top ("Down") or bottom ("Up"),
        // or move one up or down from the current selection
        const upOrDown = (event.keyCode === 38 ? -1 : 1);
        const wrapAround = (event.keyCode === 38 ? filteredListItems.length : -1);
        const selectedListItemIndex = (filteredListItems.indexOf(selectedListItem) === -1 ? wrapAround : filteredListItems.indexOf(selectedListItem));
        newSelectedListItemIndex = (selectedListItemIndex + upOrDown + filteredListItems.length)%filteredListItems.length;
      }
      else if (event.keyCode === 36 /* Home */ || event.keyCode === 35 /* End */) {
        //Select the first or last list item
        newSelectedListItemIndex = (event.keyCode === 36 ? 0 : filteredListItems.length-1);
      }

      //Move the selection
      const newSelectedListItem = filteredListItems[newSelectedListItemIndex];
      setSelectedListItem(newSelectedListItem);

      return;
    }

    //If the user hit the "Esc" key
    if (event.keyCode === 27 /* Esc */) {
      event.preventDefault();

      //Reset the value
      if (options.setToStartingValueOnInputDropdownClose) setValue(startingValue);

      //Close the input dropdown
      closeInputDropdown();

      return;
    }

    //If the user hit the "Enter" key
    if (event.keyCode === 13 /* Enter */) {
      event.preventDefault();

      //Set the value if we selected one
      const newValue = (selectedListItem ? selectedListItem : value);

      if (selectedListItem) setValue(selectedListItem);

      //Reset the search filter
      setSearchFilter(null);

      //Close the input dropdown
      closeInputDropdown();

      //Act as though a form was submitted with a given value
      onSubmit({
        ...event,
        isSelectedListItem: (selectedListItem ? true : false),
      }, newValue);

      return;
    }
  };

  const onBlur = event=>{
    //Close the input dropdown
    window.setTimeout(()=>closeInputDropdown(), 100);
  };

  const onSubmit = (event, value)=>{
    if (onSubmitProp) onSubmitProp(event, value);
  };

  //Update the dropdown value whenever a new value or items are passed
  useEffect(()=>setValue(initialValue), [initialValue, initialItems]);

  //Update the filtered list items whenever the search filter updates
  // and set the selection to the top item
  useEffect(()=>
    setFilteredListItems(()=>{
      //Filter the items
      const newFilteredListItems = filterListItems(initialItems, searchFilter);

      //Set the selected value to the first option
      if (options.selectTopListItemOnInputDropdownInputChange)
        setSelectedListItem(newFilteredListItems[0]);
      else
        setSelectedListItem(null);

      return newFilteredListItems;
    })
  , [searchFilter, initialItems]);

  //While the dropdown is open,
  // when the selected list item changes,
  // check the scroll on the dropdown list
  // to assure the newly selected item is visible
  useEffect(()=>{
    checkInputDropdownListSelectionScroll();
  }, [selectedListItem]);

  //Add/remove onOutsideClick event listeners
  useEffect(()=>{
    const checkIfClickedOrFocusedOutsideOfDropdown = event=>{
      //If we click outside of the dropdown or its children, close it
      if (!isDescendantOf(event.target, inputDropdownRef.current)) onOutsideClick();
    };

    const addOnOutsideClick = ()=>{
      document.addEventListener("click", checkIfClickedOrFocusedOutsideOfDropdown);
      document.addEventListener("focus", checkIfClickedOrFocusedOutsideOfDropdown);
    };

    const removeOnOutsideClick = ()=>{
      document.removeEventListener("click", checkIfClickedOrFocusedOutsideOfDropdown);
      document.removeEventListener("focus", checkIfClickedOrFocusedOutsideOfDropdown);
    };

    //If closed, or was previously open, do not add the listener
    if (!isInputDropdownOpen) return;

    //Otherwise, if opening for the first time, add the onOutsideClick listener
    addOnOutsideClick();

    //Return side effect cleanup
    return ()=>removeOnOutsideClick();
  }, [isInputDropdownOpen, wasInputDropdownOpen]);

  //useEffect(()=>console.log(`value: ${value}\r\nsearchFilter: ${searchFilter}\r\nselectedListItem: ${selectedListItem}\r\nfilteredListItems`, filteredListItems), [value, searchFilter, selectedListItem, filteredListItems])

  return (
    <div className={`input-dropdown ${className} ${isInputDropdownOpen ? "open" : ""}`} onClick={onClick} onKeyDown={onKeyDown} ref={inputDropdownRef} onBlur={onBlur} >
      <input className="input-dropdown-input" name={name} value={value} placeholder={placeholder} tabIndex={tabIndex} ref={inputDropdownInputRef} autoComplete="off" onChange={onInputDropdownInputChange} onFocus={onInputDropdownInputFocus} {...inputDropdownInputListeners}/>
      <div className="input-dropdown-chevron-container">
        <i className="input-dropdown-chevron"></i>
      </div>
      <ul className="input-dropdown-list" ref={inputDropdownListRef} onMouseLeave={onInputDropdownListMouseLeave} >
        {filteredListItems.map(item=>
          <li key={item} className={`input-dropdown-list-item ${addInputDropdownListItemSelection(item, selectedListItem)}`} onMouseDown={onInputDropdownListItemMouseDown} onMouseMove={onInputDropdownListItemMouseMove} dangerouslySetInnerHTML={{__html: getInputDropdownListItemFilteredText(item, searchFilter)}}></li>
        )}
      </ul>
    </div>
  );
};

export default InputDropdown;
