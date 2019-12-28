import * as ROSLIB from "roslib";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export class GbService {

    public connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readonly ros: any;

    /**
     * List of subscriber information that is later initialized
     */
    private topicInformation = [
        {key: "test", name: "/test", messageType: "std_msgs/UInt8"},
    ];

    private topicMap: Map<string, RosSubscriber>;

    constructor( ) {
        this.ros = new ROSLIB.Ros({
            url: "ws://localhost:9090",
        });
        this.topicMap = new Map();
        this.initializeRosConnection();
        this.initializeRov();
    }

    public initializeRosConnection(): boolean {
        this.ros.on("error", (e: any) => {
            console.log(e);
            // TODO Alert User
        });
        this.ros.on("connection", () => {
            this.connected.next(true);
            // TODO Alert
        });
        this.ros.on("close", () => {this.connected.next(false)});
        return true
    }

    public initializeRov(): boolean {
        /**
         * Initializes all ROS connections
         */

        for (const topic of this.topicInformation) {
            this.topicMap.set(topic.key, new RosSubscriber(topic.name, topic.messageType, this.ros));
         }
        return true;
    }
    //
    // publishTopic(key, data): void {
    //     this.subscribers.find(o => o.key === key).publish(data);
    // }
    //
    // subscribeTopic(key): Observable<any> {
    //     return this.subscribers.find(key).data;
    // }

    public topic(key: string) {
        return this.topicMap.get(key);
    }

    // TOPIC Subscribers
}

/**
 * Generic ROS subscriber
 * @param name: string- Topic name
 * @param messageType: string - i.e. 'vector_drive/thrusterPercents'
 * @param ROS - initialized ros object
 */
export class RosSubscriber {

    private _data: Subject<any>;
    private lastValue: any;
    private topic: any;

    constructor(
        private  name: string,
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
        this.topic = new ROSLIB.Topic({
            ros: this.ros,
            name: this.name,
            messageType: this.messageType,
        });

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
        if (data !== this.lastValue) {
            const message = new ROSLIB.Message(data);
            this.lastValue = message;
            this.topic.publish(message);
        }
        return true;
    }

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
