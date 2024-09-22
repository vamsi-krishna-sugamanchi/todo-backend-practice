const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

module.exports = app
const dbpath = path.join(__dirname, 'todoApplication.db')

let db = null

const start_database_and_server = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('server is running on http://localhost/3000'),
    )
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
start_database_and_server()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

// const dbmoviename_to_response_moviename = object => {
//   return {
//     movieName: object.movie_name,
//   }
// }

// const dbplayers_to_response_players = object => {
//   return {
//     playerId: object.player_id,
//     playerName: object.player_name,
//   }
// }

// const dbaddmovie_to_response_addmovie = object => {
//   return {
//     movieId: object.movie_id,
//     directorId: object.director_id,
//     movieName: object.movie_name,
//     leadActor: object.lead_actor,
//   }
// }
////////  1  ////////
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND Status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

// app.get('/todos/', async (request, response) => {
//   const getAllToDoQuery = `select * from todo;`
//   const result = await db.get(getAllToDoQuery)
//   response.send('Movie Successfully Added')
// })
/////  2  /////
app.get(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const todoQuery = `select * from todo where id=${todoId};`
  const result = await db.get(todoQuery)
  console.log(result)
  response.send(result)
})
///////  3  ////////
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const movienameQuery = `INSERT INTO todo (id, todo, priority, status) VALUES(${id},'${todo}','${priority}','${status}');`

  await db.run(movienameQuery)
  // console.log(result)
  response.send('Todo Successfully Added')
})
///////// 4  /////////
app.put(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const {todo, priority, status} = request.body
  let todoQuery = null
  let successText = ''
  switch (true) {
    case todo !== undefined:
      todoQuery = `UPDATE todo set todo='${todo}' where id=${todoId};`
      successText = 'Todo'
      break
    case priority !== undefined:
      todoQuery = `UPDATE todo set priority='${priority}' where id=${todoId};`
      successText = 'Priority'
      break
    case status !== undefined:
      todoQuery = `UPDATE todo set status='${status}' where id=${todoId};`
      successText = 'Status'
      break
  }
  await db.get(todoQuery)

  response.send(`${successText} Updated`)
})
///// 5///////
app.delete(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const todoQuery = `delete from todo where id=${todoId};`
  await db.get(todoQuery)

  response.send('Todo Deleted')
})
