/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

// recursos de terceros
import express from 'express'

import handlebars from 'express-handlebars'

import path from 'path'

import mongoose from 'mongoose'

import { Server } from 'socket.io'

// import session from 'express-session';

// import MongoStore from 'connect-mongo'

import passport from 'passport'

// import flash from 'express-flash'


// mis recursos


import { __dirname, mongo_data, charge_products } from './utils.js'

// import { charge_products } from './utils.js'

import initPassport from './config/passport.config.js'


// routers
import ViewsRouter from './routes/WEB/views.router.js'

import CartRouter from './routes/API/carts.routes.js'

// routerProducts
import ProductRouter from './routes/API/products.routes.js'

import UsersRouter from './routes/API/users.routes.js'

import Sockets from './sockets/sockets.js'


const PORT = process.env.PORT || 8080;

const app = express();

const viewRouter = new ViewsRouter();
const cartRouter = new CartRouter();
const productRouter = new ProductRouter();
const usersRouter = new UsersRouter();


app.use(express.json())

app.use((express.urlencoded({extended:true})))

// WEBSOCKET AND MOUNTING HTTP SERVER
const httpServer = app.listen (PORT, ()=>{
  console.log ("listening on port: ",PORT);
  console.log("http://localhost:"+PORT);
})

const io = new Server(httpServer);

app.set('socketio',io);

Sockets(io);

const conn = mongo_data.get('local')
mongoose.connect(conn)
.then(() => console.log ("connection with mongo"))
.then(()=> console.log (" 💾 "+conn))
.catch(e => {
  console.log ("error in connection DB: ",e.message);
  console.log("Bye Bye 💋.");
  return
})
.finally(()=> console.log ("MONGODB: running"))

// inserta productos en bd
charge_products(false);

//middleware session cookie
// app.use(session({
//   store: MongoStore.create({
//       client: mongoose.connection.getClient(),
//       ttl: 3600, // time to live = TTL
//       name:"Notflix"
//   }),
//   secret: '¡Palabra-Super-Secreta!',
//   resave: true,
//   saveUninitialized: true,
// }));



initPassport();

app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());



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
      if (value== undefined) {
        return `https://placedog.net/20${numeroRandom2}/30${numeroRandom}`
      }
      return value.length === 0 ? `https://placedog.net/20${numeroRandom2}/30${numeroRandom}` : '/img'+value
    },
  // concatena dos palabras y las retorna
    concat: function (val1, val2){
      return `http://localhost:${PORT}/${val1}/${val2}`;
    },
    sum_res: function (val, action) {
      return action == '+' ? val+1 : val-1
    },
    make_nav_li: function (num, actual) {
      console.log ("num")
      console.log (num)
      console.log ("actual")
      console.log (actual)
      let all = []
      for (let i=actual; i<= num; i++) {
        all.push(`<li class="page-item"><a class="page-link" href="http://localhost:8080/?page=${num}">${num}</a></li>`)
      }
      return all
    }
  },
});

app.locals.baseURL = "/";

app.engine('handlebars', hbs.engine);

app.set('views',path.join(__dirname,'views'));

app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname,'public')))
// app.use('/static',express.static(path.join(__dirname,'public')))

// routes
app.use('/', viewRouter.getRouter());

app.use('/api/products',productRouter.getRouter());

app.use('/api/carts',cartRouter.getRouter());

app.use('/api/users',usersRouter.getRouter());