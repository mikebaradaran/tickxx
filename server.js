const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let data = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/student.html");
});

app.get("/trainer", (req, res) => {
    res.sendFile(__dirname + "/public/trainer.html");
});

io.on("connection", (socket) => {
    // Handle the 'message' event from the client
    socket.on("message", (msg) => {
        addMessage(msg);
        io.sockets.in(msg.room).emit("messagex", data);
    });

    socket.on('room', function (room) {
        socket.join(room);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

app.post("/api/kill", (req, res) => {
    data.length = 0;
    res.status(201).json({ message: "All Data cleared" });
});

app.post("/api/wipe", (req, res) => {
    data.forEach((element) => {
        element.message = "";
    });
    res.status(201).json({ message: "All messages wiped" });
});

app.post("/api/removestudent/:id", (req, res) => {
    let name = req.params.id;
    for (let i = 0; i < data.length; i++) {
        if (data[i].name.toLowerCase() == name.toLowerCase()) {
            data.splice(i, 1);
            break;
        }
    }
    res.status(201).json({ message: "Student " + name + " is removed" });
});

// Start the server
const port = 3000;
http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function addMessage(newMessage) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].name.toLowerCase() == newMessage.name.toLowerCase()) {
            if(data[i].room.toLowerCase() == newMessage.room.toLowerCase())
            data[i].message = newMessage.message;
            return;
        }
    }
    data.push(newMessage);
}