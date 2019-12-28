import io from "socket.io-client";
import {GbService} from "./Ros";
import {ServerAuth} from "./utils/serverAuth";

const gbService = new GbService();
const serverAuth = new ServerAuth();

// The name of the byte
const byteName = process.env.BYTE_NAME;

const socket = io.connect("http://localhost:8000/gb1", {
    query: {username: serverAuth.username, password: serverAuth.password},
});

gbService.topic("test")?.data.subscribe((v: any) => {
    socket.emit("gps", v);
});

serverAuth.loginToApi("http://localhost", 3001);


