if (sessionStorage.getItem('status') == "loggedIn") {
  var div = document.getElementById('navbar') 
  div.innerHTML += "<a href='http://localhost:3000/"+sessionStorage.user+"' id='userLink'><i class='fa fa-fw fa-user'></i>"+sessionStorage.user.toUpperCase()+"</a>" 
  div.innerHTML += "<a href='http://localhost:3000/"+sessionStorage.user+"/styles' id='userStyles'><i class='fa fa-pencil'></i> MIS ESTILOS</a>"
  div.innerHTML += "<a href='http://localhost:3000/"+sessionStorage.user+"/favoritos' id='userFavoritos'><i class='fa fa-fw fa-star'></i>FAVORITOS</a>"
}
else{
  window.location.replace("http://localhost:3000/")
}

var logoutElement = document.getElementById('logoutLink');
logoutElement.addEventListener('click', logout);

function logout(){
  sessionStorage.clear()
  window.location.replace("http://localhost:3000/")
}

