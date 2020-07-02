const express = require('express')
const app = express()
const port = 80
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket('gs://ops-lab-example/')
const fs = require('fs')
const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  database: 'postgres',
  port: 5432,
  user: 'lab',
  password: 'lab',
})


app.get('/', (req, res) => res.send('Hello World!'))
app.get('/add-file', function (req, res) {
  const filename = req.query.filename
  const fileContents = req.query.fileContents

  fs.writeFile(filename, fileContents, function (err, data) {
    if (err) return console.log(err)
    console.log(data)

    async function uploadFile() {
      // Uploads a local file to the bucket
      await bucket.upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: 'public, max-age=31536000',
        },
      })
    
      console.log(`${filename} uploaded.`)
    }
    
    uploadFile().catch(console.error)
    
  })

  res.send(`filename: ${filename}, File Contents: ${fileContents}`)
})

app.get('/read-file', function (req, res) {
  const filePath = './downloads/'
  const filename = req.query.filename
  const destFilename = filePath + filename

  async function downloadFile() {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: destFilename,
    }
  
    // Downloads the file
    await bucket.file(filename).download(options)
  
    console.log(
      `${filename} downloaded to ${destFilename}.`
    )

    fs.readFile(destFilename, (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('data: ', data)
      res.send(`Fine Contents: ${data}`)
    })
    
  }
  
  downloadFile().catch(console.error)
  
})

app.get('/add-message', function (req, res) {
  const message = req.query.message
  const query = `INSERT INTO messages(message_text) VALUES(${message});`

  client.connect()
  client.query(query, (err, res) => {
    client.end()
  })
  
  res.send(message)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
