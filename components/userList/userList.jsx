import React from 'react';
import { Link } from "react-router-dom";
import {
  List,
}
from '@material-ui/core';
import './userList.css';
import axios from 'axios';
//import fetchModelData from "../../lib/fetchModelData";

/**
 * Define UserList, a React componment of CS142 project #5
 */
function createUserList (users) {
  let result = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    result.push(
      <Link className='cs142-userlist-button' to={`/users/${user._id}`} key={user._id}>
        {user.first_name} {user.last_name}
      </Link>
    );
  }
  return (
    <div>
        {result}
    </div>
  );
}

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: "",
    };
    axios.get("/user/list")
      .then(res => {
        this.setState({users: res.data});
      })
      .catch(error => {
        console.log(error);
    });
  }

  /*componentDidUpdate() {
    axios.get("/user/list")
      .then(res => {
        this.setState({users: res.data});
      })
      .catch(error => {
        console.log(error);
    });
  }*/

  render() {
    return (
      <div>
        <List component="nav">
          {createUserList(this.state.users)}
        </List>
      </div>
    );
  }
}

export default UserList;
