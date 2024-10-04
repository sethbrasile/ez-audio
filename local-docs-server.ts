import http from 'node:http'
import url from 'node:url'
import { access, constants, readFile, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || '8000'

const Console = console

// maps file extention to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
}

http.createServer((req, res) => {
  Console.info(`${req.method} ${req.url}`)

  const parsedUrl = new url.URL(req.url || '/', `http://${req.headers.host}`)
  const sanitizePath = path.normalize(parsedUrl.pathname || '').replace('/ez-web-audio/docs', '').replace(/^(\.\.[/\\])+/, '')
  let pathname = path.join(process.cwd(), 'docs', sanitizePath)

  access(pathname, constants.F_OK, (err) => {
    if (err) {
      // if the file is not found, return 404
      res.statusCode = 404
      res.end(`File ${pathname} not found!`)
      return
    }

    // if is a directory, then look for index.html
    if (statSync(pathname).isDirectory()) {
      pathname += '/index.html'
    }

    // read file from file system
    readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500
        res.end(`Error getting the file: ${err}.`)
      }
      else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext as keyof typeof mimeType
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain')
        res.end(data)
      }
    })
  })
}).listen(Number.parseInt(port))

Console.log(`Server listening on port ${port}`)
