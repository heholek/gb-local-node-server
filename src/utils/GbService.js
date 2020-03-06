"use strict";
exports.__esModule = true;
var ROSLIB = require("roslib");
var rxjs_1 = require("rxjs");
var delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
var GbService = /** @class */ (function () {
    function GbService() {
        // If the Gb is connected
        this.connected = new rxjs_1.BehaviorSubject(false);
        /**
         * List of subscriber information that is later initialized
         */
        // TODO Add the following:
        // gb_camera stream, /gps/filtered/odom ,
        this.topicInformation = [
            { key: "test", name: "/test", messageType: "std_msgs/UInt8" },
            { key: "rwheel_encoder", name: "/rwheel_encoder", messageType: "std_msgs/UInt32" },
            { key: "lwheel_encoder", name: "/rwheel_encoder", messageType: "std_msgs/UInt32" },
            { key: "distance_front", name: "/distance/front", messageType: "std_msgs/Float64" },
            { key: "distance_rear", name: "/distance/rear", messageType: "std_msgs/Float64" },
            { key: "distance_right", name: "/distance/right", messageType: "std_msgs/Float64" },
            { key: "distance_left", name: "/distance/left", messageType: "std_msgs/Float64" },
            { key: "distance_bottom", name: "/distance/bottom", messageType: "std_msgs/Float64" },
            { key: "position", name: "/gps", messageType: "sensor_msgs/NavSatFix" },
            { key: "speed", name: "/gps/speed", messageType: "std_msgs/Float64" },
            { key: "angle", name: "/gps/angle", messageType: "std_msgs/Float64" },
            { key: "number_of_satellites", name: "/gps/satellites", messageType: "std_msgs/UInt32" },
            { key: "camera", name: "/camera/camera/image_mono/compressed", messageType: "sensor_msgs/CompressedImage" },
            { key: "move", name: "/joy/cmd_vel", messageType: "geometry_msgs/Twist" },
            { key: "joy", name: "/joy", messageType: "sensor_msgs/Joy" },
        ];
        this._topicMap = new Map();
        this.initializeRosConnection();
        this.initializeRov();
    }
    Object.defineProperty(GbService.prototype, "topicMap", {
        get: function () {
            return this._topicMap;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Initialize ROS connected, listen for ROS connection, error, and close
     */
    GbService.prototype.initializeRosConnection = function () {
        var _this = this;
        this.attemptConnection(10).then(function (r) {
            console.log("Check if ROS is running and restart server");
        });
        this.ros.on("close", function () { _this.connected.next(false); });
        return true;
    };
    GbService.prototype.attemptConnection = function (n) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ros = new ROSLIB.Ros({
                url: "ws://localhost:9090"
            });
            _this.ros.on("error", function (e) {
                console.log("ROS connection failed! Attemtping " + n + " more times!");
                if (n <= 1) {
                    resolve(false);
                }
                else {
                    delay(7000).then(function (v) {
                        _this.attemptConnection(n - 1).then(function (r) { });
                    });
                }
            });
            _this.ros.on("connection", function () {
                resolve(true);
                _this.connected.next(true);
            });
        });
    };
    /**
     * Initialize all the ROV ROS Subscribers
     */
    GbService.prototype.initializeRov = function () {
        // Iterate through all the ROS topics, creating a new RosSubscriber object to emit to sockets
        for (var _i = 0, _a = this.topicInformation; _i < _a.length; _i++) {
            var topic = _a[_i];
            this._topicMap.set(topic.key, new RosSubscriber(topic.name, topic.messageType, this.ros));
        }
        return true;
    };
    // Transfer data from each ROS subscriber to a socket
    GbService.prototype.publishDataToSockets = function (socket) {
        var _this = this;
        this._topicMap.forEach(function (rosTopic, keyOfRosTopic, map) {
            _this.rosToSocket(rosTopic, keyOfRosTopic, map, socket);
        });
    };
    // Emit ROS data to a socket
    GbService.prototype.rosToSocket = function (ros, socketChannel, map, socket) {
        ros.data.subscribe(function (v) {
            socket.emit(socketChannel, v);
        });
    };
    return GbService;
}());
exports.GbService = GbService;
/**
 * Generic ROS subscriber
 * @param topicName: string- Topic topicName
 * @param messageType: string - i.e. 'vector_drive/thrusterPercents'
 * @param ROS - initialized ros object
 */
var RosSubscriber = /** @class */ (function () {
    function RosSubscriber(topicName, messageType, ros) {
        this.topicName = topicName;
        this.messageType = messageType;
        this.ros = ros;
        this._data = new rxjs_1.Subject();
        this.initialize();
    }
    /**
     * Initialize the ROS connection using the information passed in
     */
    RosSubscriber.prototype.initialize = function () {
        var _this = this;
        // Create new topic object
        this.topic = new ROSLIB.Topic({
            ros: this.ros,
            name: this.topicName,
            messageType: this.messageType
        });
        // Subscribe to data and pass it to the data subject
        this.topic.subscribe(function (message) {
            _this._data.next(message);
        });
    };
    /**
     * Publish data
     * @param data - Object representing completed ROS message object
     */
    RosSubscriber.prototype.publish = function (data) {
        // console.log(data);
        // Check for repeat data
        if (data !== this.lastValue) {
            var message = new ROSLIB.Message(data);
            this.lastValue = message;
            this.topic.publish(message);
        }
        return true;
    };
    // Unsubscribe from the ROS connection
    RosSubscriber.prototype.unsubscribe = function () {
        this.topic.unsubscribe();
    };
    Object.defineProperty(RosSubscriber.prototype, "data", {
        /**
         * Returns Data as observable
         */
        get: function () {
            return this._data.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    return RosSubscriber;
}());
exports.RosSubscriber = RosSubscriber;
