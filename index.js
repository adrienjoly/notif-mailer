var http = require('http')
var connect = require('connect')

var PORT = process.env.PORT || 8080

var app = connect()
app.use('/', function(req, res){
  res.end('yeah this is running')
})

http.createServer(app).listen(PORT);
console.log('dummy web server listing on port', PORT)
