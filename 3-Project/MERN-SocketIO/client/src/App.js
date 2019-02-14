import React from 'react';
import Chat from "./components/Chat/Chat"

class App extends React.Component {
  state ={
    username: null,
    join: false
  }

  handleChange = (e) => {
    this.setState({
        [e.target.name]: e.target.value
    })  
  }

  joinRoom = () => {
    if(this.state.username){
      this.setState({
        join: true
      })
    }else{
      alert("Enter a valid username")
    }
    
  }

  render() {
    return (
      <div>
        <div className='jumbotron'>
          <h1>MERN Chat App</h1>
        </div>
        
      {this.state.join ? <Chat user={this.state.username}/> : 
        <div className="container">
          <div className="card">
            <div className="card-header"><h5 className="card-title">Enter Your Name to Join A Room</h5></div>
            <div className="card-body">
              <input type="text" className="form-control" placeholder="Username" name="username" onChange={this.handleChange} />
              <button href="#" className="btn btn-primary"
                onClick={this.joinRoom}
              >Join</button>
            </div>
          </div>
        </div>
        }


      </div>
      
    );
  }
}

export default App;
