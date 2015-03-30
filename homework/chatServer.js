var net = require('net');
var port = 3000
var fs = require('fs');
var chalk = require("chalk");

var clientCounter = 0;
var clients = [];

// ahhhh, I could not wrap my head around how to use this for days
// var client = function(socket){
// 	this.name = socket;
// 	this.username = "username";
// 	this.room = "lounge";
// }

//support multiple clients
//Broadcast incoming messages to each connected client
//handles client disconnect (i.e. does not send messages to disconnected clients)
//keep a history of chat messages and broadcast the history to new clients when they connect

var server = net.createServer(function(socket) {
	
	clientCounter++;
	//ideally want to form this using a constructor but really confused on how to do this automatically
	socket.name = [socket.remoteAddress, "user"+clientCounter, "lounge"];
	clients.push(socket);
	console.log(socket.name)

	// var d = new Date();
	// socket.write(d.toString());

	socket.write('Hello ' + socket.name[1]+"\n");
	fs.readFile("userSpecs.md", function(err, data){
		if (err) {
			console.log(err);
		} else {
			socket.write(data.toString().trim()+"\n Now chat away!\n");
		}
	});

	broadcast(socket.name[1] + " entered the lounge\n");

	fs.readFile("chathistory.json", function(err, data){
		if (err) {
			console.log(err);
		} else if (data === null) {
			socket.write("Let's make history.");
		} else {
			socket.write("Let's get you up to speed with the current chat history: \n" + JSON.parse(data).join(''));
		}
	});

	socket.on('data', function(data) {
		var cut = data.toString().trim().split(" ");
		if (cut[0]==="/yell") {
			cut.shift();
			var newCut = cut.join(" ");
			var yell = newCut.toUpperCase();
			broadcast(socket.name[1] + ": " + yell + "\n", socket);
		} else if (cut[0]==="/username"){
			if (cut.length > 2) {
				socket.write("Invalid. Please make sure your username is only one word.")
			} else {
				var oldName = socket.name[1];
				cut.shift();
				socket.name[1] = cut;
				socket.write("Your username is now " + socket.name[1]+"\n");
				broadcast(oldName + " has changed their username to " + socket.name[1] + "\n", socket);
			}
		} else if (cut === "/tableflip" || cut[0] === "/tableflip") {
			var flip = "(╯°□°）╯︵ ┻━┻ \n";
			broadcast(socket.name[1] + ": " + flip, socket);
		} else if (cut[0]==="/color"){
			cut.shift();
			cut.join(' ');
			if (cut[0] === "blue") {
				cut.shift();
				var newCut = cut.join(" ");
				broadcast(socket.name[1] + ": " + chalk.blue(newCut) + "\n", socket);
			} else if (cut[0]==="green") {
				cut.shift();
				var newCut = cut.join(" ");
				broadcast(socket.name[1] + ": " + chalk.green(newCut) + "\n", socket);
			} else if (cut[0]==="red") {
				cut.shift();
				var newCut = cut.join(" ");
				broadcast(socket.name[1] + ": " + chalk.red(newCut) + "\n", socket);
			} else if (cut[0]==="yellow") {
				cut.shift();
				var newCut = cut.join(" ");
				broadcast(socket.name[1] + ": " + chalk.yellow(newCut) + "\n", socket);
			} else {
				socket.write("Sorry, that color is unavailable.");
			}
		} else if (cut[0] === "/humorUs" || cut === "/humorUs") {
			fs.readFile("jokes.json", function(err, data){
				if (err) {
					console.log(err);
				} else {
					var jokeArray = JSON.parse(data);
					broadcast(jokeArray[Math.floor(Math.random()*jokeArray.length)] + "\n");
				}
			});
		}else {
			broadcast(socket.name[1] + ": " + data, socket);
		}
	});

	socket.on('end', function() {
		clients.splice(clients.indexOf(socket), 1)
		broadcast(socket.name[1] + ' left the lounge\n');
	});
	// tried unsuccessfully to put export this as module. sigh.
	function broadcast(message, sender) {
	    clients.forEach(function(client){
	        if (client != sender){
	            client.write(message);
	            }
	    })
		 process.stdout.write(message); //log message to server
		 // to read the chat history and display to each new client 
		// couldn't get the module export to work :(
		 fs.readFile("chathistory.json", function(err, data){
		if (err) {
			var history =[];
		} else {
			var history = JSON.parse(data);
		}
			history.push(message);
			var historyJson = JSON.stringify(history);
			fs.writeFile("chathistory.json", historyJson, function(err){
				if (err){
					console.log(err);
				} else {
					return;
				}
			});
		});
	}
});

server.listen(port, function() {
  console.log('listening on port ' + port );
});







	





