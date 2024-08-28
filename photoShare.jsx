import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from "./components/LoginRegister/LoginRegister";
import Favorites from "./components/Favorites/Favorites";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      pagestate: 'Home',
      login: 'no',
      logged_in_user_name: '',
      logged_in_user_id: '',
    };
    this.pageStateChange = this.pageStateChange.bind(this);
    this.login_update = this.login_update.bind(this);
    this.logout_initiated = this.logout_initiated.bind(this);
  }

  pageStateChange(newpagestate, userid) {
    this.setState({pagestate: newpagestate, userId: userid});
  }

  login_update(login_new, name, id) {
    this.setState({login: login_new, logged_in_user_name: name, logged_in_user_id: id});
  }

  logout_initiated(logout_new, empty) { 
    this.setState({login: logout_new, logged_in_user_name: empty, logged_in_user_id: empty});
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar state={this.state.pagestate} user={this.state.userId} 
            login_status={this.state.login} logged_in_user_name={this.state.logged_in_user_name} 
            logout_initiated={this.logout_initiated}
            user_id={this.state.logged_in_user_id}
          />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            {this.state.login === 'yes' ? <UserList /> : 
            <Redirect to="/login-register" />}
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              <Route path="/login-register"
                render={ props => <LoginRegister {...props} login_update={this.login_update}/> }
              />
              {this.state.login === 'yes' ? 
                <Route path="/users/:userId" render={ props => <UserDetail {...props} user_id={this.state.logged_in_user_id} pageStateChange={this.pageStateChange}/> }/>: 
                <Redirect path="/users/:userId" to="/login-register" />}
              {this.state.login === 'yes' ? 
                <Route path="/photos/:userId" render ={ props => <UserPhotos {...props} user_id={this.state.logged_in_user_id} pageStateChange={this.pageStateChange}/> }/>: 
                <Redirect path="/users/:userId" to="/login-register" />}
              {this.state.login === 'yes' ? 
                <Route path="/favorites" render={ props => <Favorites {...props} user_id={this.state.logged_in_user_id} pageStateChange={this.pageStateChange}/> }/>: 
                <Redirect path="/favorites" to="/login-register" />}
              <Route path="/users" component={UserList}  />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
