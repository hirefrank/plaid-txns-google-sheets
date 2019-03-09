/***********************************************************************************
 * PLAID TRANSACTIONS TO GOOGLE SHEETS
 * ---
 * Author: Frank Harris (frank@hirefrank.com)
 * Initial Date: Mar 9, 2019
 * MIT License
 *
 * https://github.com/hirefrank/plaid-txns-google-sheets/blob/master/README.md
 ***********************************************************************************/

var SHEET = PropertiesService.getScriptProperties().getProperty('sheet');

/**
 * Main function that grabs transactions daily
 */

function run() {
  // days in reverse to scan for transactions
  // pending transactions could take up to 5 days to clear
  const DAYS_IN_REVERSE = PropertiesService.getScriptProperties().getProperty('days_in_reverse') || 6;
   
  // create date ranges
  var start_date = new Date();
  var end_date = new Date();
  start_date.setDate(start_date.getDate() - DAYS_IN_REVERSE);
  
  getTransactionHistory(formatDate(start_date), formatDate(end_date));
}

/**
 * Grabs transactions for specified date range
 */

function batchRun() {
  var start_date = '2019-01-01';
  var end_date = '2019-04-05';
  getTransactionHistory(start_date, end_date);
}

/**
 * Get the Transactions via the Plaid API
 */

function getTransactionHistory(start_date, end_date) { 
  const ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('access_token');
  const CLIENT_ID = PropertiesService.getScriptProperties().getProperty('client_id');
  const SECRET = PropertiesService.getScriptProperties().getProperty('secret');
  const COUNT = PropertiesService.getScriptProperties().getProperty('count') || 500;

  // headers are a parameter plaid requires for the post request
  // plaid takes a contentType parameter
  // google app script takes a content-type parameter
  var headers = {                                         
    'contentType': 'application/json',                                        
    'Content-Type': 'application/json',
  };
  
  // data is a parameter plaid requires for the post request
  // created via the plaid quickstart app (node)
  var data = { 
    'access_token': ACCESS_TOKEN,
    'client_id': CLIENT_ID,                                
    'secret': SECRET,                                
    'start_date': start_date,                                                
    'end_date': end_date,
    'options': {count: COUNT, offset: 0,}
  };
  
  // pass in the necessary headers
  // pass the payload as a json object
  var parameters = {                                                                                                             
    'headers': headers,            
    'payload': JSON.stringify(data),                            
    'method': 'post',
    'muteHttpExceptions': true,
  };
  
  // api host + endpoint
  var url = "https://development.plaid.com/transactions/get";
  var response = UrlFetchApp.fetch(url, parameters);
  
  // parse the response into a JSON object
  var json_data = JSON.parse(response);
  
  // get the transactions from the JSON
  var transactions = json_data.transactions;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET);
  var last_row = sheet.getLastRow();
  var txns_ids = getTransactionIds(sheet.getRange(2,7,last_row,1));
   
  // add each transaction as a new row in the sheet
  for (i in transactions){
    if (transactions[i].pending == false) {
      
      // transaction id doesn't match existing ids
      if (txns_ids.indexOf(transactions[i].transaction_id) == -1) {
        
        // will put each in the row's columns in order
        var row = [
          transactions[i].date,
          transactions[i].name,
          transactions[i].amount,
          transactions[i].iso_currency_code,
          transactions[i].category[0],
          transactions[i].transaction_type,
          transactions[i].transaction_id,
          transactions[i].account_id,
          transactions[i].amount < 0 ? 'true' : 'false'
        ]
          
        // added below the lowest row in the sheet
        sheet.appendRow(row);
      }
    }
  }
}

/**
 * Removes transactions from the spreadsheet
 */
     
function reset() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET);

  var last_row = sheet.getLastRow();
  sheet.getRange('2:' + last_row).activate();
  sheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});
};

/**
 * Returns transaction_ids
 */
        
function getTransactionIds(range) {
  var ids = [];
  
  var numRows = range.getNumRows();
  var numCols = range.getNumColumns();
        
  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {
      var cv = range.getCell(i,j).getValue();
      if (cv !== '') {
        ids.push(cv);
      }
    }
  }
  return ids;
};

/**
 * Left aligns all cells in the spreadsheet and sorts by date
 */
        
function cleanup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET);
  
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
  spreadsheet.getActiveRangeList().setHorizontalAlignment('left');
  spreadsheet.getRange('A:A').activate();
  spreadsheet.getActiveSheet().sort(1, false);
};
        
/**
 * Returns the date in a Plaid friendly format, e.g. YYYY-MM-DD
 */

function formatDate(date) {
  var d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}