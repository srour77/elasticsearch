import ICallBack from "./ICallBack";
import config from "../config/config";
import axios from "axios";

class OutLookCallback implements ICallBack {
    async callback(code: string): Promise<{accessToken: string, userToken: string}> {
        const platformConfig = config.platforms.outlook

        const { data: { access_token, id_token } } = await axios.post(platformConfig.tokenUrl, {
            client_id: platformConfig.clientId,
            client_secret: platformConfig.clientSecret,
            code,
            redirect_uri: 'localhost:3000/safe',
            grant_type: 'authorization_code'
        })

        return { accessToken: access_token, userToken: id_token }
    }
}

export default OutLookCallback