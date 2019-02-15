import React from "react";
import { Card, CardBody, CardTitle, Button, Collapse } from "reactstrap";
import Chat from "./components/Chat/Chat";
import io from "socket.io-client";
const socket = io();

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      joins: false,
      rooms: [],
      room: null,
      collapse: false
    };
    // call to server-side socket listener
    // { transports : ['websocket'] } ->
    this.socket = io.connect("http://localhost:3001", {
      transports: ["websocket"]
    });

    this.socket.on("UPDATE_ROOMS", function(data) {
      console.log("Rooms Received: ", data);
      updateRooms(data);
    });

    const updateRooms = data => {
      console.log(data);
      this.setState({ rooms: [...this.state.rooms, data] });
      console.log(this.state.rooms);
    };
  }

  componentDidMount() {
    socket.emit("GET_ROOMS", (err, data) => {
      this.setState({
        rooms: data
      });
    });
  }

  toggle = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  createRoom = e => {
    e.preventDefault();
    if (this.state.username && this.state.room) {
      socket.emit("NEW_ROOM", this.state.room.toLowerCase(), err => {
        this.setState({
          join: true
        });
      });
    } else {
      alert("Enter a valid username");
    }
  };

  joinRoom = room => {
    socket.emit("JOIN_ROOM", room.toLowerCase(), (err, data) => {
      this.setState({
        join: true,
        room: room
      });
    });
  };

  render() {
    return (
      <div>
        <div className="jumbotron">
          <h1>Charla(Chat) App</h1>
        </div>
        {this.state.join ? (
          <Chat
            user={this.state.username}
            room={this.state.room}
            socket={this.socket}
          />
        ) : (
          <div>
            <div className="container">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Available Rooms</h5>
                </div>
                <div className="card-body">
                  {this.state.rooms.map((room, i) => {
                    return (
                      <Card key={i}>
                        <CardBody>
                          <div onClick={this.toggle}>
                            <div className="card-header">
                              {room.toUpperCase()}
                            </div>
                          </div>
                          <Collapse isOpen={this.state.collapse}>
                            <Card>
                              <h6 className="card-title">
                                Enter Your Name to Join Room
                              </h6>
                              <CardBody>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Username"
                                  name="username"
                                  onChange={this.handleChange}
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={() => this.joinRoom(room)}
                                >
                                  Join
                                </button>
                              </CardBody>
                            </Card>
                          </Collapse>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
            <br />
            <div className="container">
              <div className="card">
                <div className="card-body">
                  <div className="card-header">
                    <h5 className="card-title">Create A Room</h5>
                  </div>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter a name for the room"
                      name="room"
                      onChange={this.handleChange}
                    />
                  </div>

                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your display name"
                      name="username"
                      onChange={this.handleChange}
                    />
                  </div>
                  <button
                    href="#"
                    className="btn btn-primary"
                    onClick={this.createRoom}
                  >
                    Join
                  </button>
                </div>
                {/* End of Card Body */}
              </div>
              {/* End of Card */}
            </div>
            {/* End of Container */}
          </div>
        )}
      </div>
    );
  }
}

export default App;
