import axios from "axios";

export class ServerAuth {
    get username(): string {
        return this._username;
    }

    get password(): string {
        return this._password;
    }

    get gbId(): string {
        return this._gbId;
    }

    private _username: string = "gb1";
    private _password: string = "gb";
    private _authToken: number | undefined;
    private _gbId: string = "";

    /**
     * Login to API, sets token and userid of the bot
     * @param hostname
     * @param port
     */
    public async loginToApi(hostname: string = "http://localhost:3001") {
        return axios.post(`${hostname}/gb/login`, {
            username: this._username,
            password: this._password
        })
        .then((res: any) => {
            this._authToken = res.data.token;
            this._gbId = res.data.gb._id;
            return true;
        })
        .catch((err: any) => {
            console.error("Can't connect to Server! " + err);
            return false;
        })
    }

    // public async loginRetry(n: number, hostname?: string) {
    //     for (let i = 0; i < n; i++) {
    //         const t = setTimeout(() => {
    //             this.loginToApi(hostname).then(value => {
    //                 if (value) {
    //                     i=n;
    //                     clearTimeout(t);
    //                 } else {
    //                     console.log("Will try " + (n-i) + " more times");
    //                 }
    //             });
    //         }, i*i*5000)
    //     }
    // };
}
