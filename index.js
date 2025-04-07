const http=require("http");
const express =require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const play = require('play-sound')();

const app=express();
const port= 4500 || process.env.PORT ;

// Array to store user information (not recommended to use an array for this purpose)
const users=[{}];

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Define a simple route for testing server status
app.get("/",(req,res)=>{
    res.send("SERVER IS ON");
})

// Create an HTTP server using Express
const server=http.createServer(app);

// Create a Socket.IO instance attached to the HTTP server
const io=socketIO(server);

// Event listener for a new socket connection
io.on("connection",(socket)=>{
    console.log("New Connection");

    // Event listener for a user joining the chat
    socket.on('joined',({user})=>{  // Store user information in the array (not recommended)
          users[socket.id]=user;
          console.log(`${user} has joined `);
        // Broadcast to all connected clients that a new user has joined
          socket.broadcast.emit('userJoined',{user:"Admin",message:` ${users[socket.id]} has joined`});
        // Send a welcome message to the user who joined
          socket.emit('welcome',{user:"Admin",message:`Welcome to the chat,${users[socket.id]} `})
    })

    // Event listener for a chat message
    socket.on('message',({message,id})=>{
        // Emit the message to all connected clients
        io.emit('sendMessage',{user:users[id],message,id});
        // Play a sound when a message is received
        play.play('yuppie.mp3', (err) => {
            if (err) {
              console.error('Error playing audio:', err);
            }
          });
    })
    
    // Event listener for a socket disconnect
    socket.on('disconnect',()=>{
        console.log(`user left`);
        // Broadcast to all connected clients that a user has left
        socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]} has left`});
        // Send a message to the disconnected user
        socket.emit('user',{user:"Admin",message:`left the chat,${users[socket.id]} `})

    })
});

// Start the server on the specified port
server.listen(port,()=>{
    console.log(`server is working on http://localhost:${port}`);  
})