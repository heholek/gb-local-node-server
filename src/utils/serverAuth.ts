import axios from "axios";

export class ServerAuth {
    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get authToken(): number | undefined {
        return this._authToken;
    }

    set authToken(value: number | undefined) {
        this._authToken = value;
    }

    get userId(): number | undefined {
        return this._userId;
    }

    set userId(value: number | undefined) {
        this._userId = value;
    }

    private _username: string = "gb1";
    private _password: string = "gb";
    private _authToken: number | undefined;
    private _userId: number | undefined;

    /**
     * Login to API, sets token and userid of the bot
     * @param hostname
     * @param port
     */
    public loginToApi(hostname: string = "localhost", port: number = 3001) {
        axios.post(`${hostname}:${port}/auth/login`, {
            username: this._username,
            password: this._password
        })
            .then((res: any) => {
                this._authToken = res.token;
                this._userId = res.user;
            })
            .catch((err: any) => {
                console.error("Can't connect to Server!");
            })
    }
}
