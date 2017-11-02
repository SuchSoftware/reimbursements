const aws = require('aws-sdk')
const bodyParser = require('body-parser').json()
const express = require('express')

const env = require('./env')
const createModels = require('./models')

const app = express()
const models = createModels(env.databaseUrl)

aws.config.region = 'us-east-1'

app.route('/get-upload-url').get((req, res) => {
  const s3 = new aws.S3()
  const fileName = req.query.name
  const fileType = req.query.type
  const s3Params = {
    Bucket: env.bucket,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  }

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      return res.end()
    }
    const returnData = {
      signedRequest: data,
      url: `https://${env.bucket}.s3.amazonaws.com/${fileName}`,
    }
    return res.json({ data: returnData })
  })
})

app.route('/images').post(bodyParser, (req, res) => {
  // Receive the uploaded image and make a record of it
  // Need to get the body parser middleware
  new models.Image({ item_id: req.body.id })
    .save()
    .then(() => {
      res.send('ok')
    })
    .catch(() => res.status(400).send('not ok'))
})

app
  .route('/items')
  .get((req, res) => {
    models.Item
      .fetchAll()
      .then(items =>
        res.json({ items: items.models.map(item => item.serialize()) }),
      )
  })
  .post(bodyParser, (req, res) => {
    new models.Item(req.body)
      .save(null, { method: 'insert' })
      .then(() => {
        res.send('ok')
      })
      .catch(() => res.status(400).send('not ok'))
  })

// eslint-disable-next-line
app.use((err, req, res, next) => {
  res.status(500).send(err)
})

app.listen(env.port)

// [ ] Handle the receipt uploads
// [ ] Handle the rest of the metadata
// [ ] Handle marking something reimbursed
// [ ] Serve the built client

// When doing the command, be sure to highlight idempotence
