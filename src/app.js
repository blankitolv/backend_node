/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

import express from 'express'

import routerProducts from './routes/products.routes.js'

import routerProductsv2 from './routes/products.js'

import routerCarts from './routes/carts.routes.js'

import routerCartsv2 from './routes/carts.js'

import handlebars from 'express-handlebars'

import { __dirname, mongo_data } from './utils.js'

import path from 'path'

import viewRouter from './routes/views.router.js'

import { Server } from 'socket.io'

import { ProductManager } from './dao/fsmanager/clase.js'

import ProductManagerv2 from './dao/bdmanager/products.manager.js'

import mongoose from 'mongoose'

import { tiempo } from './utils.js'

import ChatManager from './dao/bdmanager/chat.manager.js'

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json())

app.use((express.urlencoded({extended:true})))

// WEBSOCKET AND MOUNTING HTTP SERVER
const httpServer = app.listen (PORT, ()=>{
  console.log ("listening on port: ",PORT);
})

mongoose.connect(mongo_data.get('cloud'))
.then(console.log ("connection with mongo"))
.catch(e => console.log ("error in connection DB: ",e.message))
.finally(()=> console.log ("MONGODB: running"))

let users = []
let public_messages = []
const chatM = new ChatManager();
export const socketServer = new Server(httpServer);
socketServer.on("connection",async socket =>{
  console.log ("nuevo usuario conectado: ",socket.id)

  // se genera desde el method POST product.js
  socket.on("new_products", data => {
    console.log("EMITE MENSAJE DE ACTUALIZACION DE PRODUCTO")
    socket.emit('new_products',data);
  })

  socket.on("signin", data =>{
    console.log (">> llego: ",data, socket.id);
    let status ="success";
    if (data.trim() == "") {
      status ="error";
    }
    const expresion = /[a-z0-9]+@[a-z0-9]+\.[a-z]+/;

    if (!expresion.test(data)){
      status="error";
    }

    if (status=="error") {
      socket.emit('logued', JSON.stringify({status}))
      return
    }

    users.push({conn:socket.id, username: data})
    
    socket.emit('logued', JSON.stringify(
      {
        status: 'success',
        user: {
          username: data,
          id: socket.id,
          aux: [] 
        }
      }
    ))
    socket.broadcast.emit("userLogged",JSON.stringify({data}))
  })



  socket.on('disconnect', () => {
    const user_disconected = users.filter(user => user.conn == socket.id)


    if (user_disconected.length == 0) {
      return
    }

    socketServer.emit('userDisconnected', user_disconected[0])
    users = users.filter(oneUser => oneUser.conn !== user_disconected[0].conn);
  })






  socket.on("new_messagev2", data =>{
    console.log (socket.id, "envió el mensaje: ",data);
    const this_user = users.filter(user => user.conn == socket.id)
    console.log ("FILTRO: ",this_user)
    if (this_user.length == 0) {
      return
    }

    // console.log ("USERNAME: ",this_user[0].username)
    // console.log ("MENSAJE: ",data)
    const msg = {username: this_user[0].username, message: data, timestamp:tiempo()}
    
    public_messages.push(msg)
    
    try {
      const resp = chatM.save({username: this_user[0].username, message: data })
      socketServer.emit("new_message_recibed", JSON.stringify(msg))
    } catch (error) {
      console.log("error guardando mensaje nuevo")
    }

  })

  socket.on("all_messages", async data => {
    try {
      const all = await chatM.getAll()
      socket.emit("historic_room_message", JSON.stringify(all))
      console.log ("SE ENVIA HISTORICO: ",all)
    } catch (error) {
      console.log ("error solicitando y enviando historico de mensajes en bd")
    }
  })
  socket.on("shakeit", data => {
    console.log ("se quiere sacudir a alguien: ", data);
    const shake_this = users.find((e) => e.username == data.user_to_shake);
    socket.to(shake_this.conn).emit("shake_yourself",users.find((e) => e.conn == socket.id))
  })
  
  // se genera desde el method DELETE product.js
  socket.on("del_product", data => {
    socket.emit('del_product',data);
  })

  // se llama desde public script.js 
  socket.on("message",async data => {
    console.log("se recibió mensaje: ",data)
    switch (data){
      case 'allProducts':
        const pm = new ProductManagerv2();
        try {
          const  all_prods = await pm.getAll();
          socket.emit('allProducts',all_prods)
        } catch (err) {
          console.log (err)
        }
        break;
      default:
        socket.emit('error',"ja... cualquiera...")
    }
  })
})


// WEBSOCKET AND MOUNTING HTTP SERVER

// agrego nuevas funcionalidades a handlebars
const hbs = handlebars.create({
  // isNC si tiene imagen la retorna y sino retorna una ficticia
  helpers: {
    isNC: function (value) {
      console.log ("viajo: ",value)
      console.log ("typeof: ",typeof value)
      const numeroRandom = Math.floor(Math.random() * 8) + 1;
      const numeroRandom2 = Math.floor(Math.random() * 8) + 1;
      return value.length === 0 ? `https://placedog.net/20${numeroRandom2}/30${numeroRandom}` : './img/'+value
    },
  // concatena dos palabras y las retorna
    concat: function (val1, val2){
      return `${val1}${val2}`;
    }
  },
});


app.engine('handlebars', hbs.engine);

app.set('views',path.join(__dirname,'views'));

app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname,'public')))


// routes
app.use('/', viewRouter);

app.use('/api/products',routerProducts);

app.use('/api/v2/products',routerProductsv2);

app.use('/api/carts',routerCarts);

app.use('/api/v2/carts',routerCartsv2);
