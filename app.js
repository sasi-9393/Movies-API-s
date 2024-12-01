let express = require('express')
let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let path = require('path')
let db_path = path.join(__dirname, 'moviesData.db')
let db = null
let app = express()
app.use(express.json())

let initializeserverAndDb = async () => {
  db = await open({
    filename: db_path,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => {
    console.log('Server started running at http://localhost:3000/')
  })
}

initializeserverAndDb()

let convertName = each => {
  return {
    movieName: each.movie_name,
  }
}

let singleMovie = each => {
  return {
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  }
}
let covertDirector = each => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  }
}
// API 1

app.get('/movies/', async (request, response) => {
  let movies = `select movie_name from movie order by movie_id;`
  let allMovies = await db.all(movies)
  response.send(allMovies.map(each => convertName(each)))
})

// API 2

app.post('/movies/', async (request, response) => {
  let {directorId, movieName, leadActor} = request.body
  let insertMov = `insert into movie(director_id,movie_name,lead_actor)
  values(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  await db.run(insertMov)
  response.send('Movie Successfully Added')
})

// API 3

app.get('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let movieQue = `select * from movie where movie_id = ${movieId};`
  let movieOp = await db.get(movieQue)
  response.send({
    movieId: movieOp.movie_id,
    directorId: movieOp.director_id,
    movieName: movieOp.movie_name,
    leadActor: movieOp.lead_actor,
  })
})

//API 4

app.put('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let {directorId, movieName, leadActor} = request.body
  let putQuery = `update movie set 
  director_id =${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  where movie_id=${movieId};`
  await db.run(putQuery)
  response.send('Movie Details Updated')
})

// API 5

app.delete('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let deleteQue = `delete from movie where movie_id =${movieId};`
  await db.run(deleteQue)
  response.send('Movie Removed')
})

// API 6

app.get('/directors/', async (request, response) => {
  let directors = `select * from director order by director_id;`
  let allDirectors = await db.all(directors)
  response.send(allDirectors.map(each => covertDirector(each)))
})

//

app.get('/directors/:directorId/movies/', async (request, response) => {
  let {directorId} = request.params
  let finalQuery = `select movie_name from movie where director_id=${directorId};`
  let finalRes = await db.all(finalQuery)
  response.send(finalRes.map(each => singleMovie(each)))
})
module.exports=app;