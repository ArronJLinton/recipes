const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Morgan is HTTP request logger middleware for Node.js
const cors = require("cors");
const session = require('express-session');
const PORT = process.env.PORT || 3001;
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server, { origins: '*:*'}); //pass a http.Server instance

// ===== Middleware ==== //
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});


app.use(morgan('dev'));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.APP_SECRET || 'this is the default passphrase',
    resave: false,
    saveUninitialized: false
  })
);

// ====== Error handler ====
app.use(function (err, req, res) {
  console.log('====== ERROR =======');
  console.error(err.stack);
  res.status(500);
});

// ============ Socket listeners ================ //
// fired off once a new connection is triggered client side
io.on('connection', socket => {

  // var room = socket.handshake.query.r_var;
  

  socket.on('SEND_MESSAGE', function (data) {
    console.log(data);
    console.log('SENDING TO ROOM: ', data.room)
    const room = data.room;
    socket.join(room, () => {
      io.to(room).emit('RECEIVE_MESSAGE', data);
    })
    
  });

  socket.on('GET_ROOMS', function (callback) {
    var rooms = io.sockets.adapter.rooms;

    let roomList = [];

    for (const key in rooms) {
      if(key !== 'undefined' && !(/[A-Z]/.test(key))){
        roomList.push(key)
      }
    }

    console.log("ROOMS", roomList)
    callback(null, roomList)
  });

  socket.on('JOIN_ROOM', function (room, callback) {
    console.log('JOINING ROOM: ', room)
    socket.join(room, () => {
      callback(null, true)
    });
    
  });

  // disconnect is fired when a client leaves the server
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// ==== if its production environment!
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  console.log('=============YOU ARE IN THE PRODUCTION ENV=====================');
  app.use('/static', express.static(path.join(__dirname, './client/build/static')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/'));
  });
}

// ==== Starting Server =====
server.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
