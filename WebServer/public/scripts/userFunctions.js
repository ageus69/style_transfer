function createUser() {
  var user = document.getElementById('username').value;
  var emai = document.getElementById('email').value;
  var pass = document.getElementById('pass').value;

  if(username.length < 4 || username.length > 10) {
    alert('Ingrese un username de entre 4 a 10 caracteres');
    return
  }

  if(pass.length < 4 || pass.length > 10) {
    alert('Ingrese una contrasenia de entre 4 a 10 caracteres');
    return
  }

  var json={
    "user":user,
    "email":emai,
    "pass":pass
  };
  // send data
  jQuery.ajax({
    url: "/createUser",
    type: "post",
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(json),
    success: function(res) {
      console.log(res)
      if(res.type == 'error') {
        if(res.raw["errno"] == 1062) {
          alert("Usuario o correo ya existente")
        }
        else {
          alert("Ha ocurrido un error, intentelo mas tarde")
        }
      }
      else {
        alert("Registro registrado correctamente")
      } 
    }
  })
}

function loginUser() {
  var user = document.getElementById('username').value;
  var pass = document.getElementById('pass').value;

  var json={
    "user":user,
    "pass":pass,
  };
  // send data
  jQuery.ajax({
    url: "/loginUser",
    type: "post",
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(json),
    success: function(res) {
      if(res.type == 'error') { 
        alert('Ha ocurrido un error = ' + res.message)
      }
      else {
        if(res.raw == '') { 
          alert("Wrong credentials") 
        }
        else {
          sessionStorage.setItem('status','loggedIn')
          sessionStorage.setItem('userid', res.raw.id) 
          sessionStorage.setItem('user', res.raw.user)
          sessionStorage.setItem('email', res.raw.email)
          window.location.replace("http://localhost:3000/"+res.raw.user+"")
        }
      } 
    }
  })
}

