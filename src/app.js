const express = require ('express')
const ProductManager = require('./entregable2')

app = express();
const PORT = 8080;
app.use((express.urlencoded({extended:true})))
const productM = new ProductManager();
class Response {
  constructor() {
    this.msg = ""
    this.status = 0
    this.content
  }
  badRequest(){
    this.msg = "Bad request"
    this.status = 400
    this.content = {}
    return this
  }
  ok(obj){
    this.msg = "ok"
    this.status = "200"
    this.content = obj
    return this
  }
}

app.get('/products', async(req,res)=>{
  let r = new Response()
  let productos = await productM.getProducts()
  if (req.query.limit) {
    const limit = parseInt(req.query.limit)
    productos = productos.slice(0,limit)
  }
  res.status(200).json(r.ok(productos));
})

app.get('/products/:pid', async(req,res)=>{
  let r = new Response()
  const pid = parseInt(req.params.pid);
  if (pid<=0 || isNaN(pid) ){
    res.status(400).json(r.badRequest());
    return
  }

  const product = await productM.getProductById(pid)
  res.status(200).json(r.ok(product))
})

app.listen(PORT || 8081,()=>{
  console.log (`Listening on port: ${PORT} http://localhost:${PORT}`)
})