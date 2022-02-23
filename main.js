const mysql = require('mysql')
const fetch = require('node-fetch')
const http = require('http')
const axios = require('axios')
const cheerio = require('cheerio')
const { end } = require('cheerio/lib/api/traversing')
const fs = require('fs')
require('dotenv').config()

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

debuglevel = 0

var connection = mysql.createConnection({
  host: process.env.DBhostname,
  user: process.env.DBusername,
  password: process.env.DBpassword,
  database: process.env.DBdatabase
})


/* DB SCHEMA
 * id (int)
 * time (date)
 * length (int)
 * feed (bool)
 *
*/

// OPPSTART
debug(`Starter surdeigsmonitor`)
connection.connect()

/*---------------------------------------------------------------------------------------------------------------------------------------
DELTE FUNKSJONER
---------------------------------------------------------------------------------------------------------------------------------------*/
function debug(msg, level){
  if (!level)                 console.log(`${new Date().toLocaleString('en-GB', { hour12: false })} \t ${msg}`)
  if (level <= debuglevel)    console.log(`${new Date().toLocaleString('en-GB', { hour12: false })} \t ${msg}`)
  lastDebug = msg
}


/*---------------------------------------------------------------------------------------------------------------------------------------
DATA INNSAMLING
---------------------------------------------------------------------------------------------------------------------------------------*/
async function insertIntoDB(length, feed){
  connection.query(`INSERT INTO ${process.env.DBtable} (length, feed) VALUES ( "${length}", "${feed}")`, function (error, results, fields){
    if (error) throw error
  })
  return
}


/*---------------------------------------------------------------------------------------------------------------------------------------
WEBSERVER
---------------------------------------------------------------------------------------------------------------------------------------*/
http.createServer(function (req, res){
  if (req.url == '/'){
    res.writeHead(200)
    res.end(`<html>
      <head>
        <title>Surdeigsmonitor</title>
        <meta charset="UTF-8">
        <meta name="theme-color" content="#4ac282">
        <script src="https://www.kryogenix.org/code/browser/sorttable/sorttable.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="script.js"></script>
        <link rel="stylesheet" href="style.css">
      </head>
      <body onLoad="clickSort();">
      <div>Start</div>
      </body>
    </html>`)
    
  } else if (req.url == '/style.css') {
    fs.readFile('style.css', function(err, data){
      res.writeHead(200, { "Content-Type": "text/css" })
      res.write(data)
      res.end()
      })
  } else if (req.url == '/script.js') {
    fs.readFile('script.js', function(err, data){
      res.writeHead(200, { "Content-Type": "text/javascript" })
      res.write(data)
      res.end()
    })
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({error:"404: Resource not found"}))
  }
}).listen(process.env.WSport)
