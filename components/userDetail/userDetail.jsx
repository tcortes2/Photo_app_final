import React from 'react';
import { Link } from "react-router-dom";
import {
  Card, Avatar, Typography
} from '@material-ui/core';
import './userDetail.css';
import axios from 'axios';
import { HashLink } from 'react-router-hash-link';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    let newUserNum = this.props.match.params.userId;
    this.state = {
      user: "",
      userid: newUserNum,
      logged_in: this.props.user_id,
      recent_upload: null,
      most_comment: null,
    };
    axios.get(`/user/${this.state.userid}`)
    .then(res => {
      axios.get(`/recentphoto/${this.state.userid}`)
      .then(result => {
        axios.get(`/mostcomments/${this.state.userid}`)
        .then(r => {
          this.setState({user: res.data, recent_upload: result.data, most_comment: r.data});
          this.props.pageStateChange("Details", newUserNum);
        })
        .catch(error => {
          console.log(error);
        });       
      })
      .catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  componentDidUpdate() {
    let newUserNum = this.props.match.params.userId;
    if (this.state.userid !== newUserNum) {
      axios.get(`/user/${newUserNum}`)
        .then(res => {
          this.setState({user: res.data, userid: newUserNum});
          axios.get(`/recentphoto/${this.state.userid}`)
          .then(result => {
            axios.get(`/mostcomments/${this.state.userid}`)
            .then(r => {
              this.setState({recent_upload: result.data, most_comment: r.data});
              this.props.pageStateChange("Details", newUserNum);
            })
            .catch(error => {
              console.log(error);
            });       
          })
          .catch(error => {
            console.log(error);
          });
        })
        .catch(error => {
          console.log(error);
      });
    }
  }

  render() {
    return (
      <Card variant="outlined" className="cs142-userDetail-card">
        <Avatar className="cs142-userDetail-avatar">
          {this.state.first_name}
        </Avatar>
        <Typography variant="body1">
          <b>{this.state.user.first_name} {this.state.user.last_name}</b>
        </Typography>
        <Typography variant="body1">
        <b>Profile Description:</b> {this.state.user.description}
        </Typography>
        <Typography variant="body1">
        <b>Location:</b> {this.state.user.location}
        </Typography>
        <Typography variant="body1">
        <b>Occupation:</b> {this.state.user.occupation}
        </Typography>
        <Typography variant="body1">
          <Link to={`/photos/${this.props.match.params.userId}`}>Photos</Link>
        </Typography>  
        <Typography variant="body1">
          {this.state.userid === this.state.logged_in? (<Link to={`/favorites`}>My Favorites</Link>): null}
        </Typography> 
        {!this.state.recent_upload? null : (
          <Typography variant="body1">
            Most Recent Upload
          </Typography>
        )}
        {!this.state.recent_upload? null : (
          <div>
            <HashLink to={`/photos/${this.props.match.params.userId}#${this.state.recent_upload._id}`}>
              <img className="cs142-userDetail-thumbnail" src={`/images/${this.state.recent_upload.file_name}`}/>
            </HashLink>
            <Typography variant="body1">
              {this.state.recent_upload.date_time}
            </Typography>
          </div>
        )}
        {!this.state.most_comment? null : (
          <Typography variant="body1">
            Most Commented On Photo
          </Typography>
        )}
        {!this.state.most_comment? null : (
          <div>
            <HashLink to={`/photos/${this.props.match.params.userId}`}>
              <img className="cs142-userDetail-thumbnail" src={`/images/${this.state.most_comment.file_name}`}/>
            </HashLink>
            <Typography variant="body1">
              {this.state.most_comment.comments.length} Comments
            </Typography>
          </div>
        )}
      </Card>
    );
  }
}

export default UserDetail;
