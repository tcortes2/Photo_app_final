import React from 'react';
import { Link } from "react-router-dom";
import {
  Card, CardContent, Typography, Button,
} from '@material-ui/core';
import './userPhotos.css';
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */

function createComments(comments) {
  let result = [];
  for (let i = 0; i < comments.length; i++) {
    let comment = comments[i];
    result.push(
      <Card variant="outlined" key={comment._id}>
        <Link to={`/users/${comment.user._id}`}>
        {comment.user.first_name} {comment.user.last_name} :
        </Link> 
       <Typography>{comment.comment}</Typography>
       <Typography>Commented on: {comment.date_time}</Typography>   
      </Card>
    );
  }
  return result;
}

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    let newUserNum = props.match.params.userId;
    this.state = {
      photos: "",
      usernum: newUserNum,
      comment: '',
      user_id: this.props.user_id,
      user_favorites: [],
    };
    axios.get(`/photosOfUser/${this.state.usernum}`)
      .then(result => {
        axios.get(`/user/${this.state.user_id}`)
        .then(res => {
          this.setState({photos: result.data, user_favorites: res.data.favorite_photos});
        })
        .catch(error => {
          console.log(error);
        });        
      })
      .catch(error => {
        console.log(error);
    });   
    this.props.pageStateChange("Photos", newUserNum);
  }

  trigger_like(photoid) {
    axios.post(`/likesOfPhoto/${photoid}`)
    .then(() => {
      axios.get(`/photosOfUser/${this.state.usernum}`)
      .then(res => {
        this.setState({photos: res.data});
      })
      .catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });    
  }

  trigger_favorite (photoid) {
    axios.post(`/favorite/${photoid}`)
    .then(() => {
      axios.get(`/photosOfUser/${this.state.usernum}`)
      .then(result => {
        axios.get(`/user/${this.state.user_id}`)
        .then(res => {
          this.setState({photos: result.data, user_favorites: res.data.favorite_photos});
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

  createPhotoDisplay(photo) {
    if (photo.comments.length !== 0) {
      let comments_res = createComments(photo.comments);
      return (
        <Card variant="outlined">
          <CardContent>
            <div id={photo._id}><img className="cs142-userphotos-img" src={`/images/${photo.file_name}`}/></div>
            <Typography>Photo Published: {photo.date_time}</Typography>
            <Typography>Likes: {photo.like_count.length}</Typography>
            <Button onClick={() =>{this.trigger_like(photo._id);}}>{photo.like_count.includes(this.state.user_id)? (<div>Unlike </div>) : (<div>Like </div>)}</Button>
            <Button onClick={() =>{this.trigger_favorite(photo._id);}}>{this.state.user_favorites.includes(photo._id)? (<div>Unfavorite </div>) : (<div>Favorite </div>)}</Button>
            <div>{comments_res}</div>
            <form>
              <Typography>Type Your Comment Here:</Typography>
              <input type="text" id={photo._id} value={this.state.comment} onChange={this.handleChange("comment")}></input><br />
              <Button onClick={() =>{this.submit_comment(photo._id);}}>Add Comment</Button>
            </form>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card variant="outlined">
          <CardContent>
          <div id={photo._id}><img className="cs142-userphotos-img" src={`/images/${photo.file_name}`}/></div>
            <Typography>Photo Published: {photo.date_time}</Typography>
            <Typography>Likes: {photo.like_count.length}</Typography>
            <Button onClick={() =>{this.trigger_like(photo._id);}}>{photo.like_count.includes(this.state.user_id)? (<div>Unlike </div>) : (<div>Like </div>)}</Button>
            <Button onClick={() =>{this.trigger_favorite(photo._id);}}>{this.state.user_favorites.includes(photo._id)? (<div>Unfavorite </div>) : (<div>Favorite </div>)}</Button>
            <Typography>No Comments</Typography>
            <form>
              <Typography>Be The First to Comment:</Typography>
              <input type="text" id={photo._id} value={this.state.comment} onChange={this.handleChange("comment")}></input><br />
              <Button onClick={() =>{this.submit_comment(photo._id);}}>Add Comment</Button>
            </form>
          </CardContent>
      </Card>
    );
  }

  submit_comment(photoid) {
    let comment = this.state.comment;
    if (!comment) return;
    axios.post(`/commentsOfPhoto/${photoid}`, {
        comment: comment,
      })
      .then(() => {
        axios.get(`/photosOfUser/${this.state.usernum}`)
        .then(res => {
          this.setState({photos: res.data, comment: ""});
        })
        .catch(error => {
          console.log(error);
        });
      })
      .catch(error => {
        console.log(error);
    });    
  }

  createUserPhotos (photos) {
    let result = [];
    for (let i = 0; i < photos.length; i++) {
      let photo = photos[i];
      let display = this.createPhotoDisplay(photo);
      result.push(<div key={photo._id} >{display}</div>);
    }
    return (
      <div>
          {result}
      </div>
    );
  }

  handleChange = prop => event => {
    this.setState({[prop]: event.target.value });
  };

  render() {
    return (
      <div>
        {this.createUserPhotos(this.state.photos)}
      </div>
    );
  }
}

export default UserPhotos;
