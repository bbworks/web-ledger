// ## FEATUERS
// - Dropdown list opens when:
//    * click anywhere inside
//    * when the .input-dropdown-input receives input
//    * when the "Up" or "Down" keys are pressed with the .input-dropdown-input focused
// - Dropdown list closes when:
//    * a selection is clicked or chosen with the "Enter" key
//    * a click occurs outside of the dropdown
//    * another element is focused on
//    * the "Esc" key is pressed
// - Dropdown list items can be selected by:
//    * clicking on a list item using
//    * using the "Up" and "Down" keys along with the "Enter" key (when .input-dropdown-input focused)
// - Dropdown list items can be filtered/highlighted by inputting into .input-dropdown-input
// ## DESIGN
// - Dropdown input takes 100% of dropdown width
// - Dropdown list height maxes out and scrolls afterward
// - Dropdown list will scroll as selection moves
// - Dropdown list will only move the selection if the dropdown list was already open--if the dropdown list was opened using the "Up" or "Down" key, the selection will remain on the current value


(()=>{
const isDescendantOf = (element, potentialAncestor) => {
  if (
    element &&
    potentialAncestor &&
    element !== potentialAncestor
  ) return isDescendantOf(element.parentElement, potentialAncestor);

  return element != null &&
    potentialAncestor != null &&
    element === potentialAncestor;
};

const isDescendantOfDropdown = element => {
  if (
    !element.classList.contains("input-dropdown") &&
    element.parentElement
  ) return isDescendantOfDropdown(element.parentElement);

  if (element.classList.contains("input-dropdown")) return element;

  return false;
};

//Create master dropdown closure to hold all dropdown state per event
const dropdownMasterEventListener = event=>{
  const dropdown = isDescendantOfDropdown(event.target);

  //Exit if not clicked inside a dropdown
  if (!dropdown) return;

  //Declare variables
  const eventListeners = [];
  const dropdownItem = event.target.classList.contains("input-dropdown-list-item") && event.target;
  const dropdownInput = dropdown.querySelector(".input-dropdown-input");
  const dropdownList = dropdown.querySelector(".input-dropdown-list");
  const dropdownListItems = [...dropdown.querySelectorAll(".input-dropdown-list-item")];
  const previousSelectedValue = dropdownInput.value;


  //Declare functions
  const callEventListeners = event=>{
    eventListeners.filter(listenerObj=>listenerObj[0]===event.type).forEach(listenerObj=>listenerObj[1](event));
  };

  const filterDropdownItems = value=>{
    //Declare variables
    const regEx = new RegExp(`(${value})`, "i");

    //If no value was passed, exit
    if(!value) return;

    //Add .hidden to unmatched items
    dropdownListItems.filter(dropdownListItem=>!dropdownListItem.innerText.match(regEx)).forEach(dropdownListItem=>dropdownListItem.classList.add("hidden"));

    //Add a highlight to matched text in unfiltered items
   dropdownListItems.filter(dropdownListItem=>dropdownListItem.innerText.match(regEx)).forEach(dropdownListItem=>dropdownListItem.innerHTML = dropdownListItem.innerHTML.replace(regEx, `<mark class="input-dropdown-selected-highlight">$1</mark>`));
  };

  const unFilterDropdownItems = ()=> dropdownListItems.forEach(dropdownListItem=>{
    dropdownListItem.classList.remove("hidden");
    dropdownListItem.innerHTML = dropdownListItem.innerText;
  });

  const setDropdownItemsSelection = selectedDropdownListItem=>{
    resetDropdownItemsSelection();
    if(!selectedDropdownListItem) return;
    selectedDropdownListItem.classList.add("selected");
  };

  const resetDropdownItemsSelection = ()=> dropdownListItems.forEach(dropdownListItem=>dropdownListItem.classList.remove("selected"));

  const setDropdownSelection = value=>{
    const dropdownInput = dropdown.querySelector(".input-dropdown-input");
    if (!dropdownInput) throw new Error();
    dropdownInput.value = value;
    unFilterDropdownItems();
  };

  const clearDropdownSelection = event=>{
    dropdownInput.value = previousSelectedValue;
  };

  const checkDropdownListSelectionScroll = ()=>{
    //Delare variables
    const selectedDropdownListItem = dropdownList.querySelector(".input-dropdown-list-item.selected");

    //IF there is no selected item, exit
    if(!selectedDropdownListItem) return;

    const newlySelectedDropdownListItemRect = selectedDropdownListItem.getBoundingClientRect();
    const dropdownListViewport = dropdownList.getBoundingClientRect();
    const topIsBelowNotAboveViewportTop = newlySelectedDropdownListItemRect.top >= dropdownListViewport.top;
    const bottomIsAboveNotBelowViewportBottom = newlySelectedDropdownListItemRect.bottom <= dropdownListViewport.bottom;

    //Shift the view of the dropdown list (via scroll), if necessary

    //If the top is above the viewport, attempt to scroll the viewport to the top of the selection (or to the bottom scrollable area, if selection is at the bottom)
    if (!topIsBelowNotAboveViewportTop) {
      dropdownList.scroll({top: dropdownList.scrollTop + (newlySelectedDropdownListItemRect.top - dropdownListViewport.top)})
    }
    //Or, if the bottom is below the viewport, scroll the viewport down 1 height unit until we can see the selection bottom
    else if (!bottomIsAboveNotBelowViewportBottom) {
      dropdownList.scroll({top: dropdownList.scrollTop + (newlySelectedDropdownListItemRect.height * (Math.floor((newlySelectedDropdownListItemRect.bottom - dropdownListViewport.bottom)/newlySelectedDropdownListItemRect.height)+1))})
    }
  };

  const addTemporaryEventListeners = ()=>{
    document.addEventListener("click", checkIfClickedOrFocusedOutsideOfDropdown);
    document.addEventListener("focusin", checkIfClickedOrFocusedOutsideOfDropdown);

    dropdownListItems.forEach(dropdownListItem=>dropdownListItem.addEventListener("mouseenter", dropdownListItemOnMouseEnter));
  };

  const removeTemporaryEventListeners = ()=>{
    document.removeEventListener("click", checkIfClickedOrFocusedOutsideOfDropdown);
    document.removeEventListener("focusin", checkIfClickedOrFocusedOutsideOfDropdown);
    //dropdownListItems.forEach(dropdownListItem=>dropdownListItem.removeEventListener("mouseenter", setDropdownSelection));
    //dropdownList.removeEventListener("mouseleave", dropdownListOnMouseLeave);
     dropdownListItems.forEach(dropdownListItem=>dropdownListItem.removeEventListener("mouseenter", dropdownListItemOnMouseEnter));
  };

  const dropdownIsOpen = ()=>dropdown.classList.contains("open");

  const openDropdown = ()=>{
    if (dropdownIsOpen()) return;

    //Open dropdown
    dropdown.classList.add("open");

    //Set a selected value that matches the current input value, if applicable
    setDropdownItemsSelection(dropdownListItems.filter(dropdownListItem=>dropdownListItem.innerText === dropdownInput.value)[0]);

    //Add necessary event listeners to dropdown components
    addTemporaryEventListeners();
  };

  const closeDropdown = ()=>{
    if (!dropdownIsOpen) return;

    //Remove event listeners
    removeTemporaryEventListeners();

    //Close the dropdown
    dropdown.classList.remove("open");
  };

  const checkIfClickedOrFocusedOutsideOfDropdown = event=>{
    //If we click outside of the dropdown or its children, close it
    if (!isDescendantOf(event.target, dropdown)) closeDropdown();
  };


  //Declare event listeners
  const dropdownListItemOnMouseEnter = event=>{
    const dropdownListItems = [...dropdown.querySelectorAll(".input-dropdown-list-item")];
    const selectedDropdownListItem = event.target;
    setDropdownItemsSelection(selectedDropdownListItem);
  };

  const dropdownInputOnInput = event=>{

    //Declare variables
    const value = event.target.value;

    //Assure the dropdown is open
    openDropdown();

    //Start by resetting all list items to visible
    unFilterDropdownItems();

    //Now, filter items that don't match and highlight unfiltered matched text
    filterDropdownItems(value);

    //Set the selected value to the first option
    setDropdownItemsSelection(dropdown.querySelector(".input-dropdown-list-item:not(.hidden)"));

    //Make sure the selected value is within visibility
    checkDropdownListSelectionScroll();
  };

  const dropdownOnKeyDown = event=>{
    if (
      event.keyCode === 38 /* Up */ ||
      event.keyCode === 40 /* Down */ ||
      event.keyCode === 36 /* Home */ ||
      event.keyCode === 35 /* End */
    ) {
      event.preventDefault();

      //Declare variables
      const dropdownListItems = [...dropdown.querySelectorAll(".input-dropdown-list-item:not(.hidden)")];

      //Assure the dropdown is open if we pressed the "Up" or "Down" arrow
      const dropdownWasOpen = dropdownIsOpen();
      if (event.keyCode === 38 /* Up */ || event.keyCode === 40 /* Down */) openDropdown();

      //Select the next or previous dropdown list item based on the key pressed, only if the dropdown was already open
      if (dropdownWasOpen) {
        if (event.keyCode === 38 /* Up */ || event.keyCode === 40 /* Down */) {
          const upOrDown = (event.keyCode === 38 ? -1 : 1);
          const wrapAround = (event.keyCode === 38 ? dropdownListItems.length : -1);

          const currentSelectedDropdownListItem = dropdown.querySelector(".input-dropdown-list-item.selected");
          const currentSelectedDropdownListItemIndex = (dropdownListItems.indexOf(currentSelectedDropdownListItem) === -1 ? wrapAround : dropdownListItems.indexOf(currentSelectedDropdownListItem));
          const newlySelectedDropdownListItem = dropdownListItems[(currentSelectedDropdownListItemIndex+upOrDown+dropdownListItems.length)%dropdownListItems.length];
          setDropdownItemsSelection(newlySelectedDropdownListItem);
        }
        else if (event.keyCode === 36 /* Home */ || event.keyCode === 35 /* End */) {
          const firstOrLastIndex = (event.keyCode === 36 ? 0 : dropdownListItems.length-1);
          const newlySelectedDropdownListItem = dropdownListItems[firstOrLastIndex];
          setDropdownItemsSelection(newlySelectedDropdownListItem);
        }
      }

      //Check the scroll on the dropdown list to assure the newly selected item is visible
      checkDropdownListSelectionScroll();

      return;
    }

    if (event.keyCode === 13 /* Enter */) {
      event.preventDefault();

      //Declare variables
      const dropdownListItems = [...dropdown.querySelectorAll(".input-dropdown-list-item")];

      const currentSelectedDropdownListItem = dropdownListItems.filter(dropdownListItem=>dropdownListItem.classList.contains("selected"))[0];
      if (!currentSelectedDropdownListItem) return;
      setDropdownSelection(currentSelectedDropdownListItem.innerText);
      closeDropdown();
      return;
    }

    if (event.keyCode === 27 /* Esc */) {
      event.preventDefault();

      //Declare variables
      unFilterDropdownItems();
      resetDropdownItemsSelection();
      clearDropdownSelection();
      closeDropdown();
      return;
    }
  };

  const dropdownOnClick = event=>{
    //If a dropdown item was clicked, select it
    if (dropdownItem) {
      closeDropdown();
      setDropdownSelection(event.target.innerText);
      return;
    }

    //If the dropdown was clicked and not already open, open it
    openDropdown();

    //Attach permanent event listeners
    //dropdownInput.oninput = dropdownInputOnInput; //onInput event listener to filter the dropdownListItems on typing
    //dropdown.onkeydown = dropdownOnKeyDown; /* possible with div.[tabindex=0] */

    //Also add onMouseover event listeners on the dropdown items
    //dropdownListItems.forEach(dropdownListItem=>dropdownListItem.addEventListener("mouseenter", setDropdownSelection));
    //dropdownList.addEventListener("mouseleave", dropdownListOnMouseLeave);
  };

  // const dropdownListOnMouseLeave = event=>{
  //   if (!dropdown.classList.contains("open")) return;
  //   clearDropdownSelection(event);
  // };

  //Save event listeners
  eventListeners.push(["click", dropdownOnClick]);
  eventListeners.push(["input", dropdownInputOnInput]);
  eventListeners.push(["keydown", dropdownOnKeyDown]);

  callEventListeners(event);
};

document.addEventListener("click", dropdownMasterEventListener /* dropdownOnClick */);
document.addEventListener("input", dropdownMasterEventListener /* dropdownInputOnInput */);
document.addEventListener("keydown", dropdownMasterEventListener /* dropdownOnKeyDown */);
})();
