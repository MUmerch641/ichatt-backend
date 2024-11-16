// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize the app and server
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",  // Allow your front-end URL; fallback to "*" if not set
        methods: ["GET", "POST"],
    }
});

// Store users by socket ID
const users = {};

// When a new socket connection is made
io.on("connection", (socket) => {
    console.log(`New connection established: ${socket.id}`);

    // When a new user joins
    socket.on("new-user-joined", (userName) => {
        users[socket.id] = userName;  // Assign the username to the socket ID
        socket.broadcast.emit("user-joined", userName);  // Notify others about the new user
        console.log(`User joined: ${userName}`);

        // Send the current users list to the new user
        socket.emit("current-users", Object.values(users));
    });

    // When a message is sent
    socket.on("send", (message) => {
        socket.broadcast.emit("receive", {
            message: message,
            userName: users[socket.id],  // Get the user's name from the users object
        });
    });

    // When a user disconnects
    socket.on("disconnect", () => {
        const userName = users[socket.id];  // Get the user's name
        if (userName) {
            socket.broadcast.emit("left", userName);  // Notify others that this user left
            delete users[socket.id];  // Remove user from the users object
            console.log(`${userName} disconnected`);
        }
    });
});

// Set the port dynamically or default to 9000
const port = process.env.PORT || 9000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
