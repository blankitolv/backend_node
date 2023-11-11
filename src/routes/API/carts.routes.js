// import { Router } from 'express';
import Router from "../router.routes.js"
// import { ProductManager } from '../../dao/fsmanager/clase.js'
// import { CartManager } from '../../dao/fsmanager/clase.js'

// import CartManagerv2 from '../../dao/bdmanager/carts.manager.js'
import CartManagerv2 from '../../dao/bdmanager/carts.manager.js'
import { accessRoles, passportStrategiesEnum } from "../../config/enums.config.js";
import * as CartController from "../../controllers/carts.controller.js";


// const router = Router();

const expresion = new RegExp("/[a-z0-9]+/");


// const router = Router();
export default class CartRouter extends Router{
  constructor(){
    super();
    // this.Cartv2 = new CartManagerv2();
  }

  // router.post("/", upload.array("img", 7), async (req, res) => {
  init() {
    this.post('/',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.createCart)
    this.delete('/:cid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.deleteCartById)
    this.delete('/:cid/products/:pid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.deleteProdFromCart)
    this.get('/:cid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.getCartProductsById)
    this.put('/:cid/products/:pid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.updateProductCartQuantity)
    this.put('/:cid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.updateCart)
    this.post('/:cid/product/:pid',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, CartController.addProductToCart)
  }
};

export {
  CartController
};

// crea un carrito de compras, recibe un arreglo de productos
// router.post('/',async(req,res)=>{
//   // take body of request
//   const raw_array_data = req.body;
  
//   console.log(raw_array_data)
//   let product_to_send = []
//   for (const one of raw_array_data) {
//     if (!one.id || !one.quantity){
//       res.status(400).json({status:"error", message:"error, id and quantity are required"});
//       return
//     }

//     // converts data from string to a number to check if the collected data is valid (int/double/float)
//     const aux_quantity = Number(one.quantity)

//     // if the result of converts the values is "NAN", then is an error an returns 400
//     if (isNaN(aux_quantity) || aux_quantity <= 0 ){
//       res.status(400).json({ status:"error",message:"quantity error" });
//       return
//     }
//     product_to_send.push( {product: one.id, quantity: one.quantity})
//   }
//   try {
//     const resp = await Cartv2.save(product_to_send)
//     res.status(200).json({ status:"success", message:"carrito creado", payload: resp._id });
//     console.log(resp);  
//     return
//   } catch (error) {
//     console.log(error)
//     console.log(error.message)
//     res.status(500).json({ status:"error",message:"error creando el carrito" });
//     return
//   }


//   // console.log ("carrito creado")
//   // res.status(200).json(r.ok(resp));
// })
// router.delete('/:cid',async(req,res) =>{
//   const { cid } = req.params;

//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return;
//   }

//   try {
//     const resp = await Cartv2.toEmptyCart( cid );
//     console.log(resp);
//     res.status(200).json({ status:"success", message:"carrito vaciado", payload: resp });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ status: "error" });
//   }

// })

// router.delete('/:cid/products/:pid',async(req,res) =>{
//   const { cid, pid } = req.params;

//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return;
//   }
//   if (expresion.test(pid)) {
//     res.status(400).json({ status: "error", message: "Invalid product id" });
//     return;
//   }
//   const toSend = { cart_id: cid, product_id:pid}

//   try {
//     const resp = Cartv2.deleteOneProduct(toSend);
//     res.status(200).json({ status:"success", message:"carrito actualizado", payload: resp });
//   } catch (error) {
//     console.log(error.message)
//     res.status(500).json({ status: "error" });

//   }
  
// })

// // recibe un id de carrito y retorna un arreglo de productos con cantidades
// router.get('/:cid', async(req,res)=>{
//   // const r = new Response(req.headers.referer || '');
//   const { cid } = req.params;
  

//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return
//   }
  
//   try {
//     const resp = await Cartv2.getOne(cid) ;
//     res.status(200).json({ status: "success", payload:resp});
//     console.log(JSON.stringify(resp,null,2));
//     return
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ status: "error", message: "Error al solicitar carrito" });
//     return
//   }


  // // const icid = parseInt(cid);
  
  // // // recibo y validos del datos que viajan por url
  // // if (isNaN(icid) || icid <= 0) {
  // //   res.status(400).json(r.badRequest());
  // //   return
  // // }

  // // se valida que el carrito exista y se retornan el carrito existente
  // // const response = await Cart.Exists(icid);
  // // if (response.error){
  // //   console.log (response)
  // //   res.status(400).json(r.badRequest(response.error));
  // //   return
  // // }


  // // para mayor comodidad, se asigna a "carrito_products" los valores de la respuesta
  // // const carrito_products = response.carrito.products

  // // se crea una variable que va a contener todos los IDS de productos
  // // para luego recolectar datos de esos productos
  // // const all_products = []
  // // for (const one of response.carrito.products) {
  // //   all_products.push({id:one.id})
  // // }

  // // // se crea una instancia de productos para tener acceso al método que valida que 
  // // // los productos existan y retorna los datos de esos productos.
  // // const prods = new ProductManager();
  // // const response2 = await prods.ExistsProducts(all_products)
  // // // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  // // const ok = r.handler_message(res, response2)
  // // if (!ok.continue) {
  // //   return
  // // }

  // // para mayor comodidad, los productos son asignados a la variable "products_db"
  // // que contiene los datos de los productos
  // // const products_db = response2.products

  // // // se crea un arreglo que va a una composición de la 
  // // // unión de "carrito de compras" y "productos"
  // // const products_to_response = []
  // // for (const oneProductCart of carrito_products) {
  // //   for (const oneProductDB of products_db) {
  // //     if (oneProductDB.uid === oneProductCart.id) {
  // //       products_to_response.push({...oneProductCart, ...oneProductDB})
  // //     }
  // //   }
  // // }

  // // // se retorna un 200 y se envía una respuesta acorde.
  // // res.status(200).json(r.ok(products_to_response));
// })


// router.put('/:cid/products/:pid', async(req,res)=>{
//   const { cid, pid } = req.params;
//   const { quantity } = req.body;

//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return;
//   }

//   if (expresion.test(pid)) {
//     res.status(400).json({ status: "error", message: "Invalid product id" });
//     return;
//   }
  
//   console.log(cid, pid, quantity)
//   if (!quantity) {
//     res.status(400).json({ status: "error", message: "Invalid quantity 1" });
//     return
//   }else {
//     if (quantity < 0) {
//       res.status(400).json({ status: "error", message: "Invalid quantity 2" });
//       return
//     }
//   };

//   try {
//     const resp = await Cartv2.updateProductQuantity(pid, cid, quantity)
//   } catch (error) {
    
//   }
//   res.status(200).json({ status: "success", message: "all ok" });
// });

// router.put('/:cid', async(req,res)=>{
//   const { cid } = req.params;

//   const raw_array_data = req.body;
  
//   let product_to_send = []
//   for (const one of raw_array_data) {
//     if (!one.id || !one.quantity){
//       res.status(400).json({status:"error", message:"error, id and quantity are required"});
//       return
//     }

//     const aux_quantity = Number(one.quantity)

//     if (isNaN(aux_quantity) || aux_quantity <= 0 ){
//       res.status(400).json({ status:"error",message:"quantity error" });
//       return
//     }
    
//     product_to_send.push({ product: one.id, quantity: one.quantity })
//   }


//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return
//   }
  
//   try {
//     const resp = await Cartv2.updateAllProducts(product_to_send, cid)
//     console.log(resp)
//     res.status(200).json({status: "success", message:"carrito actualizado"})
//   } catch (error) {
//     console.log (error.message)
//     res.status(500).json({ status: "error", message: "Error actualizando el carrito" });
//   }

// })


/* recibe un id de carrito y un id de producto e incorpora ese producto al carrito 
y de existir lo suma */
// router.post('/:cid/product/:pid', async(req,res)=>{
//   // const r = new Response(req.headers.referer || '');
//   const { cid, pid } = req.params;
//   // const icid = parseInt(cid);
//   // const pcid = parseInt(pid);
  
//   // validaciones de tipos y no válidos
//   // if (isNaN(icid) || icid <= 0 || isNaN(pcid) || pcid <= 0 ) {
//   //   res.status(400).json(r.badRequest());
//   //   return
//   // }



//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return;
//   }
//   if (expresion.test(pid)) {
//     res.status(400).json({ status: "error", message: "Invalid product id" });
//     return;
//   }


//   // recibo y valido los datos del body
//   const { quantity } = req.body;
//     if (!quantity){
//       res.status(400).json({status: "error", message:"error en la cantidad del producto"});
//       return
//     }

//     // genero converciones para gestionar posibles errores
//     const aux_quantity = Number(quantity)
//     if (isNaN(aux_quantity) || aux_quantity <= 0){
//       res.status(400).json({status: "error", message:"error en la cantidad del producto"});
//       return
//     }

//     // creo un objeto nuevo con los datos ya validados
//     const product_to_add = { pid, quantity:aux_quantity, cid };
//     try {
//       const resp = await Cartv2.addProduct(product_to_add);
//       console.log (resp);
//       res.status(200).send();
//     } catch (error) {
//       console.log(error);
//       res.status(500).send();
//     }

//     // creo un arreglo con el id a validar
//     // lo hago de esta manera para no repetir código y reutilizar ExistsProduct
//     // const product_to_verify = [{id:pcid}]


//   // const response = await Cart.Exists(icid);
//   // if (response.error){
//   //   console.log (response)
//   //   res.status(400).json(r.badRequest(response.error));
//   //   return
//   // }

//   // genero una bandera para saber si el producto ya existe
//   // si sale siendo false: no existe
//   // si sale siendo true: ya existe
//   // entonces, si existe, lo suma y sino lo agrega
//   // let product_exist = false
//   // response.carrito.products.map((e)=>{  
//   //   if (e.id == product_to_add.id) {
//   //     e.quantity += product_to_add.quantity
//   //     product_exist = true
//   //   }
//   // })
//   // if (!product_exist) {
//   //   response.carrito.products.push(product_to_add)
//   // }


//   // const prods = new ProductManager();


//   // // valido que el producto exista en el sistema
//   // const response3 = await prods.ExistsProducts(product_to_verify)
//   // // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
//   // const ok = r.handler_message(res, response3)
//   // if (!ok.continue) {
//   //   return
//   // }
  

//   // // actualiza el carrito
//   // const response2 = await Cart.updateCart(response.carrito)
//   // if (response2.error){
//   //   console.log (response2)
//   //   res.status(400).json(r.badRequest(response2.error));
//   //   return
//   // }
  
//   // si llego a esta instancia, todo está bien, y retorna un mensaje acorde
//   // res.status(200).json(r.ok(response2.message));

// })

// export default router