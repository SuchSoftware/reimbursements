const createBookshelf = require('bookshelf')
const createKnex = require('knex')

module.exports = function createModels(databaseUrl) {
  const knex = createKnex(databaseUrl)
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
