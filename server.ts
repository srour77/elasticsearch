import dotenv from 'dotenv'
dotenv.config()
import exress from 'express'
import ElasticSearchDataStore from './models/ElasticSearchDataStore'
import jwt from 'jsonwebtoken'
import { v4 } from 'uuid'
import SignFactory from './models/signFactory'
import callbackFactory from './models/callbackFactory'

const app = exress()
app.use(exress.json())

const engine = new ElasticSearchDataStore()

app.post('/user/signup', async(req, res, next) => {
    const { userName } = req.body
    if(userName === undefined || typeof userName !== 'string') return res.status(400).json({message: 'user name must be provided'})
    if(await engine.getUserByUserName(userName)) return res.status(200).json({ message: 'user already exist', status: false })

    await engine.createUser({ userName, id: v4() })
    res.status(201).json({ message: 'success', status: true })
})

app.post('/auth/login', async(req, res, next) => {
    const { platform, userName } = req.query
    if(userName === undefined || typeof userName !== 'string') return res.status(400).json({message: 'user name must be provided'})

    if(!await engine.getUserByUserName(userName)) return res.status(200).json({ message: 'no such user with this username', status: false })

    const strategy = SignFactory(platform as string)
    if(!strategy) res.status(200).json({ message: 'login with this platform is not supported', status: false })

    res.redirect(strategy.signin(userName))
})

app.get('/auth/callback/:platform/:userName', async(req, res, next) => {
    const { query: { code }, params: { platform, userName } } = req
    
    const { accessToken, userToken } = await callbackFactory(platform).callback(code as string)

    const { sub, preferred_username } = jwt.decode(userToken) as { sub: string, preferred_username: string }

    await engine.updateLinkedAccount(userName, { platform, accessToken, emailAddress: preferred_username, subId: sub })
    
    res.status(200).json({ message:'logged in', status: true })
})

app.use((req, res, next) => {
    res.status(404).json({ message: 'no such resource found', status: false })
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ message: 'something went wrong, pls try again', status: false })
})

app.listen(3000, () => console.log('server is now running'))