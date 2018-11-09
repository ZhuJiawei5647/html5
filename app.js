const express = require('express')
const app = express()
const http = require('http').createServer(app)
const videoRouter = require('./router/video.router.js')
const imageRouter = require('./router/image.router.js')

app.use(videoRouter)
app.use(imageRouter)

app.get('/', function (req, res) {
	console.log(1)
	res.send('hello world')
})

http.listen(8088, () => {console.log('port :: 8088')})