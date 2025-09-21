require('dotenv').config()
const express = require('express')
const { knex, init } = require('./db')
const cors = require('cors')
const multer = require('multer')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors:{ origin:true } })

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// simple file upload
const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null,'uploads/'),
  filename: (req,file,cb)=> cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({ storage })

// init db
init().then(()=>console.log('DB ready'))

// public endpoints
app.get('/markers', async (req,res)=>{
  const rows = await knex('markers').select('*').orderBy('created_at','desc')
  res.json(rows)
})

app.post('/markers', async (req,res)=>{
  const { title, description, lat, lng } = req.body
  const [id] = await knex('markers').insert({ title, description, lat, lng })
  const m = await knex('markers').where({ id }).first()
  io.emit('marker:created', m)
  res.json(m)
})

app.post('/markers/:id/photo', upload.single('photo'), async (req,res)=>{
  const id = req.params.id
  const photoPath = '/uploads/' + req.file.filename
  await knex('markers').where({ id }).update({ photo: photoPath })
  const m = await knex('markers').where({ id }).first()
  io.emit('marker:updated', m)
  res.json(m)
})

// basic auth (register/login)
app.post('/auth/register', async (req,res)=>{
  const { email, password, name } = req.body
  const hash = await bcrypt.hash(password, 10)
  const [id] = await knex('users').insert({ email, password: hash, name })
  const user = await knex('users').where({ id }).first()
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret')
  res.json({ user:{ id:user.id, email:user.email, name:user.name }, token })
})
app.post('/auth/login', async (req,res)=>{
  const { email, password } = req.body
  const user = await knex('users').where({ email }).first()
  if(!user) return res.status(401).json({ error:'Invalid' })
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(401).json({ error:'Invalid' })
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret')
  res.json({ user:{ id:user.id, email:user.email, name:user.name }, token })
})

// WebSocket example
io.on('connection', socket => {
  console.log('socket connected', socket.id)
  socket.on('ping', d=> socket.emit('pong', d))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=> console.log('Server running on', PORT))
