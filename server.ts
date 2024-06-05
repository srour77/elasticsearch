import dotenv from 'dotenv'
dotenv.config()
import exress from 'express'
import ElasticSearchDataStore from './models/ElasticSearchDataStore'
import { User } from './types/types'
import axios from 'axios'
import config from './config/config'
import jwt from 'jsonwebtoken'
import id from 'uuid'

const app = exress()
app.use(exress.json())

const engine = new ElasticSearchDataStore()

app.post('/user/signup', async(req, res, next) => {
    const user = req.body as User
    await engine.createUser(user)
    res.status(201).json({ message: 'success', status: true })
})

app.post('/auth/login', async(req, res, next) => {
    const platform = req.query.platform as string
    const platformConfig = config.platforms[platform]

    if(!platformConfig) res.status(200).json({ message: 'login with this platform is not supported', status: false })

    res.redirect(`${platformConfig.tokenUrl}?client_id=${platformConfig.clientId}&response_type=code&response_mode=query&scope=openid profile offline_access User.Read Mail.Read`)
})

app.get('/auth/callback/:platform', async(req, res, next) => {
    const { query: { code }, params: { platform } } = req
    const platformConfig = config.platforms[platform]

    if(!platformConfig) return res.status(400).json({ message: 'invalid request', status: false })

    const { data: { access_token, id_token } } = await axios.post(platformConfig.tokenUrl, {
        client_id: platformConfig.clientId,
        client_secret: platformConfig.clientSecret,
        code,
        redirect_uri: 'localhost:3000/safe',
        grant_type: 'authorization_code'
    })

    const { sub } = jwt.decode(id_token)
    const accountLinded = await engine.accountExists(sub as string)
    if(accountLinded) return res.status(200).json({ message: 'account already exists', status: false })

    // await engine.createUser({id: randomUUID(), })

    res.status(200).json({ message:'logged in', status: true })
})

app.get('/user/:id', async(req, res, next) => {
    const { id } = req.params
    const user = await engine.getUserById(id)
    res.status(200).json({ user })
})

app.use((req, res, next) => {
    res.status(404).json({ message: 'no such resource found', status: false })
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ message: 'something went wrong, pls try again', status: false })
})

app.listen(3000, () => console.log('server is now running'))

// 110252051