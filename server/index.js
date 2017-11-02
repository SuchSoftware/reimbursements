const aws = require('aws-sdk')
const bodyParser = require('body-parser').json()
const express = require('express')
const createKnex = require('knex')
const uuid = require('node-uuid').v4

const createCommands = require('./commands')
const env = require('./env')
// const createModels = require('./models')
const createQueries = require('./queries')
const createStore = require('./store')

const app = express()
const knex = createKnex(env.databaseUrl)
const store = createStore(knex)
const commands = createCommands(store)
const queries = createQueries(knex, store)
// const models = createModels(knex)

aws.config.region = 'us-east-1'

app.use((req, res, next) => {
  req.context = { correlationId: uuid() }

  next()
})

// This is just a pure GET.  No state changes here.
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

// Receives notice when users have uploaded an image.  We want to record that
//   so that we can do things like deleting orphaned images.
app.route('/images').post(bodyParser, (req, res) => {
  // Issue a command rather than just manipulate a row in a database
  commands
    .uploadImage(req.body.id, req.body.url, req.context.correlationId)
    .then(() => res.send('ok'))
    .catch(() => res.status(400).send('not ok'))

  //   new models.Image({ item_id: req.body.id })
  //     .save()
  //     .then(() => {
  //       res.send('ok')
  //     })
  //     .catch(() => res.status(400).send('not ok'))
})

app
  .route('/items')
  .get((req, res) => {
    queries
      .allItems()
      .then(items => res.json({ items }))
      .catch(() => res.status(500).send('not ok'))

    // models.Item
    // .fetchAll()
    // .then(items =>
    //   res.json({ items: items.models.map(item => item.serialize()) }),
    // )
  })
  .post(bodyParser, (req, res) => {
    commands
      .recordItem(
        req.body.id,
        req.body.description,
        req.body.amount,
        req.context.correlationId,
      )
      .then(() => res.send('ok'))
      .catch(() => res.status(400).send('not ok'))

    // new models.Item(req.body)
    //   .save(null, { method: 'insert' })
    //   .then(() => {
    //     res.send('ok')
    //   })
    //   .catch(() => res.status(400).send('not ok'))
  })

// eslint-disable-next-line
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('error', err)
  res.status(500).send(err)
})

app.listen(env.port)

// I need projections and commands

// Commands
// Upload the image
// make sure the stream doesn't already exist
// Upload the rest of the thing
