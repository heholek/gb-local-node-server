import * as ROSLIB from "roslib";
import { BehaviorSubject, Observable, Subject } from "rxjs";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class GbService {

    // If the Gb is connected
    public connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // ROS object
    private ros: any;

    /**
     * List of subscriber information that is later initialized
     */
      // TODO Add the following:
      // gb_camera stream, /gps/filtered/odom ,
    private topicInformation = [
        {key: "test", name: "/test", messageType: "std_msgs/UInt8"},
        {key: "rwheel_encoder", name: "/rwheel_encoder", messageType: "std_msgs/UInt32"},
        {key: "lwheel_encoder", name: "/rwheel_encoder", messageType: "std_msgs/UInt32"},
        {key: "distance_front", name: "/distance/front", messageType: "std_msgs/Float64"},
        {key: "distance_rear", name: "/distance/rear", messageType: "std_msgs/Float64"},
        {key: "distance_right", name: "/distance/right", messageType: "std_msgs/Float64"},
        {key: "distance_left", name: "/distance/left", messageType: "std_msgs/Float64"},
        {key: "distance_bottom", name: "/distance/bottom", messageType: "std_msgs/Float64"},
        {key: "position", name: "/gps", messageType: "sensor_msgs/NavSatFix"},
        {key: "speed", name: "/gps/speed", messageType: "std_msgs/Float64"},
        {key: "angle", name: "/gps/angle", messageType: "std_msgs/Float64"},
        {key: "number_of_satellites", name: "/gps/satellites", messageType: "std_msgs/UInt32"},
        {key: "camera", name: "/camera/camera/image_mono/compressed", messageType: "sensor_msgs/CompressedImage"},
        {key: "move", name: "/joy/cmd_vel", messageType: "geometry_msgs/Twist"},
        {key: "joy", name:"/joy", messageType: "sensor_msgs/Joy"},
    ];

    // list of topic keys and ROS subscribers
    private _topicMap: Map<string, RosSubscriber>;

    constructor( ) {
        this._topicMap = new Map();
        this.initializeRosConnection();
        this.initializeRov();
    }

    get topicMap() {
        return this._topicMap;
    }

    /**
     * Initialize ROS connected, listen for ROS connection, error, and close
     */
    public initializeRosConnection(): boolean {
        this.attemptConnection(10).then(r => {
            console.log("Check if ROS is running and restart server");
        });
        this.ros.on("close", () => {this.connected.next(false)});
        return true
    }

    private attemptConnection(n: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.ros = new ROSLIB.Ros({
                url: "ws://localhost:9090",
            });
            this.ros.on("error", (e: any) => {
                console.log("ROS connection failed! Attemtping " + n + " more times!");
                if (n <= 1) {
                    resolve(false);
                } else {
                    delay(7000).then(v => {
                        this.attemptConnection(n - 1).then(r  => { });
                    })
                }
            });
            this.ros.on("connection", () => {
                resolve(true);
                this.connected.next(true);
            });
        });
    }


    /**
     * Initialize all the ROV ROS Subscribers
     */
    public initializeRov(): boolean {
        // Iterate through all the ROS topics, creating a new RosSubscriber object to emit to sockets
        for (const topic of this.topicInformation) {
            this._topicMap.set(topic.key, new RosSubscriber(topic.name, topic.messageType, this.ros));
         }
        return true;
    }

    // Transfer data from each ROS subscriber to a socket
    public publishDataToSockets(socket: any) {
        this._topicMap.forEach((rosTopic, keyOfRosTopic, map) =>{
            this.rosToSocket(rosTopic, keyOfRosTopic, map, socket)
        })
    }

    // Emit ROS data to a socket
    private rosToSocket(ros: RosSubscriber, socketChannel: string, map: Map<string, RosSubscriber>, socket: any) {
        ros.data.subscribe((v: any) => {
            socket.emit(socketChannel, v);
        })
    }
}

/**
 * Generic ROS subscriber
 * @param topicName: string- Topic topicName
 * @param messageType: string - i.e. 'vector_drive/thrusterPercents'
 * @param ROS - initialized ros object
 */
export class RosSubscriber {

    private _data: Subject<any>;
    private lastValue: any;
    private topic: any;

    constructor(
        private  topicName: string,
        private messageType: string,
        private ros: any,
    ) {
        this._data = new Subject<any>();
        this.initialize();
    }

    /**
     * Initialize the ROS connection using the information passed in
     */
    public initialize() {
        // Create new topic object
        this.topic = new ROSLIB.Topic({
            ros: this.ros,
            name: this.topicName,
            messageType: this.messageType,
        });

        // Subscribe to data and pass it to the data subject
        this.topic.subscribe((message: any) => {
            this._data.next(message);
        });
    }

    /**
     * Publish data
     * @param data - Object representing completed ROS message object
     */
    public publish(data: any): boolean {
        // console.log(data);
        // Check for repeat data
        if (data !== this.lastValue) {
            const message = new ROSLIB.Message(data);
            this.lastValue = message;
            this.topic.publish(message);
        }
        return true;
    }

    // Unsubscribe from the ROS connection
    public unsubscribe() {
        this.topic.unsubscribe();
    }

    /**
     * Returns Data as observable
     */
    get data(): Observable<any> {
        return this._data.asObservable();
    }
}
