const projections = require('./projections')

function createCommands(store) {
  function recordItem(id, description, amount, correlationId) {
    const stream = `item:${id}`
    const item = store.fetch(stream, projections.item)

    if (Object.keys(item).length === 0) return Promise.resolve(true)

    const event = {
      type: 'itemRecorded',
      correlation_id: correlationId,
      payload: { description, amount },
    }

    return store.emit(stream, event)
  }

  // Sketch of a function for reimbursing items
  // function reimburseItem(id, correlationId) {
  //   const stream = `items-${id}`
  //   const item = store.fetch(stream, projections.item)

  //   if (!item) return Promise.resolve(true)
  //   if (item.isReimbursed) return Promise.resolve(true)

  //   // Emit an event about the reimbursement.
  //   // Maybe that even gets picked up by some service that moves money around
  // }

  function uploadImage(id, url, correlationId) {
    const stream = `item:${id}`
    const item = store.fetch(stream, projections.item)

    if (Object.keys(item).length === 0) return Promise.resolve(true)

    const event = {
      type: 'imageUploaded',
      correlation_id: correlationId,
      payload: { url },
    }

    return store.emit(stream, event)
  }

  return {
    recordItem,
    uploadImage,
  }
}

module.exports = createCommands
