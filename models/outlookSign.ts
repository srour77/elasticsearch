import ISignable from "./ISignable";
import config from "../config/config";

class OutLookSign implements ISignable {
    url: string; options: string; callback: string

    constructor() {
        this.url = config.platforms.outlook.authUrl
        this.callback = `${process.env.CALLBACK_URL}/outlook`
        this.options = `${config.platforms.outlook.clientId}&response_type=code&response_mode=query&scope=openid profile offline_access User.Read Mail.Read`
    }

    signin(userName: string): string {
        return `${this.url}?${this.options}&${this.callback}/${userName}`
    }
}

export default OutLookSign