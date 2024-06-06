interface ISignable {
    url: string; options: string; callback: string
    signin(userName: string): string;
}

export default ISignable