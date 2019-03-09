# Plaid Transactions to Google Sheets

Easily sync financial transactions using [Plaid](https://plaid.com) to Google Sheets. Heavily inspired by [emmafass's script](https://github.com/emmafass/plaid-google-scripts/blob/master/plaid-script.gs).

## Getting Started

1. Sign up for a developer account with [Plaid](https://plaid.com).
1. Create a new [Google Sheet](http://sheet.new) and open the Script editor. (Tools > Script editor)
1. Copy the contents of `Code.gs` into the empty script.
1. Create the script properties -- see below. (File > Project properties > Script properties)

## Usage

See the `run` and `batchRun` functions. The `run` function is designed to be triggered daily. 

## Script Properties

Property name | Value
------------ | -------------
access_token | **Required.** Access token from Plaid
client_id | **Required.** Client id from Plaid
secret | **Required.** Secret key from Plaid
sheet | **Required.** Name of the sheet (tab) in the Google Spreadsheet.
count | Number of transactions to return (default: 500)
