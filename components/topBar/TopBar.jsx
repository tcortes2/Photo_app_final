import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Modal, Card, List
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.state,
      userid: this.props.user,
      name: "",
      login_status: this.props.login_status,
      logged_in_user_name: this.props.logged_in_user_name,
      open: false,
      view_permission: [],
      users: '',
      upload_status: false,
    };
    if (this.login_status === "yes") {
      axios.get("/user/list")
      .then(res => {
        this.setState({users: res.data});
      })
      .catch(error => {
        console.log(error);
      });  
    }
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  createUserList () {
    let users = this.state.users;
    let result = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      if (user._id !== this.state.userid) {
        result.push(
          <div key={user._id}>
            <Typography>{user.first_name} {user.last_name}</Typography>
            <input type="checkbox" id={user._id} onChange={() =>{this.udpateUserList(user._id);}}></input>
          </div>
        );
      }
    }
    return (
      <List>
        {result}
      </List>    
    );
  }

  udpateUserList(userid) {
    let curr = this.state.view_permission;
    let index = curr.indexOf(userid);
    if (index === -1) {  
      curr.push(userid);
    } else {
      curr.splice(index, 1);
    }
    this.setState({view_permission: curr});
  }

  componentDidUpdate() {
    if (this.props.state !== this.state.title || this.state.userid !== this.props.user) {
      axios.get(`/user/${this.props.user}`)
        .then(res => {
          axios.get("/user/list")
          .then(r => {
            this.setState({users: r.data});
          })
          .catch(error => {
            console.log(error);
          });
          let user = res.data;
          this.setState({
            userid: this.props.user, 
            title: this.props.state, 
            name: "for " + user.first_name + " " + user.last_name, 
            login_status: this.props.login_status, 
            logged_in_user_name: this.props.logged_in_user_name,
          });
        })
        .catch(error => {
          console.log(error);
      });
    }
  }

  logout_clicked = ()  => {
    this.setState({ login_status: 'no', logged_in_user_name: '', name: "", title: ""});
    this.props.logout_initiated("no", "");
  };

  upload_clicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      for (let i = 0; i < this.state.view_permission.length; i++) {
        domForm.append(`arr[${i}]`, this.state.view_permission[i]);
      }
      if (this.state.view_permission.length === 0) {
        domForm.append(`arr[]`, this.state.userid);
      }
      axios.post('/photos/new', domForm)
      .then(() => {
        this.setState({upload_status: true});
        this.handleClose();
      })
      .catch(err => console.log(`POST ERR: ${err}`));
    } 
  };

  upload_clicked_no_permissions = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
      .then(() => {
        this.setState({upload_status: true});
        this.handleClose();
      })
      .catch(err => console.log(`POST ERR: ${err}`));
    } 
  };

  handleOpen() {
    this.setState({open: true});
  }

  handleClose() {
    this.setState({open: false, upload_status: false});
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Typography className='cs142-topbar-state' variant="h5" color="inherit">
            {this.state.login_status === 'yes' ? (<div>{this.state.title} {this.state.name}</div>): "Home"}
          </Typography>
          <Typography className='cs142-topbar-login_name' variant="h5" color="inherit">
            {this.state.login_status === 'yes' ? 'Hi ' +  this.state.logged_in_user_name: "Please Login"}
          </Typography>
          <Typography className='cs142-topbar-logout_button' variant="h5" color="inherit">
            {this.state.login_status === "yes" ? (
              <Button onClick={this.logout_clicked} variant="contained">
                  Logout
              </Button>
            ) : null}
          </Typography>
          <Typography className='cs142-topbar-upload_button' variant="h5" color="inherit">
            {this.state.login_status === "yes" ? (
            <div><input className='cs142-topbar-choose_file' type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} /> 
              <Button className='cs142-topbar-upload_botton' onClick={this.upload_clicked_no_permissions} variant="contained">
                  Upload
              </Button>
              <Button className='cs142-topbar-upload_botton2' onClick={this.handleOpen} variant="contained">
                  Upload With Permissions
              </Button>
              <Modal open={this.state.open} onClose={this.handleClose}>
                <Card>
                {this.state.upload_status === true ? (
                  <Typography variant="h5" color="inherit">
                    Upload Successful
                  </Typography>
                ) : null}
                  <Typography variant="h5" color="inherit">
                    Check All Users Who Can See this Photo or Leave Blank to be Private
                  </Typography>
                  {this.state.login_status === "yes" ? (
                      <div>
                      {this.createUserList()}
                      </div>
                    ) : null}
                  <Button onClick={this.upload_clicked} variant="contained">
                    Finish Upload
                  </Button>
                </Card>
              </Modal>
            </div>
            ) : null}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
