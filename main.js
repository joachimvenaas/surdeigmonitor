const mysql =     require('mysql')
const fetch =     require('node-fetch')
const http =      require('http')
const axios =     require('axios')
const cheerio =   require('cheerio')
const fs =        require('fs')
require('dotenv').config()

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

var debuglevel = 0
var timeBetweenScans = 10*60*1000 // ms (10 minutter)

var connection = mysql.createConnection({
  host: process.env.DBhostname,
  user: process.env.DBusername,
  password: process.env.DBpassword,
  database: process.env.DBdatabase
})
// test
/* DB SCHEMA
 * id (int)
 * time (date)
 * distance (int)
 * feed (bool)
 * surdeig (int)
 * vann (int)
 * mel (int)
 *
*/

// OPPSTART
debug(`Starter surdeigsmonitor`)
connection.connect()
measureDistanceInterval()

var lastRead

/*---------------------------------------------------------------------------------------------------------------------------------------
DELTE FUNKSJONER
---------------------------------------------------------------------------------------------------------------------------------------*/
function debug(msg, level=0){
  if (level <= debuglevel)    console.log(`${new Date().toLocaleString('en-GB', { hour12: false })} \t ${msg}`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/*---------------------------------------------------------------------------------------------------------------------------------------
DATA INNSAMLING
---------------------------------------------------------------------------------------------------------------------------------------*/
async function measureFromSound(){
  var distance = 0
  distance = (Math.random()*75).toFixed(0)
  debug(`Distance: ${distance}`)
  return distance
}

async function measureDistanceInterval(){
  debug("Measuring")
  
  var result = await measureFromSound()

  await insertIntoDB(result)
  lastRead = new Date()

  await sleep(timeBetweenScans)
  await measureDistanceInterval()
}

async function feedingTime(surdeig, vann, mel){ // Må trigges fra webserver
  console.log("Matetid!", surdeig, vann, mel)

  await insertIntoDB(0, surdeig, vann, mel)
}

async function insertIntoDB(distance, surdeig=0, vann=0, mel=0){
  var feed = false
  if (surdeig) feed=1
  connection.query(`INSERT INTO ${process.env.DBtable} (distance, feed, surdeig, vann, mel) VALUES ( "${distance}", "${feed}", "${surdeig}", "${vann}", "${mel}")`, function (error, results, fields){
    if (error) throw error
  })
  return
}

/*---------------------------------------------------------------------------------------------------------------------------------------
WEBSERVER
---------------------------------------------------------------------------------------------------------------------------------------*/
http.createServer(function (req, res){
  if (req.url == '/'){
    fs.readFile('index.html', function(err, data){
      res.writeHead(200, { "Content-Type": "text/html" })
      res.write(data)
      res.end()
    })
    
  } else if (req.url == '/api.json') {
    res.writeHead(200, { "Content-Type": "application/json" })

    var labels = [], data1 = [], feed = []
    connection.query(`SELECT * FROM surdeig ORDER BY id ASC`, function (error, results, fields) {
      if (error) throw error
      results.forEach(element => {
        data1.push({ x: element.time, y: element.distance })
        feed.push({ x: element.time, y: element.feed })
      })
      var json = {
        'lastRead': lastRead,
        'data1': data1,
        'feed': feed
      }
      res.end(JSON.stringify(json))
    })
  } else if (req.url == '/postfeed' && req.method == 'POST') {
    var body = ''
    req.on('data', function(data) { body += data })
    req.on('end', function() {
      var surdeig = body.split('&')[0].replace("surdeig=","")
      var vann =  body.split('&')[1].replace("vann=","")
      var mel =  body.split('&')[2].replace("mel=","")

      feedingTime(surdeig, vann, mel)
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end('Data received')
    })

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
