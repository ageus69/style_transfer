document.getElementById("message").style.display = "none";
document.getElementById("saveStyle").style.display = "none";
document.getElementById("nameStyle").style.display = "none";

var process = []

var canvas = document.getElementById("canvas");
var canvas2=document.getElementById("canvas2");
var divRes = document.getElementById("canvas3");;

var input = document.getElementById('input');
var input2 = document.getElementById('input2');

var sendBtn = document.getElementById('sendImg');
var saveBtn = document.getElementById('saveStyle'); 
var resetBtn = document.getElementById('reset');

var img = new Image();
var img2 = new Image();
var imageR = new Image();

var hasImage = false;
var hasImage2 = false;

var imgExt = ''
var imgExt2 = ''

var ctx = canvas.getContext("2d");
var ctx2 = canvas2.getContext("2d");
var ctxR = divRes.getContext('2d');

input.addEventListener('change', handleFiles);
input2.addEventListener('change', handleFiles2);
sendBtn.addEventListener('click', sendImg);
saveBtn.addEventListener('click', saveStyle);
resetBtn.addEventListener('click', resetImageBoard);

var json
var socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
var echoSocketUrl = socketProtocol + '//' + 'localhost:3001' + `/${sessionStorage.user}/process/`
socket = new WebSocket(echoSocketUrl);
socket.onmessage = e => {
  var data = JSON.parse(e.data)
  if(data['type'] == 'res') {
    imageR = new Image();
    imageR.onload = function() { ctxR.drawImage(imageR,0,0,250,250); }
    imageR.src = data['img']; 
    $('#message').hide(); 
    $('#learningRate').hide();
    $('#contenido').show(); 
    $('#sendImg').hide();
    $('#epochs').hide();
    $('#saveStyle').show(); 
    $('#nameStyle').show(); 
    socket.close()
  }
  else {
    console.log(data)
    document.getElementById('progressSpan').innerHTML = data['body']
  }   
} 


function resetImageBoard() {
  ctx.clearRect(0, 0, 250, 250);
  ctx2.clearRect(0, 0, 250, 250);
  ctxR.clearRect(0, 0, 250, 250);

  hasImage = false;
  hasImage2 = false;

  delete img, img2, imageR;

  document.getElementById('sendImg').style.display = "initial";
  document.getElementById('epochs').style.display = "initial";
  document.getElementById('saveStyle').style.display = "none" ;
  document.getElementById('nameStyle').style.display = "none" ;
  document.getElementById("nameStyle").value = '';
  document.getElementById('epochs').value = '';
}

// Fuction to save all your 3 images in a database with you user relationated
function saveStyle() {
  if(document.getElementById('nameStyle').value == '') {
    console.log('has no name');
    return;
  }
  checkIfStyleExist();
}

function checkIfStyleExist() {
  jQuery.ajax({
    url:'http://localhost:3000/'+sessionStorage.userid+'/style/'+document.getElementById('nameStyle').value+'',
    type:'get',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    success: function(res) {
      console.log(res)
      if(res["type"] == "error") {
        alert(res.message)   
      }
      else {
        // If do not exist, send json to IMAGE SERVER to save
        sendJsonToImageServerForSavingStyle()
      } 
    }
  })
}

function sendJsonToImageServerForSavingStyle() {
  // Firts: convert the images in data to send
  img3 = divRes.toDataURL();
  img3 = img3.replace(/^data:image\/png;base64,/, "");
  var json = {
    'ext':imgExt,
    'img':img,
    'ext2':imgExt2,
    'img2':img2,
    'img3':img3
  }
  var jsonMysql = {
    'user_id':sessionStorage.userid,
    'stylename':document.getElementById('nameStyle').value,
    'learningRate':document.getElementById('learningRate').value,
    'epochs':document.getElementById('epochs').value
  }
  // Storage in image server
  jQuery.ajax({
    url:'http://localhost:3001/'+sessionStorage.user+'/'+document.getElementById('nameStyle').value+'/save',
    type:'post',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    data: JSON.stringify(json),
    success: function(res) {
      alert(res.message)
    }
  });
  // Storage in mysql database style
  jQuery.ajax({
    url:'http://localhost:3000/'+sessionStorage.user+'/'+document.getElementById('nameStyle').value+'/save',
    type:'post',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    data: JSON.stringify(jsonMysql),
    success: function(res) {
      alert(res.message)
    }
  });
}

// When you click the send images button YOU SEND 2 pictures to the image server
// and the server process the images returning a result image which you could save
function sendImg(e) {
  
  if(document.getElementById('epochs').value == '') {
    alert('Inserte un numero de epocas')
    return
  }


  if(document.getElementById('learningRate').value == '') {
    alert('Inserte un learningRate')
    return
  }

  if(!hasImage || !hasImage2) {
    alert('Agrege las images')
    return
  }

  img = canvas.toDataURL();
  img = img.replace(/^data:image\/png;base64,/, "");
  img2 = canvas2.toDataURL();
  img2 = img2.replace(/^data:image\/png;base64,/, "");

  document.getElementById('epochsSpan').innerHTML = document.getElementById('epochs').value



  json = {
    'type':'first',
    "ext":imgExt,
    "img":img,
    "ext2":imgExt2,
    "img2":img2,
    "epochs":parseInt(document.getElementById('epochs').value),
    'lr':parseFloat(document.getElementById('learningRate').value)  
  };

  socket.send(JSON.stringify(json))
  //$('#contenido').hide();
  $('#message').show(); 
  
}

// Function for display the first image you upoad to the input field
// in both content image and style image
function handleFiles(e) {
  hasImage = true;
  img = new Image();
  img.onload = function() { ctx.drawImage(img,0,0,250,250); }
  imgExt = e.target.files[0].name.split('.').pop();
  img.src = URL.createObjectURL(e.target.files[0]); 
}

function handleFiles2(e) {
  hasImage2 = true;
  img2 = new Image(); 
  img2.onload = function() { ctx2.drawImage(img2,0,0,250,250); }
  imgExt2 = e.target.files[0].name.split('.').pop();
  img2.src = URL.createObjectURL(e.target.files[0]); 
}