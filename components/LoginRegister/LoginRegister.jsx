import React from 'react';
import {
  Card, Typography, Button
} from '@material-ui/core';
import './LoginRegister.css';
import axios from 'axios';

/**
 * Define LoginRegister, a React componment of CS142 project #7
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {  
      failure_message: "",
      register_mode: 'no',
      register_failure_message: "",
      first_name: "",
      last_name: "",
      login_name: "",
      password: "",
      password_confirm: "",
      occupation: "",
      description: "",
      location: "",
    };
  }

  attempt_login = ()  => {
    axios.post("/admin/login", {
        login_name: this.state.login_name,
        password: this.state.password, 
      })
      .then(res => {
        this.setState({failure_message: ""});
        this.props.login_update('yes', res.data.first_name, res.data._id);
        window.location.href = `#/users/${res.data._id}`;
      })
      .catch(error => {
        this.setState({failure_message: "Invalid Input"});
        console.log(error);
    });    
  };

  register_clicked = (input)  => {
    this.setState({
      register_mode: input, 
      first_name: "", 
      last_name: "", 
      login_name: "", 
      password: "",
      password_confirm: "", 
      occupation: "", 
      description: "", 
      location: ""
    });
  };

  register_user = ()  => {
    let first_name = this.state.first_name;
    let last_name = this.state.last_name;
    let login_name = this.state.login_name;
    let password = this.state.password;
    let password_confirm = this.state.password_confirm;
    if (!first_name || !last_name || !login_name || !password || !password_confirm) {
      this.setState({register_failure_message: "Some Fields are Empty"});
      return;
    }
    if (password !== password_confirm) {
      this.setState({register_failure_message: "Passwords do Not Match"});
      return;
    }
    axios.post("/user", {
      first_name : first_name,
      last_name : last_name,
      occupation : this.state.occupation,
      description : this.state.description,
      location : this.state.location,
      login_name : login_name,
      password : password,
    })
    .then(() => {
      this.setState({
        register_failure_message: "Successfully Registered User", 
        first_name: "", 
        last_name: "", 
        login_name: "", 
        password: "",
        password_confirm: "", 
        occupation: "", 
        description: "", 
        location: ""
      });
    })
    .catch(error => {
      this.setState({
        register_failure_message: "Register Failed", 
        first_name: "", 
        last_name: "", 
        login_name: "", 
        password: "",
        password_confirm: "", 
        occupation: "", 
        description: "", 
        location: ""
    });
      console.log("couldn't register");
      console.log(error);
    }); 
  };

  handleChange = prop => event => {
    this.setState({[prop]: event.target.value });
  };

  render() {
    return (
      <Card>
        {this.state.register_mode === 'yes' ? null: (
        <form>
          <Typography>
            {this.state.failure_message}
          </Typography>
          <Typography>Username:</Typography>
          <input type="text" value={this.state.login_name} onChange={this.handleChange("login_name")}></input><br />
          <Typography>Password:</Typography>
          <input type="password" id="pass" value={this.state.password} onChange={this.handleChange("password")}></input><br />
          <Button onClick={this.attempt_login}>Login</Button>
        </form>
        )}
        {this.state.register_mode === 'no' ?(
          <Button className="cs142registerbuttons" onClick={() =>{this.register_clicked("yes");}}>Register Instead</Button>):(
          <Button className="cs142registerbuttons" onClick={() =>{this.register_clicked("no");}}>Return to Login</Button>
          )}
          {this.state.register_mode === 'no' ? null: (
          <form>
            <Typography>
              {this.state.register_failure_message}
            </Typography>
            <Typography>First Name:</Typography>
            <input type="text" id="fname" value={this.state.first_name} onChange={this.handleChange("first_name")}></input><br />
            <Typography>Last Name:</Typography>
            <input type="text" id="lname" value={this.state.last_name} onChange={this.handleChange("last_name")}></input><br />
            <Typography>Occupation:</Typography>
            <input type="text" id="occupation" value={this.state.occupation} onChange={this.handleChange("occupation")}></input><br />
            <Typography>Description:</Typography>
            <input type="text" id="description" value={this.state.description} onChange={this.handleChange("description")}></input><br />
            <Typography>Location:</Typography>
            <input type="text" id="location" value={this.state.location} onChange={this.handleChange("location")}></input><br />
            <Typography>Username:</Typography>
            <input type="text" id="login_name" value={this.state.login_name} onChange={this.handleChange("login_name")}></input><br />
            <Typography>Password:</Typography>
            <input type="password" id="password" value={this.state.password} onChange={this.handleChange("password")}></input><br />
            <Typography>Confirm Password:</Typography>
            <input type="password" id="password_confirm" value={this.state.password_confirm} onChange={this.handleChange("password_confirm")}></input><br />
            <Button onClick={this.register_user}>Register Me!</Button>
          </form>
        )}
      </Card>
      
    );
  }
}

export default LoginRegister;
