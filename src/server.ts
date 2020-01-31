import io from "socket.io-client";
import {GbService} from "./utils/GbService";
import {ServerAuth} from "./utils/serverAuth";

const gbService = new GbService();
const serverAuth = new ServerAuth();

let byteId = process.env.BYTE_ID;
const serverAddress = process.env.SERVER_ADDRESS || "http://localhost:3001";
const socketAddress = process.env.SOCKET_ADDRESS || "http://localhost:8000";
let socket;

// Login to API to get auth token
serverAuth.loginToApi( serverAddress).then(v => {
    console.log(serverAuth.gbId);
    socket = io.connect(`${socketAddress}/${serverAuth.gbId}`, {
        query: {role: "gb", username: serverAuth.username, password: serverAuth.password},
    });
    socket.emit("test", "test");
    gbService.publishDataToSockets(socket);
});
