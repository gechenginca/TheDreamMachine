document.addEventListener("DOMContentLoaded", function() {
   var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false,
      color: 'black',
      lineWidth: 1
   };
   // get canvas element and create context
   var canvas  = document.getElementById('canvas');
   var context = canvas.getContext('2d');
   //var width   = window.innerWidth;
   //var height  = window.innerHeight;
   var width = canvas.offsetWidth;
   var height = canvas.offsetHeight;
   var socket  = io.connect();

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = function(e){mouse.click = true;};
   canvas.onmouseup = function(e){ mouse.click = false; };
   canvas.onmouseleave = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = (e.pageX - canvas.offsetLeft ) / width;
      mouse.pos.y = (e.pageY - canvas.offsetTop) / height;
      mouse.move = true;
   };

   // draw line received from server
   socket.on('draw_line', function (data) {
      var line = data.line;
      context.beginPath();
      var temp_x0 = (line[0].x * width);
      var temp_y0 = line[0].y * height;
      var temp_x1 = line[1].x * width;
      var temp_y1 = line[1].y * height;

      context.moveTo(temp_x0, temp_y0);
      context.lineTo(temp_x1, temp_y1);

      context.strokeStyle = line[2];
      context.lineWidth = line[3];

      context.stroke();
   });

   socket.on('clear', function(data) {
      context.clearRect(0, 0, canvas.width, canvas.height);
   });

   // main loop, running every 25ms
   // TODO run on listener mouse down, stop running on mouse up
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev, mouse.color, mouse.lineWidth ]});

         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }

   function clearCanvas() {
      var elem = document.createElement('div');
      elem.innerHTML = `
      <button class="clear">Clear</button>
      `;
      elem.querySelector('.clear').addEventListener('click', function() {
         context.clearRect(0, 0, canvas.width, canvas.height);
         socket.emit('clear', {});
      });
      document.getElementById("mid_canvas").append(elem);
   }

   function colors() {
      var elem = document.createElement('div');
      elem.innerHTML = `
      <button class="red">red</button>
      <button class="yellow">yellow</button>
      <button class="blue">blue</button>
      `;
      elem.querySelector('.red').addEventListener('click', function() {
         mouse.color = '#FB0106FF';
      });
      elem.querySelector('.yellow').addEventListener('click', function() {
         mouse.color = '#FEFE0AFF';
      });
      elem.querySelector('.blue').addEventListener('click', function() {
         mouse.color = '#0000FEFF';
      });
      document.getElementById("mid_canvas").append(elem);
   }

   function size() {
      var elem = document.createElement('div');
      elem.innerHTML = `
      <button class="small">small</button>
      <button class="medium">medium</button>
      <button class="large">large</button>
      `;
      elem.querySelector('.small').addEventListener('click', function() {
         mouse.lineWidth = 1;
      });
      elem.querySelector('.medium').addEventListener('click', function() {
         mouse.lineWidth = 5;
      });
      elem.querySelector('.large').addEventListener('click', function() {
         mouse.lineWidth = 10;
      });
      document.getElementById("mid_canvas").append(elem);
   }

   function eraser() {
      var elem = document.createElement('div');
      elem.innerHTML = `
      <button class="eraser">eraser</button>
      `;
      elem.querySelector('.eraser').addEventListener('click', function() {
         mouse.color = 'white';
      });
      document.getElementById("mid_canvas").append(elem);
   }

   mainLoop();
   clearCanvas();
   colors();
   size();
   eraser();
});
