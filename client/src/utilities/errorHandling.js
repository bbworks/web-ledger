export const throwError = (errorMsg, err, throwError=true, alert=true)=>{
  let error = {};

  //Build an Exception with a prettified version
  // of the error to the screen
  if (err instanceof Error) {
    error.message = err.message;
    error.name = err.name;
    if (err.description === 0 || err.description) error.description = err.description;
    if (err.number === 0 || err.number) error.number = err.number;
    if (err.fileName === 0 || err.fileName) error.fileName = err.fileName;
    if (err.lineNumber === 0 || err.lineNumber) error.lineNumber = err.lineNumber;
    if (err.columnNumber === 0 || err.columnNumber) error.columnNumber = err.columnNumber;
    if (err.stack === 0 || err.stack) error.stack = err.stack;

    error.title = `${errorMsg ? errorMsg+": " : ''}${error.message}`;
    error.text = `${error.title}\r\n${Object.entries(error).length ? Object.entries(error).map(([key, value])=>`  + ${key}: ${value}\r\n`).join('') : ''}`;
  }
  else if (err instanceof Response) {
    error.status = err.status;
    error.statusText = err.statusText;
    error.ok = err.ok;
    error.redirected = err.redirected;
    error.type = err.type;
    error.url = err.url;

    error.title = `${errorMsg ? errorMsg+": " : ''}${err.status} ${err.statusText}`;
    error.text = `${error.title}\r\n${Object.entries(error).length ? Object.entries(error).map(([key, value])=>`  + ${key}: ${value}\r\n`).join('') : ''}`;
  }
  else if (typeof err === "object") {
    error = {
      ...err,
      title: `${errorMsg ? errorMsg+": " : ''}${err.message}`,
    };
    error.text = error.title;
  }
  else if (typeof err === "string") {
    error.title = `${errorMsg ? errorMsg+": " : ''}${err}`;
    error.text = error.title;
  }

  if (throwError) {
    error.text += `\r\nThe application failed.`;
  }

  //Log the original error, for investigation
  console.error(error.title, error);

  //Alert the error to the screen
  if (alert) window.alert(error.text);

  //Throw the original error
  if (throwError) throw err;
}
