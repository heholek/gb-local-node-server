import io from "socket.io-client";
import {ActionHandler} from "./utils/ActionHandler"
import {GbService} from "./utils/GbService";
import {ServerAuth} from "./utils/serverAuth";

import ip from "ip";

const ipAddress = ip.address();
console.log(ipAddress);

const gbService = new GbService();
const serverAuth = new ServerAuth();
const actionHandler = new ActionHandler(gbService);

const serverAddress = process.env.SERVER_ADDRESS || "http://10.0.4.138:3001";
const socketAddress = process.env.SOCKET_ADDRESS || "http://10.0.4.138:8000";
let socket;

// Login to API to get auth token
serverAuth.loginToApi( serverAddress).then(v => {
    console.log(serverAuth.gbId);
    socket = io.connect(`${socketAddress}/${serverAuth.gbId}`, {
        query: {role: "gb", username: serverAuth.username, password: serverAuth.password, ipAddress },
    });
    socket.on("action", (msg: any) => {
        actionHandler.handleActions(msg.type, msg.data);
    });
    gbService.publishDataToSockets(socket);
});
