exports.up = function up(knex) {
  return knex.schema.createTable('images', table => {
    table.increments()
    table.string('item_id')
    table.timestamps
  })
}

exports.down = knex => knex.schema.dropTable('images')
