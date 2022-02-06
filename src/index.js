import express from 'express'
import bodyParser from 'body-parser'
import routes from './routes.js'
import cors from 'cors'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({origin: 'http://localhost:8080'}))

app.use('/api', routes)

app.listen(3000, () => {
    console.log('The server must go on...')
})
