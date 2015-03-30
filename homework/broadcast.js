var clients = require('./chatServer.js');

// write a function to send message to everyone
// and save history
 function Broadcast(message, sender) {
    clients.forEach(function(client){
        if (client != sender){
            client.write(message);
            }
    })
		 process.stdout.write(message); //log message to server
		 // to read the chat history and display to each new client 
	// can this be done as a module export
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
					console.log("Saved.");
				}
			});
		});
	}


module.exports = Broadcast;