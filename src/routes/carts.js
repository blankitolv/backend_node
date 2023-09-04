import { Router } from 'express';
import { ProductManager } from '../clase.js'
import { CartManager } from '../clase.js'
import Response from '../errorMessages.js'

const router = Router();

const Cart = new CartManager();

// crea un carrito de compras, recibe un arreglo de productos
router.post('/',async(req,res)=>{
  // inicia el sistema de respuestas
  const r = new Response();

  // take body of request
  const raw_array_data = req.body;
  
  // create a var to collect verified data
  const array_product = []

  // create a var to collect ids to verify if the product exists in the system
  const product_to_verify = []


  for (const one of raw_array_data) {
    if (!one.id || !one.quantity){
      res.status(400).json(r.badRequest());
      return
    }

    // converts data from string to int to check if the collected data is valid (int in this case)
    const aux_id = parseInt(one.id)

    // converts data from string to a number to check if the collected data is valid (int/double/float)
    const aux_quantity = Number(one.quantity)

    // if the result of converts the values is "NAN", then is an error an returns 400
    if (isNaN(aux_quantity) || isNaN(aux_id) || aux_quantity <= 0 || aux_id <= 0){
      res.status(400).json(r.badRequest());
      return
    }

    

    // accumulate all ids of the products to after verify it
    product_to_verify.push({id:aux_id})

    // accumulate all correct data of products
    array_product.push({id:aux_id, quantity:aux_quantity})
  }

  // si el arreglo que almacena datos correctos está vacío retorna con badrequest
  if (array_product.length == 0) {
    res.status(400).json(r.badRequest());
    return
  }

  /*
  creo una instancia de productos para verificar 
  que los productos que quiere agregar existan en base de datos
  */  
  const prods = new ProductManager();
  const response3 = await prods.ExistsProducts(product_to_verify)
  // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  const ok = r.handler_message(res, response3)
  if (!ok.continue) {
    return
  }
  
  /* NOTA

  no se está validando que la cantidad que quiere
  agregar esté disponible en stock

  */

  // se crea el carrito
  const resp = await Cart.createCart(array_product)
  if (resp.error) {
    res.status(500).json(r.internalServerError());
    return
  }

  console.log ("carrito creado")
  res.status(200).json(r.ok(resp));
})

// recibe un id de carrito y retorna un arreglo de productos con cantidades
router.get('/:cid', async(req,res)=>{
  const r = new Response();
  const { cid } = req.params;
  const icid = parseInt(cid);
  
  // recibo y validos del datos que viajan por url
  if (isNaN(icid) || icid <= 0) {
    res.status(400).json(r.badRequest());
    return
  }

  // se valida que el carrito exista y se retornan el carrito existente
  const response = await Cart.Exists(icid);
  if (response.error){
    console.log (response)
    res.status(400).json(r.badRequest(response.error));
    return
  }


  // para mayor comodidad, se asigna a "carrito_products" los valores de la respuesta
  const carrito_products = response.carrito.products

  // se crea una variable que va a contener todos los IDS de productos
  // para luego recolectar datos de esos productos
  const all_products = []
  for (const one of response.carrito.products) {
    all_products.push({id:one.id})
  }

  // se crea una instancia de productos para tener acceso al método que valida que 
  // los productos existan y retorna los datos de esos productos.
  const prods = new ProductManager();
  const response2 = await prods.ExistsProducts(all_products)
  // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  const ok = r.handler_message(res, response2)
  if (!ok.continue) {
    return
  }

  // para mayor comodidad, los productos son asignados a la variable "products_db"
  // que contiene los datos de los productos
  const products_db = response2.products

  // se crea un arreglo que va a una composición de la 
  // unión de "carrito de compras" y "productos"
  const products_to_response = []
  for (const oneProductCart of carrito_products) {
    for (const oneProductDB of products_db) {
      if (oneProductDB.uid === oneProductCart.id) {
        products_to_response.push({...oneProductCart, ...oneProductDB})
      }
    }
  }

  // se retorna un 200 y se envía una respuesta acorde.
  res.status(200).json(r.ok(products_to_response));
})

/* recibe un id de carrito y un id de producto e incorpora ese producto al carrito 
y de existir lo suma */
router.post('/:cid/product/:pid', async(req,res)=>{
  const r = new Response();
  const { cid, pid } = req.params;
  const icid = parseInt(cid);
  const pcid = parseInt(pid);
  
  // validaciones de tipos y no válidos
  if (isNaN(icid) || icid <= 0 || isNaN(pcid) || pcid <= 0 ) {
    res.status(400).json(r.badRequest());
    return
  }

  // recibo y valido los datos del body
  const { quantity } = req.body;
    if (!quantity){
      res.status(400).json(r.badRequest());
      return
    }

    // genero converciones para gestionar posibles errores
    const aux_quantity = Number(quantity)
    if (isNaN(aux_quantity) || aux_quantity <= 0){
      res.status(400).json(r.badRequest());
      return
    }

    // creo un objeto nuevo con los datos ya validados
    const product_to_add = {id:pcid, quantity:aux_quantity}

    // creo un arreglo con el id a validar
    // lo hago de esta manera para no repetir código y reutilizar ExistsProduct
    const product_to_verify = [{id:pcid}]


  const response = await Cart.Exists(icid);
  if (response.error){
    console.log (response)
    res.status(400).json(r.badRequest(response.error));
    return
  }

  // genero una bandera para saber si el producto ya existe
  // si sale siendo false: no existe
  // si sale siendo true: ya existe
  // entonces, si existe, lo suma y sino lo agrega
  let product_exist = false
  response.carrito.products.map((e)=>{  
    if (e.id == product_to_add.id) {
      e.quantity += product_to_add.quantity
      product_exist = true
    }
  })
  if (!product_exist) {
    response.carrito.products.push(product_to_add)
  }


  const prods = new ProductManager();


  // valido que el producto exista en el sistema
  const response3 = await prods.ExistsProducts(product_to_verify)
  // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  const ok = r.handler_message(res, response3)
  if (!ok.continue) {
    return
  }
  

  // actualiza el carrito
  const response2 = await Cart.updateCart(response.carrito)
  if (response2.error){
    console.log (response2)
    res.status(400).json(r.badRequest(response2.error));
    return
  }
  
  // si llego a esta instancia, todo está bien, y retorna un mensaje acorde
  res.status(200).json(r.ok(response2.message));

})

export default router