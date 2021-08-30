window.onload = function () {
  /* Get all style names when the page is loaded */
  jQuery.ajax({
    url:'http://localhost:3000/'+sessionStorage.userid+'/getStyles',
    type:'get',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    success: function(res) {
      // TODO
      res.raw.forEach(element => {
        $('#navbar').after(
          `
          <div class='card-box' id="`+element.nombre+`Card">
            <div class='row'>
              <div class='card'>
                <label>Style Name: `+element.nombre+`</label>
                <label>Epochs: `+element.epochs+`</label>
                <label>Learning Rate: `+element.learningRate+`</label>
              </div>
            </div>
            <div class='row'>
              <div class='card'>
                <label class='label'>Content image</label>   
                <canvas id='cC`+element.nombre+`' width=250 height=250 style='border: solid 1px;'></canvas>
              </div>
              <div class='card'>
                <label class='label'>Style image</label>
                <canvas id='cS`+element.nombre+`' width=250 height=250 style='border: solid 1px;'></canvas>   
              </div>
              <div class='card'>
                <label class='label'>Result</label>
                <canvas id='cR`+element.nombre+`' width=250 height=250 style='border: solid 1px;'></canvas>   
              </div>
            </div>
            <div class="row">
              <div class="card">
                <div class="controls">
                  <button class="lowControl redBtn" type="button" id="`+element.nombre+`BtnErase">Borrar</button>
                  <button class="lowControl yellow" type="button" id="`+element.nombre+`BtnAdd">Agregar a favorito</button>
                </div>
              </div>
            </div>
          </div>
          `
        )
        var btn = document.getElementById(element.nombre+'BtnErase')
        btn.addEventListener('click', function(){
          matarStyle(element.nombre)
        })
        var btn2 = document.getElementById(element.nombre+'BtnAdd')
        btn2.addEventListener('click', function(){
          addFavorite(element.nombre)
        })
      })
      
    }
  })
}

function matarStyle(styleName) {
  //console.log(sessionStorage.user) AND styleName
  // Erase files from localhost:3001
  jQuery.ajax({
    type: 'delete',
    url: 'http://localhost:3000/'+sessionStorage.user+'/'+styleName+'',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    success: function(res) {
      console.log(res)
    }
  })
  // Erase record user_style localhost:3000
  jQuery.ajax({
    type: 'delete',
    url: 'http://localhost:3001/'+sessionStorage.user+'/'+styleName+'',
    dataType:'json',
    contentType:'application/json; charset=utf-8',
    success: function(res) {
      console.log(res)
      //delete cardbox
      $(`#${styleName}Card`).remove()
    }
  })
}

function addFavorite(styleName) {
  console.log('ADD')
  console.log(styleName)
  console.log(sessionStorage.user)
}

/* Get all images from all styles of given user */
jQuery.ajax({
  url:'http://localhost:3001/'+sessionStorage.user+'/styles',
  type:'get',
  dataType:'json',
  contentType:'application/json; charset=utf-8',
  success: function(res) {
    res.map(function (row) { 
      var canvasContent =  document.getElementById('cC'+row[0])
      var canvasStyle =  document.getElementById('cS'+row[0])
      var canvasResult =  document.getElementById('cR'+row[0])

      var contextContent = canvasContent.getContext('2d')
      var contextStyle = canvasStyle.getContext('2d')
      var contextResult = canvasResult.getContext('2d')

      var imageContent = new Image();
      var imageStyle = new Image();
      var imageResult = new Image();

      imageContent.onload = function() { contextContent.drawImage(imageContent,0,0,250,250); }
      imageStyle.onload = function() { contextStyle.drawImage(imageStyle,0,0,250,250); }
      imageResult.onload = function() { contextResult.drawImage(imageResult,0,0,250,250); }

      imageContent.src = row[1][0][1];
      imageStyle.src = row[1][2][1];
      imageResult.src = row[1][1][1];
    })
  }
})