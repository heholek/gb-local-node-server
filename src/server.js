"use strict";
exports.__esModule = true;
var socket_io_client_1 = require("socket.io-client");
var ActionHandler_1 = require("./utils/ActionHandler");
var GbService_1 = require("./utils/GbService");
var serverAuth_1 = require("./utils/serverAuth");
var ip_1 = require("ip");
var ipAddress = ip_1["default"].address();
var gbService = new GbService_1.GbService();
var serverAuth = new serverAuth_1.ServerAuth();
var actionHandler = new ActionHandler_1.ActionHandler(gbService);
var address = process.env.ADDRESS || "10.0.5.38";
var serverAddress = process.env.SERVER_ADDRESS || "http://" + address + ":3001";
var socketAddress = process.env.SOCKET_ADDRESS || "http://" + address + ":8000";
var socket;
// Login to API to get auth token
serverAuth.loginToApi(serverAddress).then(function (v) {
    socket = socket_io_client_1["default"].connect(socketAddress + "/" + serverAuth.gbId, {
        query: { role: "gb", username: serverAuth.username, password: serverAuth.password, ipAddress: ipAddress }
    });
    socket.on("action", function (msg) {
        actionHandler.handleActions(msg.type, msg.data);
    });
    gbService.publishDataToSockets(socket);
});
