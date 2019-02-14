const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Morgan is HTTP request logger middleware for Node.js
const session = require('express-session');
const dbConnection = require("./db"); // loads our connection to the mongo database
const MongoStore = require("connect-mongo")(session);
const PORT = process.env.PORT || 3001;
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io').listen(server); //pass a http.Server instance

// ===== Middleware ==== //
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials: true');
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
    store: new MongoStore({
      mongooseConnection: dbConnection
    }),
    resave: false,
    saveUninitialized: false
  })
);

// ===== testing middleware =====
// app.use(function (req, res, next) {
//   console.log('===== passport user =======');
//   console.log(req.session);
//   // console.log(req.user);
//   console.log('===== END =======');
//   next();
// });

// ==== if its production environment!
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  console.log('=============YOU ARE IN THE PRODUCTION ENV=====================');
  app.use('/static', express.static(path.join(__dirname, './client/build/static')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/'));
  });
}

// ====== Error handler ====
app.use(function (err, req, res) {
  console.log('====== ERROR =======');
  console.error(err.stack);
  res.status(500);
});

// ============ Socket listeners ================ //

// fired off once a new connection is triggered client side
io.on('connection', socket => {
  // console.log('New client connected')

  var room = socket.handshake.query.r_var;
  socket.join(room);
  // console.log("this is sooooooome room---------------", )
  socket.on('SEND_MESSAGE', function (data) {
    console.log(data);
    //io.emit('RECEIVE_MESSAGE', data);
    io.to(room).emit('RECEIVE_MESSAGE', data);
  });

  // disconnect is fired when a client leaves the server
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// ==== Starting Server =====
server.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});



// This creates our socket using the instance of the server
// const io = SocketIO(server);
// io.set('origins', 'http://localhost:3001');