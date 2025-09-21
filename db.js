// simple Knex + SQLite setup
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: './data.sqlite' },
  useNullAsDefault: true
})

async function init(){
  const exists = await knex.schema.hasTable('markers')
  if(!exists){
    await knex.schema.createTable('markers', t=>{
      t.increments('id')
      t.string('title')
      t.text('description')
      t.float('lat')
      t.float('lng')
      t.string('photo')
      t.integer('user_id').nullable()
      t.timestamp('created_at').defaultTo(knex.fn.now())
    })
  }
  const u = await knex.schema.hasTable('users')
  if(!u){
    await knex.schema.createTable('users', t=>{
      t.increments('id')
      t.string('email').unique()
      t.string('password')
      t.string('name')
    })
  }
}

module.exports = { knex, init }
