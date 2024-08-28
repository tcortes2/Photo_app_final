/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');
const fs = require("fs");

var express = require('express');
var app = express();

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');




app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    User.find({}, function(err, data) {
        let result = [];
        async.each(data, function(value, callback) {
            let user_data = {_id: value._id, first_name: value.first_name, last_name: value.last_name};
            result.push(user_data);
            callback();   
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                response.status(200).send(result);
            }
        });
    });
});

app.get('/favoritephotos/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let id = request.params.id;
    User.findOne({_id: id}, function(error, d) {
        if (error) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
        } else {
            let photoids = d.favorite_photos;
            Photo.find({_id: photoids}, function(err, data) {
                if (err) {
                    response.status(400).send('Not found');
                    return;
                }
                let photos_array = [];
                async.each(data, function(photo, callback_first) {
                    if (err) { 
                        console.log('Photos for user with _id:' + id + ' not found.');
                        response.status(400).send('Not found');
                        return;
                    }
                    let photo_data = {_id: photo._id, user_id: photo.user_id, file_name: photo.file_name, date_time: photo.date_time, like_count: photo.like_count};
                            photos_array.push(photo_data);
                            callback_first(); 
                }, function(er) {
                    if (er) {
                        console.log('Photos for user with _id:' + id + ' not found.');
                        response.status(400).send('Not found');
                    } else {
                        response.status(200).send(photos_array);
                    }
                });
            });
        }
    });   
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let id = request.params.id;
    User.findOne({_id: id}, function(error, data) {
        if (error) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
        } else {
            let user_data = {
                _id: data._id, 
                first_name: data.first_name, 
                last_name: data.last_name, 
                location: data.location, 
                description: data.description, 
                occupation: data.occupation, 
                favorite_photos: data.favorite_photos
            };
            response.status(200).send(user_data);
        }
    });
});

function compareFn(a, b) {
    if (a.like_count.length < b.like_count.length) {
      return 1;
    }
    if (a.like_count.length > b.like_count.length) {
        return -1;
    } 
    if (a.date_time < b.date_time) {
        return 1;
    }
    if (a.date_time > b.date_time) {
        return -1;
    }
    return 0;
}

app.get('/recentphoto/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let id = request.params.id;
    Photo.find({$and: 
        [{$or: [{
            view_permission: { $size: 0 }}, 
            {view_permission: request.session.user_id}, 
            {user_id: request.session.user_id}]}, 
        {user_id: id}]}).sort({date_time: -1}).limit(1).exec(function(error, data) {
        data = data[0];
        if (error) {
            response.status(400).send('Not found');
            return;
        }
        if (!data){
            response.status(200).send(null);
            return;
        }
        let photo_data = {
            _id: data._id, 
            user_id: data.user_id, 
            file_name: data.file_name, 
            date_time: data.date_time, 
            like_count: data.like_count
        };
        response.status(200).send(photo_data);
    });
});

