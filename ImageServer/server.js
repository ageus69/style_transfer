const express     = require('express')
const fs          = require('fs')
const {spawn}     = require('child_process')
const path        = require('path')

var expressWs = require('express-ws');
var expressWs = expressWs(express());
var app = expressWs.app;

var clientes =  []


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

app.post('/:user/process', (req, res) => {
  console.log('new process')
  
  var epochs = req.body.epochs;
  var contentFileName = (req.params.user + 'tmp1.' + req.body.ext);
  var styleFileName = (req.params.user + 'tmp2.' + req.body.ext2);
  var resultFileName = (req.params.user + 'tmp3.' + req.body.ext);

  fs.writeFile(contentFileName, req.body.img, 'base64', function(err) {});
  fs.writeFile(styleFileName, req.body.img2, 'base64', function(err) {});

  const python = spawn('python', ['script1.py', contentFileName, styleFileName, resultFileName, epochs]);

  python.stdout.on('data', (data) => {
    clientes.find(element => element[1] == req.params.user)[0].send(data.toString())
  });

  python.on('close', (code) => {
    console.log(`child porcess ${req.params.user} close all stdo with code ${code}`);
    fs.readFile(resultFileName, function(err, data) {
      fs.unlinkSync(contentFileName)
      fs.unlinkSync(styleFileName)
      fs.unlinkSync(resultFileName)
      var dataX = "data:image/"+req.body.ext+";base64," + Buffer.from(data).toString('base64')
      var json={
        "img":dataX
      };
      clientes.find(element => element[1] == req.params.user)[0].close()
      delete clientes[clientes.findIndex(element => element[1] == req.params.user)]
      console.log(clientes.length)
      res.send(JSON.stringify(json))
    })
  });
});

app.post('/:user/:style/save', (req, res) => {
  // Storage style images in images/:user/:stylename {content, style, result}
  // Directory
  var dir = './images/'+req.params.user+'/'+req.params.style+'';
  // Make directory if do not exist
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive: true});
  }
  // Write images
  var img1 = dir + '/content.' + req.body.ext; 
  var img2 = dir + '/style.' + req.body.ext2; 
  var img3 = dir + '/result.' + req.body.ext; 
  fs.writeFile(img1, req.body.img, 'base64', function(err) {}); 
  fs.writeFile(img2, req.body.img2, 'base64', function(err) {}); 
  fs.writeFile(img3, req.body.img3, 'base64', function(err) {});
});

app.get('/:user/styles', (req, res) => {
  var dir = './images/'+req.params.user;
 
  // Get all stylefoldernames into folders and extentions of each image
  const folderNames = fs.readdirSync(dir)
    .filter(file => fs.statSync(path.join(dir, file)).isDirectory())
    .map(dirName => [
      dirName, // directory
      fs.readdirSync(path.join(dir, dirName)) // 3 image names
      .map(imageName => [
        imageName,
        "data:image/"+imageName.split('.').pop()+";base64," + fs.readFileSync(path.join(path.join(dir, dirName), imageName), {encoding: 'base64'})
      ]) 
    ])
  res.send(JSON.stringify(folderNames))
});


app.delete('/:user/:style', (req, res) => {
  //var dir = './images/'+req.params.user+'/'+req.params.style+'';
  var dir = path.join('images', path.join(req.params.user, req.params.style))
  fs.rmdirSync(dir, { recursive: true })
  res.send({'res' : 'Images ledeteadas'})
})

app.listen(3001, () => {
  console.log('image server listening on *:3001')
})

/*
app.ws('/:user', (ws, req) => {
  var epochs = req.body.epochs;
  var contentFileName = (req.params.user + 'tmp1.' + req.body.ext);
  var styleFileName = (req.params.user + 'tmp2.' + req.body.ext2);
  var resultFileName = (req.params.user + 'tmp3.' + req.body.ext);

  fs.writeFile(contentFileName, req.body.img, 'base64', function(err) {});
  fs.writeFile(styleFileName, req.body.img2, 'base64', function(err) {});

  const python = spawn('python', ['script1.py', contentFileName, styleFileName, resultFileName, epochs]);

  python.stdout.on('data', (data) => {
    //clientes.find(element => element[1] == req.params.user)[0].send(data.toString())
    ws.send(data.toString())
  });

  python.on('close', (code) => {
    console.log(`child porcess ${req.params.user} close all stdo with code ${code}`);
    fs.readFile(resultFileName, function(err, data) {
      fs.unlinkSync(contentFileName)
      fs.unlinkSync(styleFileName)
      fs.unlinkSync(resultFileName)
      var dataX = "data:image/"+req.body.ext+";base64," + Buffer.from(data).toString('base64')
      var json={
        "img":dataX
      };
      clientes.find(element => element[1] == req.params.user)[0].close()
      delete clientes[clientes.findIndex(element => element[1] == req.params.user)]
      console.log(clientes.length)
      res.send(JSON.stringify(json))
    })
  });
 */
 
  /* clientes.push([ws, `${req.params.user}`])
  console.log(`${req.params.user} connected :)`)

  ws.on('message', msg => {
    ws.send(msg)
  })
  ws.on('close', () => {
    console.log(`${req.params.user} desconnected :(`)
  })
});*/
app.ws('/:user/process', (ws, req) => {
  ws.on('message', msg => {
    var data = JSON.parse(msg)
    if(data['type'] == 'first') {

      console.log('hola')

      var epochs = data.epochs;
      var lr = data.lr;
      var contentFileName = (req.params.user + 'tmp1.' + data.ext);
      var styleFileName = (req.params.user + 'tmp2.' + data.ext2);
      var resultFileName = (req.params.user + 'tmp3.' + data.ext);

      fs.writeFile(contentFileName, data.img, 'base64', function(err) {});
      fs.writeFile(styleFileName, data.img2, 'base64', function(err) {});

      const python = spawn('python', ['script1.py', contentFileName, styleFileName, resultFileName, epochs, lr]);

      python.stdout.on('data', (data) => {
        ws.send(JSON.stringify({
          'type':'notres',
          'body': data.toString()
        }))
      });

      python.on('close', (code) => {
        console.log(`child porcess ${req.params.user} close all stdo with code ${code}`);
        fs.readFile(resultFileName, function(err, data) {
          fs.unlinkSync(contentFileName)
          fs.unlinkSync(styleFileName)
          fs.unlinkSync(resultFileName)
          var dataX = "data:image/"+data.ext+";base64," + Buffer.from(data).toString('base64')
          var json={ 'type':'res', 'img':dataX };
          ws.send(JSON.stringify(json))
        })
      });

    }

    else{

    }

  })
})
