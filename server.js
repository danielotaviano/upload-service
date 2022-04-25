const http = require('http');
const fs = require('fs')

const server = http.createServer()



server.on('request', (req, res) => {

  if (req.url === '/') {
    return res.end(fs.readFileSync('index.html'))
  }

  if (req.url === "/upload") {
    const fileName = req.headers["file-name"];
    req.on("data", chunk => {
      fs.appendFileSync(fileName, chunk)
      console.log(`received chunk! ${chunk.length}`)
    })
    return res.end("uploaded!")
  }

  // upload-complete generate hash and compare with front

})


server.listen(3000, function () {
  console.log('listening at :3000')
})