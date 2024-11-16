const io = require("socket.io")(9000, {
    cors: {
        origin: "*", // Allow your front-end origin
    }
});

const users = {}; // Store users by socket.id

io.on("connection", (socket) => {
    console.log(`New connection established: ${socket.id}`);

    // When a new user joins
    socket.on("new-user-joined", (userName) => {
        users[socket.id] = userName; // Assign the username to the socket ID
        socket.broadcast.emit("user-joined", userName); // Notify others about the new user

        console.log(`User joined: ${userName}`);

        // Send the current users list to the new user
        socket.emit("current-users", Object.values(users));
    });

    // When a message is sent
    socket.on("send", (message) => {
        socket.broadcast.emit("receive", {
            message: message,
            userName: users[socket.id], // Get the user's name from the users object
        });
    });

    // When a user disconnects
    socket.on("disconnect", () => {
        const userName = users[socket.id]; // Get the user's name
        if (userName) {
            socket.broadcast.emit("left", userName); // Notify others that this user left
            delete users[socket.id]; // Remove user from the users object
            console.log(`${userName} disconnected`);
        }
    });
});
