/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

const express = require ('express')
const ProductManager = require('./entregable2.js')

app = express();

const PORT = process.env.PORT || 8088;

app.use((express.urlencoded({extended:true})))

const productM = new ProductManager();
const Response = require('./errorMessages.js')
// solicita productos del sistema [verificado]
app.get('/products', async(req,res)=>{
  // creo una instancia de mi sistema de respuesta
  let r = new Response()

  // solicito todos los productos
  let productos = await productM.getProducts()
  
  if (productos.error) {
    res.status(500).json(r.internalServerError(productos.error));
  }


  // verifico si tiene query params de limite de resultados
  // y altera el arreglo de productos
  if (req.query.limit) {
    const limit = parseInt(req.query.limit)
    productos = productos.slice(0,limit)
  }


  // retorna el arreglo de productos
  res.status(200).json(r.ok(productos));
})

// solicita un producto por numero de id [verificado]
app.get('/products/:pid', async(req,res)=>{
  // creo una instancia de mi sistema de respuesta
  let r = new Response()  
  
  // parseo el id de param para validar tipo de dato
  const pid = parseInt(req.params.pid);
  
  // valido que sea un número y que sea mayor o igual a 0
  // console.log("isNaN", isNaN(pid))
  if (pid<=0 || isNaN(pid) ){
    res.status(400).json(r.badRequest());
    return
  }
  
  // solicito el producto por id
  const product = await productM.getProductById(pid)
  
  // si retorna un mensaje, el producto no existe
  if (product.message) {
    res.status(404).json(r.notFound(product.message));
    return 
  }

  // si retorna un error es interno del sistema
  if (product.error) {
    res.status(500).json(r.internalServerError(product.error));
  }

  // si pasó por todos los filtros y validaciones, retorna product
  res.status(200).json(r.ok(product))

})

// si no existe el url
app.all('*', (req,res)=>{
  // creo una instancia de mi sistema de respuesta
  let r = new Response()
  res.status(418).json(r.teaPot("I'm a teapot ~ URL NOT EXIST"))
})

app.listen(PORT,()=>{
  console.log (`Listening on port: ${PORT} http://localhost:${PORT}`)
})