app.get('/mostcomments/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let id = request.params.id;
    Photo.find({$and: 
        [{$or: [{
            view_permission: { $size: 0 }}, 
            {view_permission: request.session.user_id}, 
            {user_id: request.session.user_id}]}, 
        {user_id: id}]}).sort({comment_count: -1}).limit(1).exec(function(error, data) {
        data = data[0];
        if (error) {
            response.status(400).send('Not found');
            return;
        }
        if (!data){
            response.status(200).send(null);
            return;
        }
        let photo_data = {
            _id: data._id, 
            user_id: data.user_id, 
            file_name: data.file_name, 
            date_time: data.date_time, 
            like_count: data.like_count,
            comments: data.comments
        };
        response.status(200).send(photo_data);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    var id = request.params.id;
    Photo.find({$and: 
            [{$or: [{
                view_permission: { $size: 0 }}, 
                {view_permission: request.session.user_id}, 
                {user_id: request.session.user_id}]}, 
            {user_id: id}]}, 
        function(error, data) {
        if (error) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let photos_array = [];
        async.each(data, function(photo, callback_first) {
            if (error) { 
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            let result = [];
            let comments_new = photo.comments;
            async.each(comments_new, function(comment, callback_second) {
                let comment_data = {comment: comment.comment, date_time: comment.date_time, _id: comment._id};
                User.findOne({_id: comment.user_id}).then((user) => {
                    let user_data = {_id: user._id, first_name: user.first_name, last_name: user.last_name};                              
                    comment_data.user = user_data;  
                    result.push(comment_data);
                    callback_second();
                });
            }, function (err) {
                if (err) {
                    response.status(400).send("No Comment");
                } else {
                    let photo_data = {
                        _id: photo._id, 
                        user_id: photo.user_id, 
                        comments: result, 
                        file_name: photo.file_name, 
                        date_time: photo.date_time, 
                        like_count: photo.like_count, 
                        view_permission: photo.view_permission
                    };
                    photos_array.push(photo_data);
                    callback_first(); 
                }
            });             
        }, function(er) {
            if (er) {
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
            } else {
                photos_array = photos_array.sort(compareFn);
                response.status(200).send(photos_array);
            }
        });
    });
});

app.post('/admin/login', function (request, response) {
    let user = request.body.login_name;
    let pass = request.body.password;
    User.findOne({ login_name: user , password: pass}, function(error, data) {
        if (error || !data) {
            response.status(400).send("No Matching User Name");
        } else {
            request.session.login_name = user;
            request.session.user_id = data._id;
            let user_data = {_id: data._id, first_name: data.first_name, last_name: data.last_name, login_name: data.login_name};
            response.status(200).send(user_data);
        }
    });
});

app.post('/admin/logout', function(request, response) {
    request.session.destroy( function(error) {
      if (error) {
        response.status(400).send("Bad Request");
        return;
      }
      response.status(200).send("Successfully Logged Out");
    });
});

app.post('/favorite/:photo_id', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let photo_id = request.params.photo_id;
    User.findOne({ _id: request.session.user_id}, function(error, data) {
        if (error || !data) {
            response.status(400).send("No Matching User");
        } else {
            let index = data.favorite_photos.indexOf(photo_id);
            if (index !== -1) {
                data.favorite_photos.splice(index, 1);
                data.save();
                response.status(200).send("Unfavorited Successfully");
            } else {
                data.favorite_photos = data.favorite_photos.concat([photo_id]);
                data.save();
                response.status(200).send("Favorited Successfully");
            }
        }
    });
});

app.post('/likesOfPhoto/:photo_id', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let photo_id = request.params.photo_id;
    Photo.findOne({_id: photo_id }, (error, photo) => {
        if(error) {
            response.status(400).send("Error in Changing Like Status");
        } else {
            let index = photo.like_count.indexOf(request.session.user_id);
            if (index !== -1) {  
                photo.like_count.splice(index, 1);
                photo.save();
                response.status(200).send("Unliked Successfully");
            } else {
                photo.like_count = photo.like_count.concat([request.session.user_id]);
                photo.save();
                response.status(200).send("Liked Successfully");
            }
        }
    });
});

app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    let comment = request.body.comment;
    if (!comment) {
        response.status(400).send("Comment is Invalid");
        return;
    }
    let photo_id = request.params.photo_id;
    Photo.findOne({_id: photo_id }, (error, photo) => {
        if(error) {
            response.status(400).send("Comment is Invalid");
        } else {
            let comment_add = {comment: comment, date_time: new Date(), user_id: request.session.user_id};
            photo.comments = photo.comments.concat([comment_add]);
            photo.comment_count = photo.comments.length;
            photo.save();
            response.status(200).send("Commented Successfully");
        }
    });
});

app.post('/photos/new', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not Logged In");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("File Upload Failed");
            return;
        }
        if (request.file.fieldname !== 'uploadedphoto') {
            response.status(400).send('Misnaming');
        }
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
            if (error) {
                response.status(400).send("File Upload Failed");
                return;
            }
            let permissions = request.body.arr;
            if (!permissions) {
                permissions = [];
            }
            let photo = {file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: [], like_count: [], view_permission: permissions};
            Photo.create(photo, (er, photo_data) => {
                if(er) {
                    console.log(er);
                    response.status(400).send("File Upload Failed");
                    return;
                }
                photo_data.save();
                response.status(200).send("Photo Uploaded!");
            });
        });
    });
});

app.post('/user', function (request, response) {
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let occupation = request.body.occupation;
    let description = request.body.description;
    let location = request.body.location;
    let login_name = request.body.login_name;
    let password = request.body.password;
    User.findOne({ login_name: login_name }, function(error, data) {
        if (error) {
            response.status(400).send("Failed Register");
            return;
        }
        if (data) {
            response.status(400).send("Username is Taken");
            console.log("Username " + login_name + " is taken");
        } else {
            let user_data = {
                first_name: first_name, 
                last_name: last_name, 
                location: location, 
                description: description, 
                occupation: occupation,
                password: password, 
                login_name: login_name
            };
            User.create(user_data, (err, registered_user) => {
                if (err) {
                    response.status(400).send("Creation Failed");
                    return;
                }
                registered_user.save();
                response.status(200).send(registered_user);
            });
        }
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


