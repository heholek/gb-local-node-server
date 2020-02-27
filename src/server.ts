import io from "socket.io-client";
import {GbService} from "./utils/GbService";
import {ServerAuth} from "./utils/serverAuth";

import ip from "ip";

const ipAddress = ip.address();

const gbService = new GbService();
const serverAuth = new ServerAuth();

const serverAddress = process.env.SERVER_ADDRESS || "http://localhost:3001";
const socketAddress = process.env.SOCKET_ADDRESS || "http://localhost:8000";
let socket;

// Login to API to get auth token
serverAuth.loginToApi( serverAddress).then(v => {
    console.log(serverAuth.gbId);
    socket = io.connect(`${socketAddress}/${serverAuth.gbId}`, {
        query: {role: "gb", username: serverAuth.username, password: serverAuth.password, ipAddress },
    });
    socket.on("action", (v: any) => {
        if (v.type === 'move') {
            gbService.topicMap.get('move')?.publish(v.data);
        }
    });
    gbService.publishDataToSockets(socket);
});
