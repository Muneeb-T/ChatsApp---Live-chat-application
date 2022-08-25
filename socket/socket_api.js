const io = require("socket.io")();
const socket_api = {
    io: io
};
let users = []
// Add your socket.io logic here!
io.on("connection", function (socket) {

    socket.on("connected", (user_id) => {
        users.push({ socket_id: socket.id, user_id: user_id })
    })

    socket.on('chat message', (data) => {
        users.forEach(element => {
            if (element.user_id == data.to_id) {
                io.to(element.socket_id).emit("send_message", data.message)
            }
        })
    });


});
// end of socket.io logic

module.exports = socket_api;