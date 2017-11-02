const createBookshelf = require('bookshelf')

module.exports = function createModels(knex) {
  const bookshelf = createBookshelf(knex)

  const Image = bookshelf.Model.extend({
    tableName: 'images',
  })

  const Item = bookshelf.Model.extend({
    tableName: 'items',
  })

  return {
    Image,
    Item,
  }
}
