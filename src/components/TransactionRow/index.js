import {useState, useEffect, useRef} from 'react';

import {isDescendantOf, getTransactionDefaultDescriptionDisplay, formatTransactionDisplay} from './../../utilities';

import './index.scss';

const TransactionRow = ({ transaction, onTransactionEditButtonClick:onTransactionEditButtonClickProp, onTransactionDeleteButtonClick:onTransactionDeleteButtonClickProp })=>{
  const [startingX, setStartingX] = useState(0);
  const [startingTouch, setstartingTouch] = useState({});
  const [translateX, setTranslateX] = useState(0);
  const [stickyX, setStickyX] = useState(0);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const [isFirstDrag, setIsFirstDrag] = useState(false);
  const [isScrollingNotDragging, setIsScrollingNotDragging] = useState(false);

  const maxNecessaryDragX = -84; //px, how far over the user must drag to activate the delete button
  const minAllowableDragX = null; //px, how far the user can drag to the left
  const maxAllowableDragX = 0; //px, how far the user can drag to the right

  const isDragFeatureActive = ()=>(stickyX !== 0);

  const [transactionDisplay, setTransactionDisplay] = useState({
    PostedDate: "",
    TransactionDate: "",
    AccountNumber: "",
    Type: "",
    Description: "",
    Amount: "",
    Budget: "",
    Category: "",
    Notes: "",
    Tags: [],
  });

  useEffect(()=>{
    const formattedTransactionDisplay = formatTransactionDisplay(transaction);
    setTransactionDisplay({
      ...formattedTransactionDisplay,
      Description: getTransactionDefaultDescriptionDisplay(transaction),
      AccountNumber: formattedTransactionDisplay.AccountNumber || "*----",
      Category: formattedTransactionDisplay.Category || "[uncategorized]",
      Budget: formattedTransactionDisplay.Budget || "[unbudgeted]"
    })
  }, [transaction]);

  const onTransactionEditButtonClick = event=>{
    if (isDragFeatureActive()) return;
    onTransactionEditButtonClickProp(transaction);
  };

  const onTransactionDeleteButtonClick = event=>{
    onTransactionDeleteButtonClickProp(transaction);
  };

  //Once the user drags over the necessary distance,
  // set the sticky position
  useEffect(()=>{

  }, [translateX]);

  const onTouchStart = event=>{
    //Set where the touch starts
    const touch = event.touches[0];
    setstartingTouch(touch);

    //Mark that the target is being dragged,
    // so the smooth snapback can be deactivated
    setIsBeingDragged(true);

    //Also mark that this is the very first drag,
    // so we can calculate whether to scroll or not
    // based on the direction of the drag
    setIsFirstDrag(true);
  };

  const onTouchMove = event=>{
    //As the touch moves, calculate the drag distance,
    // and set target's translateX to the drag distance,
    // beginning at the target's start position
    const touch = event.touches[0];
    const dragDistanceX = touch.clientX - startingTouch.clientX;
    const dragDistanceY = touch.clientY - startingTouch.clientY;
    const potentialNewTranslateX = startingX + dragDistanceX;

    //Check whether the target needs to be dragged, or
    // if the drag was too vertical (i.e. a scroll attempt)
    if (isFirstDrag) {
      //Reset the first drag mark
      setIsFirstDrag(false);

      //If the scroll was too vertical, assume the user
      // was scrolling, not dragging,
      // set the isScrolling mark, and prematurely return
      // from this listener
      if (Math.abs(dragDistanceY) > Math.abs(dragDistanceX)) return setIsScrollingNotDragging(true);
    }

    //If the user is scrolling, don't drag
    if (isScrollingNotDragging) return;

    //Continue with the drag logic
    event.preventDefault();

    //Check that it is within the allowable drag bounds,
    // and adjust accordingly if not
    //And if we over-drag (drag past the max necessary position),
    // decrease the drag
    const newTranslateX = ((!!minAllowableDragX || minAllowableDragX === 0) && potentialNewTranslateX < minAllowableDragX ? minAllowableDragX : ((!!maxAllowableDragX || maxAllowableDragX === 0) && potentialNewTranslateX > maxAllowableDragX ? maxAllowableDragX : (
      potentialNewTranslateX < maxNecessaryDragX ?
      maxNecessaryDragX - ((maxNecessaryDragX - dragDistanceX)/5) :
      potentialNewTranslateX
    )));

    setTranslateX(newTranslateX);
  };

  const onTouchEnd = event=>{
    const newStickyX = (translateX <= maxNecessaryDragX ? maxNecessaryDragX : 0);

    //Set the sticky position to either the "open" position,
    // or back to 0, depending on where the drag ended
    setStickyXWrapper(newStickyX);

    //Assure the first drag mark is reset
    setIsFirstDrag(false);

    //Reset whether the user is scrolling or dragging
    setIsScrollingNotDragging(false);
  };

  const endDragFeature = ()=>{
    setStickyXWrapper(0);
  };

  const setStickyXWrapper = stickyX=>{
    setStickyX(()=>{
      //Reset the target's starting position, and
      // the translated position, to the sticky position
      setTranslateX(stickyX);
      setStartingX(stickyX);

      //Mark that the target is not being dragged,
      // so the smooth snapback can be activated
      setIsBeingDragged(false);

      return stickyX;
    });
  };

  //Save the component DOM node for reference
  const transactionRow = useRef(null);

  //Create an event listener to check if the user
  // touches outside the dragged target
  const onOutsideTouchStart = event=>{
    if (isDescendantOf(event.target, transactionRow.current)) return;
    if (isDragFeatureActive()) {
      event.preventDefault();
      endDragFeature();
    }
  };

  //Remove & add the outside touch event listener on each render
  useEffect(()=>{
    document.addEventListener("touchstart", onOutsideTouchStart, {passive: false});
    if (transactionRow.current) transactionRow.current.addEventListener("touchmove", onTouchMove);
    return ()=>{
      document.removeEventListener("touchstart", onOutsideTouchStart);
      if (transactionRow.current) transactionRow.current.removeEventListener("touchmove", onTouchMove);
    };
  }, [transactionRow, onTouchMove, onOutsideTouchStart]);

  return (
    <div className={`transaction-row ${(!isBeingDragged ? "released" : '')}`} style={{transform: `translateX(${translateX}px)`}} onTouchStart={onTouchStart} /* onTouchMove={onTouchMove} //moved to useEffect() for {passive: false} (made default by Chrome) */ onTouchEnd={onTouchEnd} ref={transactionRow} >
      <div className="transaction-row-container" onClick={onTransactionEditButtonClick} >
        <div className="transaction-row-description-container">
          <span className={`transaction-row-description ${(!transaction.DescriptionDisplay ? "uncategorized" : "")}`}>{transactionDisplay.Description}</span>
          <span className={`transaction-row-amount${transaction.Amount >= 0 ? " positive" : ""}`}>{transactionDisplay.Amount}</span>
        </div>
        <div className="transaction-row-subdescription-container">
          <span className="transaction-row-account">{transactionDisplay.AccountNumber}</span>
          &nbsp;|&nbsp;
          <span className="transaction-row-budget">{transactionDisplay.Budget}</span>
        </div>
      </div>
      <button className={"transaction-row-delete-button"} onClick={onTransactionDeleteButtonClick} tabIndex={-1}>
        <span className="transaction-row-delete-button-text">Delete</span>
      </button>
    </div>
  );
};

export default TransactionRow;
