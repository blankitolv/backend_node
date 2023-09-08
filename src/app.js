/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

import express from 'express'

import routerProducts from './routes/products.js'

import routerCarts from './routes/carts.js'

import handlebars from 'express-handlebars'

import { __dirname } from './utils.js'

import path from 'path'

import viewRouter from './routes/views.router.js'

import { Server } from 'socket.io'

import { ProductManager } from './clase.js'


const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json())

app.use((express.urlencoded({extended:true})))

// WEBSOCKET AND MOUNTING HTTP SERVER
const httpServer = app.listen (PORT, ()=>{
  console.log ("listening on port: ",PORT);
})


export const socketServer = new Server(httpServer);
socketServer.on("connection",async socket =>{
  console.log ("nuevo usuario conectado: ",socket.id)

  socket.on("new_products", data => {
    socket.emit('new_products',data);
  })

  socket.on("del_product", data => {
    socket.emit('del_product',data);
  })

  socket.on("message",async data => {
    console.log("se recibió mensaje: ",data)
    switch (data){
      case 'allProducts':
        const pm = new ProductManager();
        const  all_prods = await pm.getProducts();
        socket.emit('allProducts',all_prods)
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
      const numeroRandom = Math.floor(Math.random() * 8) + 1;
      const numeroRandom2 = Math.floor(Math.random() * 8) + 1;
      return value === 'N/C' ? `https://placedog.net/20${numeroRandom2}/30${numeroRandom}` : './img/'+value
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

app.use('/api/carts',routerCarts);
