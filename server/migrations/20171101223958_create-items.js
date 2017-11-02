exports.up = function up(knex) {
  return knex.schema.createTable('items', table => {
    table.string('id').primary()
    table.string('description')
    table.float('amount')
    table.timestamps
  })
}

exports.down = knex => knex.schema.dropTable('items')
