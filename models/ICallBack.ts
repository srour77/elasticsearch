interface ICallBack {
    callback(code: string): Promise<{accessToken: string, userToken: string}>;
}

export default ICallBack