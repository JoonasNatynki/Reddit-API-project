'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
const moment = require('moment');
var fs = require("fs");



app.use(express.static('static'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true,
}));

app.use(function(req, res, next) {
    console.log('Time:', moment(Date.now()));
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


function initRequestHandlers() {
    app.get('/', function(req, res) {
        console.log('-> index.html');
        res.sendFile(__dirname + '/index.html');
    });
}

function initSockets() {
    io.on('connection', function(socket) 
    {
        const socketid = socket.id;
        console.log('a user connected with session id '+socket.id);
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        // #######################################################################
        // We use this to read the messages log text file
        var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('messages.txt')
        });
        // When a user connects, read the messages and send them to
        lineReader.on('line', function (line)
        {
            var msg = {};
            var splitstr = line.split("€$", 2);
            msg.text = splitstr[1];
            msg.name = splitstr[0];
            io.sockets.connected[socketid].emit("message", msg); // Send the messages line by line to just the connecting client
        });
        // #######################################################################

        // dynamic room, from https://gist.github.com/crtr0/2896891
        socket.on('app_id', function(app_id) {
            console.log('joining room "' + app_id + '"');
            // app_id = room
            socket.join(app_id);
        });

        socket.on('message', function(jsonMsg) {
            console.log(jsonMsg.name + ": " + jsonMsg.text);
            //console.log('room: '+jsonMsg.app_id);
            socket.broadcast.to(jsonMsg.app_id).emit('message', jsonMsg);

            // Write into message log
            fs.appendFile('messages.txt', jsonMsg.name + ": " + jsonMsg.text + "\n", function (err)
            {

            });
        });
    });
}

function startServer() {
    initRequestHandlers();
    initSockets();

    http.listen(3000, function() {
        console.log('Server started (3000)');
    });
}

startServer();
