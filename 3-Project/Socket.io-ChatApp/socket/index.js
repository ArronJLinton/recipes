module.exports = io => {
  io.on("connection", socket => {
    // var room = socket.handshake.query.r_var;

    socket.on("SEND_MESSAGE", function(data) {
      console.log(data);
      console.log("SENDING TO ROOM: ", data.room);
      const room = data.room;
      // socket.join(room, () => {
      io.to(room).emit("RECEIVE_MESSAGE", data);
      // })
    });

    socket.on("SEND_INTRO", function(data) {
      console.log(data);
      console.log("SENDING TO ROOM: ", data.room);
      const room = data.room;
      socket.join(room, () => {
        io.to(room).emit("RECEIVE_MESSAGE", data);
      });
    });

    socket.on("GET_ROOMS", function(callback) {
      var rooms = io.sockets.adapter.rooms;

      let roomList = [];

      for (const key in rooms) {
        if (key !== "undefined" && !"/[A-Z]/.test(key)") {
          roomList.push(key);
        }
      }

      console.log("ROOMS", roomList);
      callback(null, roomList);
    });

    socket.on("NEW_ROOM", function(room, callback) {
      console.log("JOINING ROOM: ", room);
      socket.join(room, () => {
        io.emit("UPDATE_ROOMS", room);
        callback(null, true);
      });
    });

    socket.on("JOIN_ROOM", function(room, callback) {
      console.log("JOINING ROOM: ", room);
      socket.join(room, () => {
        // io.to(room).emit("RECEIVE_MESSAGE", "New User Joined !");
        callback(null, true);
      });
    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
