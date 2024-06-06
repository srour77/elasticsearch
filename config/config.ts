const config = {
    platforms: {
        outlook: {
            clientId: process.env.OUTLOOK_CLIENT_ID,
            clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
            authUrl: process.env.OUTLOOK_AUTH_URL,
            tokenUrl: process.env.OUTLOOK_TOKEN_URL
        }
    }
}

export default config