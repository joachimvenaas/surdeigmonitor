function clickSort(){
  document.getElementById("sortSale").click()
  document.getElementById("sortSale").click()
  document.getElementById("sortSale2").click()
  document.getElementById("sortSale2").click()
}
var toggle = 0
function hideFakes(){
  if(!toggle){
    document.querySelectorAll('tr').forEach( function (row) {
      if (row.textContent.includes('deleted') || row.textContent.includes('inactive'))  row.classList.add('hidden')
      document.getElementById('hideButton').value = 'Vis slettet/inaktiv'
    })
    toggle = 1
  } else {
    document.querySelectorAll('tr').forEach( function (row) {
      if (row.textContent.includes('deleted') || row.textContent.includes('inactive')) row.classList.remove('hidden')
      document.getElementById('hideButton').value = 'Skjul slettet/inaktiv'
    })
    toggle = 0
  }

}
function markRead() {
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    document.querySelectorAll(".new").forEach(el => el.classList.remove("new"))
  }
  xhttp.open("GET", "/markread")
  xhttp.send()
}

function loadFragmentInToElement(fragment_url, element_id) {
  var element = document.getElementById(element_id)
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", fragment_url)
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) element.innerHTML = xmlhttp.responseText.replace('-- ', '').replace('- ', '')
  }
  xmlhttp.send()
}

function forceUpdate(){
  const xhttp = new XMLHttpRequest()
  xhttp.onload = function() {
    document.getElementById('forceButton').value = 'Oppdaterer...'
    document.getElementById('forceButton').disabled = true
    document.getElementById('loading').style.visibility = 'visible'
    setInterval(function(){
      loadFragmentInToElement('/status', 'statusMsg')
    }, 200)
  }
  xhttp.open("GET", "/forceupdate")
  xhttp.send()
  setTimeout(function(){
    location.reload()
  },10000)
}