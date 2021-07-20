export const throwException = err =>{
  //Build an exception to throw
  let exception = {};
  let errorMsg = null;

  //If this is a Javascript exception
  if (err instanceof Error) {
    errorMsg = err.message;

    exception.name = err.name
    if (err.description === 0 || err.description) exception.description = err.description;
    if (err.number === 0 || err.number) exception.number = err.number;
    if (err.fileName === 0 || err.fileName) exception.fileName = err.fileName;
    if (err.lineNumber === 0 || err.lineNumber) exception.lineNumber = err.lineNumber;
    if (err.columnNumber === 0 || err.columnNumber) exception.columnNumber = err.columnNumber;
    if (err.stack === 0 || err.stack) exception.stack = err.stack;
  }
  else if (typeof err === "object") {
    if (err.message) {
      errorMsg = err.message;
      delete err.message;
    }
    exception = {
      ...exception,
      ...err,
    }
  }
  else if (typeof err === "string") {
    errorMsg = err;
  }

  //Log the original error, for investigation
  console.error(err);

  //Send a prettified version of the error to the screen
  const exceptionMsg = `${errorMsg}\r\n${Object.entries(exception).length ? Object.entries(exception).map(([key, value])=>`  + ${key}: ${value}\r\n`).join("") : ''}\r\nThe application failed.`;
  window.alert(exceptionMsg);

  //Throw the original error
  throw err;
}
