// This code is inspired of
// "Create a Drawing App with HTML5 Canvas and JavaScript"
// by William Malone
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
// and
// "A collaborative drawing canvas with node.js and socket.io"
// by CodeAndCoffeee
// http://code-and.coffee/post/2015/collaborative-drawing-canvas-node-websocket/
var line_history = [];

window.onload = function() {
    var peer = new Peer({ host: "https://immense-oasis-76652.herokuapp.com/", path: '/peer' });
    var conns = [];
    var connIds = {};
    var context;
    // var peer = new Peer( { host: "https://onlinestudytable2018.herokuapp.com/", path: '/peer' });
    socket = io();
    peer.on('connection', function(conn) {
        conn.on('data', function(data) {
            if (data == 'clear') {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            else if (context) {
                draw(data);
            }

        });
    });
    peer.on('open', function(id) {
        api.getCanvas(function(err, data) {
            setLineHistory(data);
            if (data) {
                for (let i in data) {
                    draw(data[i]);
                }
            }
        });
        if (!(connIds[id])) {
                connIds[id] = true;
        }
        socket.emit('clientid', id);
    });
    socket.on('clientid', function(ids) {
        ids.forEach(function(id) {
            if (!(connIds[id])) {
                var conn = peer.connect(id);
                conns.push(conn);
                connIds[id] = true;
            }
        })
    });

    function setLineHistory(data) {
        line_history = data;
    }

    var mouse = {
        click: false,
        move: false,
        pos: { x: 0, y: 0 },
        pos_prev: false,
        color: 'black',
        lineWidth: 1
    };
    // get canvas element and create context
    var canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    //var width   = window.innerWidth;
    //var height  = window.innerHeight;
    var width = canvas.offsetWidth;
    var height = canvas.offsetHeight;
    var socket = io.connect();

    // set canvas to full browser width/height
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function(e) { mouse.click = true; };
    canvas.onmouseup = function(e) { mouse.click = false; };
    canvas.onmouseleave = function(e) { mouse.click = false; };

    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = (e.pageX - canvas.offsetLeft) / width;
        mouse.pos.y = (e.pageY - canvas.offsetTop) / height;
        mouse.move = true;
    };

    socket.on('connect', function() {
        // console.log('connected to server');
    });

    socket.on('disconnect', function() {
        // console.log('disconnected to server');
    });

    var draw = function(data) {
        var line = (data.line) ? data.line: data;
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
    }

    socket.on('clear', function(data) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setLineHistory([]);
    });

    // main loop, running every 25ms
    // TODO run on listener mouse down, stop running on mouse up
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            data = { line: [mouse.pos, mouse.pos_prev, mouse.color, mouse.lineWidth] };
            // send line to to the server
            // socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev, mouse.color, mouse.lineWidth] });
            conns.forEach((conn) => {
                conn.send(data);
            })
            if (context) {
                draw(data);
            }
            line_history.push(data.line);

            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(mainLoop, 25);
    }

    function clearCanvas() {
        var elem = document.createElement('div');
        elem.innerHTML = `
      <button class="clear btn btn-danger mr-2">Clear</button>
      `;
        elem.querySelector('.clear').addEventListener('click', function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            setLineHistory([]);
            conns.forEach((conn) => {
                conn.send('clear');
            })
        });
        document.getElementById("bot_canvas").append(elem);
    }

    function colors() {
        var elem = document.createElement('div');
        elem.innerHTML = `
      <div class="btn-group mr-2">
         <button class="btn btn-info red">red</button>
         <button class="btn btn-info yellow">yellow</button>
         <button class="btn btn-info blue">blue</button>
      </div>
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
        document.getElementById("bot_canvas").append(elem);
    }

    function size() {
        var elem = document.createElement('div');
        elem.innerHTML = `
      <div class="btn-group mr-2" role="group">
         <button class="btn btn-info small">small</button>
         <button class="medium btn btn-info">medium</button>
         <button class="large btn btn-info">large</button>
      </div>
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
        document.getElementById("bot_canvas").append(elem);
    }

    function eraser() {
        var elem = document.createElement('div');
        elem.innerHTML = `
      <button class="eraser btn btn-default mr-2">eraser</button>
      `;
        elem.querySelector('.eraser').addEventListener('click', function() {
            mouse.color = 'white';
        });
        document.getElementById("bot_canvas").append(elem);
    }

    function save() {
        var elem = document.createElement('div');
        elem.innerHTML = `
      <button class="save btn btn-success mr-2">save</button>
      `;
        elem.querySelector('.save').addEventListener('click', function() {
            api.saveCanvas(line_history, function(err) {
                if (err) console.error(err);
            });
        });
        document.getElementById("bot_canvas").append(elem);
    }

    mainLoop();
    clearCanvas();
    colors();
    size();
    eraser();
    save();

}