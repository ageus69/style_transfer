const { query, json } = require('express');
var express = require('express');
var mysql = require('mysql')
var app = express();

// environments
app.use(express.static(__dirname + '/public'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// define routes here..
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});
app.get('/reg', function(req, res) {
  res.sendFile(__dirname + '/public/views/register.html');
});
app.get('/log', function(req, res) {
  res.sendFile(__dirname + '/public/views/login.html');
});
app.get('/:user/styles', function(req, res) {
  res.sendFile(__dirname + '/public/views/userStyles.html');
});
app.get('/:user/favoritos', function(req, res) {
  res.sendFile(__dirname + '/public/views/userFavoritos.html');
});
app.get('/:user', (req, res) => {
  res.sendFile(__dirname + '/public/views/dashboard.html');
});

/* Create a user record in mysql database */
app.post('/createUser', async (req, res) => {
  let result = await consulta('INSERT INTO users (user, email, pass, verificated) VALUES ("'+req.body.user+'", "'+req.body.email+'", "'+req.body.pass+'", 0)')
  res.send(result)
});

/* Sees if in mysql database exist some user and return his data */
app.post('/loginUser', async (req, res) => { 
  let result = await consulta('SELECT id, email, user FROM users WHERE pass="'+req.body.pass+'" AND (user="'+req.body.user+'" OR email="'+req.body.user+'")')
  result.raw = result.raw[0]
  res.send(result)
});

/* Sees if the style exist for a given user */
app.get('/:id/style/:style', async (req, res) => {
  result = await consulta('SELECT id FROM estilos WHERE id_user='+req.params.id+' AND nombre="'+req.params.style+'"')
  if (result.raw != '') {
    result.type = 'error'
    result.message = 'Style already exist for you'
    res.send(result)
  }
  else {
    result.message = 'Style does not exist'
    res.send(result)
  }
});
/* Save style data in mysql database */
app.post('/:user/:style/save', async (req, res) => {
  result = await consulta('INSERT INTO estilos (nombre, id_user, no_likes, learningRate, epochs) VALUES ("'+req.params.style+'", '+req.body.user_id+', 0, '+req.body.learningRate+', '+req.body.epochs+')')
  if (result.type != 'error') {
    result.message = 'Style recorded successfully'
  }
  res.send(result)
});
/* Return all style names of a given user */
app.get('/:user/getStyles', async (req, res) => {
  result = await consulta('SELECT nombre, epochs, learningRate FROM estilos Where id_user = '+req.params.user+'')
  res.send(result)
})

app.delete('/:user/:style', async (req, res) => {
  result = await consulta('DELETE FROM estilos WHERE nombre = "'+req.params.style+'"')
  res.send(JSON.stringify(result))
})

let consulta = async (sql) => {
  /* Connection constant */
  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'modular'
  });

  var dataJson = {}

  let foo = await new Promise((resolve) => db.connect(function(err) {  
    if (err) {
      dataJson.raw = JSON.stringify(err)
      dataJson.type = 'error'
      dataJson.message = 'Error en la coneccion'
      resolve(dataJson)
    }
    else {
      db.query(sql, function (err, result) {
        if (err) {
          dataJson.raw = err
          dataJson.type = 'error'
          dataJson.message = 'Error en la consulta'
          resolve(dataJson)
        }
        else {
          if(Object.entries(result).length === 0) {
            dataJson.raw = ''
          }
          else {
            dataJson.raw = result
          }
          dataJson.type = 'success'
          dataJson.message = 'Consulta exitosa'
          resolve(dataJson)
        }
      })
    } 
  })) 
  console.log(dataJson)
  db.end(); 
  return(dataJson)
}

var server = app.listen(3000, function () {
  console.log('Image server is running in port 3000');
});