import React from 'react';
import {
  Card, Typography, Button, CardContent,  Modal,
} from '@material-ui/core';
import './Favorites.css';
import axios from 'axios';

/**
 * Define Favorites, a React componment of CS142 project #8
 */

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {  
        photos: null,
        open: false,
    };
    axios.get(`/favoritephotos/${this.props.user_id}`)
    .then(result => {
        this.setState({photos: result.data});
        this.props.pageStateChange("Favorites", this.props.user_id);
    })
    .catch(error => {
        console.log(error);
    });
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  trigger_unfavorite (photoid) {
    axios.post(`/favorite/${photoid}`)
    .then(() => {
        axios.get(`/favoritephotos/${this.props.user_id}`)
        .then(result => {
            this.setState({photos: result.data});
            this.props.pageStateChange("Favorites", this.props.user_id);
        })
        .catch(error => {
            console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
    });
  }

  handleOpen(photoid) {
    this.setState({open: photoid});
  }

  handleClose() {
    this.setState({open: false});
  }
  
  createPhotoDisplay(photo) {
    return (
      <Card variant="outlined">
          <CardContent>
            <div><img className="cs142-userphotos-thumbnail" src={`/images/${photo.file_name}`} onClick={() =>{this.handleOpen(photo._id);}}/></div>
            <Modal open={this.state.open === photo._id} onClose={this.handleClose}>
                <div>
                    <div><img className="cs142-userphotos-modal" src={`/images/${photo.file_name}`}/></div>
                    <Card>
                        <Typography>Photo Published: {photo.date_time}</Typography>
                        <Typography>Likes: {photo.like_count.length}</Typography>
                    </Card>
                </div>
            </Modal>
            <Button onClick={() =>{this.trigger_unfavorite(photo._id);}}><div>Unfavorite</div></Button>
          </CardContent>
      </Card>
    );
  }

  createThumbnails(photos) {
    let result = [];
    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        let photo = photos[i];
        let display = this.createPhotoDisplay(photo);
        result.push(<div key={photo._id} >{display}</div>);
      }
    }
    
    return (
      <div>
          {result}
      </div>
    );
  }

  render() {
    return (
        <div>
        {this.createThumbnails(this.state.photos)}
        </div>
    );
  }
}

export default Favorites;
