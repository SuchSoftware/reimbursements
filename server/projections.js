exports.item = {
  imageUploaded(prev, event) {
    return {
      ...prev,
      id: event.stream_id,
      imageUrl: event.payload.url,
    }
  },

  itemRecorded(prev, event) {
    return {
      ...prev,
      description: event.payload.description,
      amount: event.payload.amount,
    }
  },
}
