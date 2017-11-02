const projections = require('./projections')

function createQueries(knex, store) {
  function allItems() {
    // Get all the buttons
    return knex('events')
      .distinct('stream_id')
      .then(streamIds => streamIds.map(sid => sid.stream_id))
      .then(streamIds =>
        Promise.all(
          streamIds.map(sid => store.fetch(`item:${sid}`, projections.item)),
        ),
      )
  }

  return { allItems }
}

module.exports = createQueries
