export const getMonthFromNumber = number=>{
  if (number === 0) return "January";
  if (number === 1) return "February";
  if (number === 2) return "March";
  if (number === 3) return "April";
  if (number === 4) return "May";
  if (number === 5) return "June";
  if (number === 6) return "July";
  if (number === 7) return "August";
  if (number === 8) return "September";
  if (number === 9) return "October";
  if (number === 10) return "November";
  if (number === 11) return "December";
  return null;
};

export const getNumberFromMonth = month=>{
  if (month === "January") return 0;
  if (month === "February") return 1;
  if (month === "March") return 2;
  if (month === "April") return 3;
  if (month === "May") return 4;
  if (month === "June") return 5;
  if (month === "July") return 6;
  if (month === "August") return 7;
  if (month === "September") return 8;
  if (month === "October") return 9;
  if (month === "November") return 10;
  if (month === "December") return 11;
  return null;
};

export const convertDateStringToDate = (dateString, dateStringFormat)=>{
  //Declare variables
  const yearSymbol = "y";
  const monthSymbol = "M";
  const daySymbol = "d";

  const yearFormatRegEx = new RegExp(`(${yearSymbol}{1,4})`, "g");
  const monthFormatRegEx = new RegExp(`(${monthSymbol}{1,4})`, "g");
  const dayFormatRegEx = new RegExp(`(${daySymbol}{1,2})`, "g");

  const getDatePartByFormat = (dateString, dateStringFormat, datePartFormatRegex, getDatePartCallback)=>{
    //Match against the provided format
    const isMatch = [...dateStringFormat.matchAll(datePartFormatRegex)];

    //If none were found, or more than one match is found, throw
    if (!isMatch || isMatch.length > 1) throw new Error(`Error: Format "${dateStringFormat}" matched RegExp ${datePartFormatRegex.toString()} ${(isMatch ? isMatch.length : 0)} time${(isMatch ? "s" : "")}.`);

    const matchStartingIndex = isMatch[0].index;
    const matchedFormat = isMatch[0][1];
    const matchEndingIndex = matchedFormat.length + matchStartingIndex;
    const matchedString = dateString.substring(matchStartingIndex, matchEndingIndex);

    //Return back the month index based on the format
    return getDatePartCallback(matchedString, matchedFormat);
  };

  const getYearByFormat = (yearString, yearFormat)=>{
    if (Number.isNaN(yearString)) return null;

    if (yearFormat === "yy") return Number((new Date()).getUTCFullYear().toString().substring(0,2)+yearString);
    if (yearFormat === "yyyy") return Number(yearString);

    return null;
  };

  const getMonthIndexByFormat = (monthString, monthFormat)=>{
    if (monthFormat === "M") {
      if (monthString === "1") return 0;
      if (monthString === "2") return 1;
      if (monthString === "3") return 2;
      if (monthString === "4") return 3;
      if (monthString === "5") return 4;
      if (monthString === "6") return 5;
      if (monthString === "7") return 6;
      if (monthString === "8") return 7;
      if (monthString === "9") return 8;
      if (monthString === "10") return 9;
      if (monthString === "11") return 10;
      if (monthString === "12") return 11;
    }
    if (monthFormat === "MM") {
      if (monthString === "01") return 0;
      if (monthString === "02") return 1;
      if (monthString === "03") return 2;
      if (monthString === "04") return 3;
      if (monthString === "05") return 4;
      if (monthString === "06") return 5;
      if (monthString === "07") return 6;
      if (monthString === "08") return 7;
      if (monthString === "09") return 8;
      if (monthString === "10") return 9;
      if (monthString === "11") return 10;
      if (monthString === "12") return 11;
    }
    if (monthFormat === "MMM") {
      if (monthString === "Jan") return 0;
      if (monthString === "Feb") return 1;
      if (monthString === "Mar") return 2;
      if (monthString === "Apr") return 3;
      if (monthString === "May") return 4;
      if (monthString === "Jun") return 5;
      if (monthString === "Jul") return 6;
      if (monthString === "Aug") return 7;
      if (monthString === "Sep") return 8;
      if (monthString === "Oct") return 9;
      if (monthString === "Nov") return 10;
      if (monthString === "Dec") return 11;
    }
    if (monthFormat === "MMMM") {
      if (monthString === "January") return 0;
      if (monthString === "February") return 1;
      if (monthString === "March") return 2;
      if (monthString === "April") return 3;
      if (monthString === "May") return 4;
      if (monthString === "June") return 5;
      if (monthString === "July") return 6;
      if (monthString === "August") return 7;
      if (monthString === "September") return 8;
      if (monthString === "October") return 9;
      if (monthString === "November") return 10;
      if (monthString === "December") return 11;
    }

    return null;
  };

  const getDayByFormat = (monthString, monthFormat)=>{
    if (Number.isNaN(monthString) || Number(monthString) < 1 || Number(monthString) > 31) return null;

    return Number(monthString);
  };

  return new Date(
    Date.UTC(
      getDatePartByFormat(dateString, dateStringFormat, yearFormatRegEx, getYearByFormat),
      getDatePartByFormat(dateString, dateStringFormat, monthFormatRegEx, getMonthIndexByFormat),
      getDatePartByFormat(dateString, dateStringFormat, dayFormatRegEx, getDayByFormat)
    )
  );
};

export const convertDateToFullLocaleDateString = date=>{
  return `${getMonthFromNumber(date.getUTCMonth())} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};
