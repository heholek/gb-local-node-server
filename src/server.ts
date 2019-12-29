import io from "socket.io-client";
import {GbService} from "./Ros";
import {ServerAuth} from "./utils/serverAuth";

const gbService = new GbService();
const serverAuth = new ServerAuth();

// The name of the byte
const byteName = process.env.BYTE_NAME;

serverAuth.loginToApi("http://localhost", 3001);

const socket = io.connect(`http://localhost:8000/${byteName}`, {
    query: {username: serverAuth.username, password: serverAuth.password},
});

gbService.publishDataToSockets(socket);
