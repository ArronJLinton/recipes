import React from 'react';
import "./Chat.css";
import io from "socket.io-client";
const socket = io();

class Chat extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: props.user,
            message: '',
            messages: []
        };
        
        this.socket = io('localhost:3001/', {
            query: `r_var=private`
        });
  
        socket.on('RECEIVE_MESSAGE', function(data){
            console.log("Message Received: ", data )
            addMessage(data);
        });

        const addMessage = data => {
            console.log(data);
            this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
        };

        this.sendMessage = ev => {
            ev.preventDefault();
            // console.log(this.state.username, this.state.message)
            socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            })
            this.setState({message: ''});
        }        
    }
    render(){
       
        return (
            <div className="container">
              <h3>Welcome, {this.state.username}</h3>
                <div className="row">
                    <div className="col-12">
                        <div className="chatCard">
                            <div className="chatCard-body">
                                <div className="ChatCard-title">Chat Room</div>
                                <hr/>
                                <div className="messages">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div>{message.author}: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <br/>
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                <br/>
                                <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;