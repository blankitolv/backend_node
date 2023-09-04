/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

import express from 'express'

import routerProducts from './routes/products.js'

import routerCarts from './routes/carts.js'

const PORT = process.env.PORT || 8080;



const app = express();

app.use(express.json())

app.use((express.urlencoded({extended:true})))

app.use(express.static('./src/public'))

// routes
app.use('/api/products',routerProducts)
app.use('/api/carts',routerCarts)
// app.use('*',(req,res)=>{
//   console.log("no existe el url")
// })

app.listen(PORT,()=>{
  console.log ("Creando y abriendo archivos necesarios...")
  setTimeout(()=>{
    console.log (`Listening on port: ${PORT}\n`)
  },1000)
})