// A very simple event store

function project(events, projection) {
  return events.reduce((prev, event) => projection[event.type](prev, event), {})
}

function createStore(knex) {
  function emit(stream, event) {
    const [streamType, streamId] = stream.split(':')

    const emitMe = { ...event, stream_type: streamType, stream_id: streamId }

    return knex('events').insert(emitMe)
  }

  function fetch(stream, projection) {
    const [streamType, streamId] = stream.split(':')
    const constraints = { stream_type: streamType, stream_id: streamId }

    return knex('events')
      .where(constraints)
      .then(events => project(events, projection))
  }

  return { emit, fetch }
}

module.exports = createStore
