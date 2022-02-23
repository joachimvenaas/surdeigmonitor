function clearField(form){
  if(document.getElementById(form).value.search(/[a-z]/gi) != -1){
    document.getElementById(form).value = ''
    document.getElementById(form).style.fontStyle = 'normal'
    document.getElementById(form).style.color = 'black'
  }
}

function feeeed(){
  var error = 0
  var surdeig = document.getElementById('surdeig').value
  var vann = document.getElementById('vann').value
  var mel = document.getElementById('mel').value
  if (isNaN(surdeig) || surdeig < 1 || surdeig > 300) error++
  if (isNaN(vann) || vann < 1 || vann > 300) error++
  if (isNaN(mel) || mel < 1 || mel > 300) error++

  if(error > 0){
    alert("FALSE values")
  } else {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function() {
      // mjææ
    }
    xhttp.open("POST", "/postfeed")
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`surdeig=${surdeig}&vann=${vann}&mel=${mel}`)

    document.getElementById('surdeig').value = 'Surdeig (gram)'
    document.getElementById('surdeig').disabled = true
    document.getElementById('surdeig').style.fontStyle = 'italic'
    document.getElementById('surdeig').style.color = 'gray'
    document.getElementById('vann').value = 'Vann (gram)'
    document.getElementById('vann').disabled = true
    document.getElementById('vann').style.fontStyle = 'italic'
    document.getElementById('vann').style.color = 'gray'
    document.getElementById('mel').value = 'Mel (gram)'
    document.getElementById('mel').disabled = true
    document.getElementById('mel').style.fontStyle = 'italic'
    document.getElementById('mel').style.color = 'gray'
    document.getElementById('feedSubmit').disabled = true
  }
  return false
}

function start(){
  // Load values
  var xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var myArr = JSON.parse(this.responseText)
          document.getElementById('lastRead').value = myArr['lastRead']
      }
  }
  xmlhttp.open("GET", 'api.json', true)
  xmlhttp.send()

  // Countdown to next read
  var x = setInterval(() => {
    var currentDate = new Date()
    var lastRead = new Date(document.getElementById('lastRead').value)
    var futureDate = new Date(lastRead.getTime() + 10*60000)
  
    var preSeconds = (futureDate-currentDate)/1000
    var minutes = Math.floor(preSeconds/60)
    var seconds     = Math.floor((futureDate-currentDate)/1000-(minutes*60))
    if(seconds <= 9){
      seconds   = `0${seconds}`
    }
  
    document.getElementById('nextRead').innerHTML = `${minutes}:${seconds}`

    if(preSeconds == 0){
      clearInterval(x)
      document.getElementById('nextRead').innerHTML = `UTDATERT`
    } 
  }, 500)
}