var path = require("path");	// Help for detecting if the client asks a javascript type file
var express = require("express");	// Express nodejs web application framework, makes things easier somewhat.
var app = express();
var portnumber = 8000;	// The port number the server is listening on LAN
//var cp = require("child_process");	
var cookieparser = require("cookie-parser");	// For accessing and doing stuff with cookies on the client side
var datum = require('datumbox').factory("a8f5694b80ee745eafb318f3b02aef40");	// The machine learning API and the APP ID for the service
//var http = require('http');	
var bodyParser = require('body-parser');	//Parses the incoming request to a JSON object. used in app.post("/topic_search"... as request.body.text i.e

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

console.log("Initialization done.");

app.listen(portnumber);	// Listen to port number ####
app.use(cookieparser());	// Use the cookieparser

var CLIENTID = "oz4I-8h8nyfXcg";	// client id
var CLIENTSECRET = "Nzf6R_2jbnHd59fS8-v4V1UDrNc";	// client secret

console.log("Server running at natynki.net.");


// GET ###################################################################################################
// Default front page
app.get("/", function(request, response)
	{
	    response.sendFile(__dirname + "/login.html");
	});

	// Default front page
app.get("/frontpage", function(request, response)
	{
	    response.sendFile(__dirname + "/frontPage.html");
	});

app.get("/authorize_callback*", function(request, response)
	{
		response.cookie("code", request.query.code);	// Throw the code into the client's cookie and then redirect the client to the front page where the cookie is used to get the access_token
		response.redirect("/frontpage");
	});

		// Default front page
app.get("/chat", function(request, response)
	{
		console.log("A user is joining the chat room...");
	    response.sendFile(__dirname + "/chat.html");
	});

//	For handling all javascript requests
app.get("/scripts/*", function(request, response)
	{
	    if(path.extname(request.url) == ".js")
	    {
			console.log("Handling .js request to: " + request.url);
	    	response.sendFile(__dirname + request.url);
	    }
	});
// /GET ###################################################################################################




// POST ###################################################################################################
app.post("/topic_search", function(request, response)
	 {
		//console.log(request.body.text);
		if(request.body.text)
		{
			var topic = datum.topicClassification(request.body.text, function(err, data)
			{
				if ( err )
				{
					console.log(err);
					return response.send(err);
				}
				response.send(data);
			});;
			//response.redirect("/frontpage");
		}
	});
// /POST ###################################################################################################