// cart.controller.js
import CartManagerv2 from '../dao/bdmanager/carts.manager.js'

const Cartv2 = new CartManagerv2();

export const createCart = async(req, res) => {
 // take body of request
 const raw_array_data = req.body;

 console.log(raw_array_data)
 let product_to_send = []
 for (const one of raw_array_data) {
   if (!one.id || !one.quantity){
     return res.sendClientError("error, id and quantity are required")
     // res.status(400).json({status:"error", message:"error, id and quantity are required"});
     // return
   }
   // converts data from string to a number to check if the collected data is valid (int/double/float)
   const aux_quantity = Number(one.quantity)
 
   // if the result of converts the values is "NAN", then is an error an returns 400
   if (isNaN(aux_quantity) || aux_quantity <= 0 ){
     return res.sendClientError("quantity error")
     // res.status(400).json({ status:"error",message:"quantity error" });
     // return
   }
   product_to_send.push( {product: one.id, quantity: one.quantity})
 }
 
 try {
   const resp = await Cartv2.save(product_to_send)
   return res.sendSuccess(resp)
   // res.status(200).json({ status:"success", message:"carrito creado", payload: resp._id });
   // console.log(resp);  
   // return
 } catch (error) {
   console.log(error)
   console.log(error.message)
   return res.sendServerError(error.message)
   // res.status(500).json({ status:"error",message:"error creando el carrito" });
   // return
 }
};

export const deleteCartById = async(req, res) => {
  const { cid } = req.params;
  if (expresion.test(cid)) {
    return res.sendClientError('Invalid cart id');
    // res.status(400).json({ status: "error", message: "Invalid cart id" });
    return;
  }
  
  try {
    const resp = await this.Cartv2.toEmptyCart( cid );
    console.log(resp);
    return res.sendSuccess(resp);
    // res.status(200).json({ status:"success", message:"carrito vaciado", payload: resp });
  } catch (error) {
    console.log(error.message);
    return res.sendServerError(error.message);
    // res.status(500).json({ status: "error" });
  }
};

export const deleteProdFromCart = async(req, res) => {
  const { cid, pid } = req.params;
  
  if (expresion.test(cid)) {
    return res.sendClientError('Invalid cart id');
    // res.status(400).json({ status: "error", message: "Invalid cart id" });
    // return;
  }
  if (expresion.test(pid)) {
    return res.sendClientError('Invalid product id');
    // res.status(400).json({ status: "error", message: "Invalid product id" });
    // return;
  }
  const toSend = { cart_id: cid, product_id:pid}
  
  try {
    const resp = this.Cartv2.deleteOneProduct(toSend);
    return res.sendSuccess(resp);
    // res.status(200).json({ status:"success", message:"carrito actualizado", payload: resp });
  } catch (error) {
    return res.sendServerError(error.message);
    // console.log(error.message)
    // res.status(500).json({ status: "error" });
  }
};

export const getCartProductsById = async(req, res) => {
  // const r = new Response(req.headers.referer || '');
  const { cid } = req.params;
  
  
  if (expresion.test(cid)) {
    return res.sendClientError('');
    // res.status(400).json({ status: "error", message: "Invalid cart id" });
    // return
  }
  
  try {
    const resp = await this.Cartv2.getOne(cid) ;
    res.status(200).json({ status: "success", payload:resp});
    console.log(JSON.stringify(resp,null,2));
    return res.sendSuccess(resp);
    // return
  } catch (error) {
    console.log(error);
    // res.status(500).json({ status: "error", message: "Error al solicitar carrito" });
    return res.sendServerError("Error al solicitar carrito");
    // return
  }
};

export const updateProductCartQuantity = async(req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  
  if (expresion.test(cid)) {
    return res.sendClientError('invalid cart id');
    // res.status(400).json({ status: "error", message: "Invalid cart id" });
    // return;
  }
  
  if (expresion.test(pid)) {
    return res.sendClientError('Invalid product id');
    // res.status(400).json({ status: "error", message: "Invalid product id" });
    // return;
  }
  
  console.log(cid, pid, quantity)
  if (!quantity) {
    return res.sendClientError('Invalid quantity 1');
    // res.status(400).json({ status: "error", message: "Invalid quantity 1" });
    // return
  }else {
    if (quantity < 0) {
      return res.sendClientError('Invalid quantity 2');
      // res.status(400).json({ status: "error", message: "Invalid quantity 2" });
      // return
    }
  };
  
  try {
    const resp = await this.Cartv2.updateProductQuantity(pid, cid, quantity)
    return res.sendSuccess(resp);
  } catch (error) {
    return res.sendServerError(error.message);
  }
};

export const updateCart = async(req, res) => {
  const { cid } = req.params;
  
  const raw_array_data = req.body;
  
  let product_to_send = []
  for (const one of raw_array_data) {
    if (!one.id || !one.quantity){
      return res.sendClientError('');
      // res.status(400).json({status:"error", message:"error, id and quantity are required"});
      // return
    }
  
    const aux_quantity = Number(one.quantity)
  
    if (isNaN(aux_quantity) || aux_quantity <= 0 ){
      return res.sendClientError('quantity error');
      // res.status(400).json({ status:"error",message:"quantity error" });
      // return
    }
    
    product_to_send.push({ product: one.id, quantity: one.quantity })
  }
  
  
  if (expresion.test(cid)) {
    return res.sendClientError('Invalid cart id');
    // res.status(400).json({ status: "error", message: "Invalid cart id" });
    // return
  }
  
  try {
    const resp = await this.Cartv2.updateAllProducts(product_to_send, cid)
    console.log(resp)
    return res.sendSuccess("carrito actualizado");
    // res.status(200).json({status: "success", message:"carrito actualizado"})
  } catch (error) {
    console.log (error.message)
    // res.status(500).json({ status: "error", message: "Error actualizando el carrito" });
    return res.sendServerError("Error actualizando el carrito");
  }    
};

export const addProductToCart = async(req, res) => {
  // const r = new Response(req.headers.referer || '');
  const { cid, pid } = req.params;
  // const icid = parseInt(cid);
  // const pcid = parseInt(pid);
  
  // validaciones de tipos y no válidos
  // if (isNaN(icid) || icid <= 0 || isNaN(pcid) || pcid <= 0 ) {
  //   res.status(400).json(r.badRequest());
  //   return
  // }
  
  
  
  if (expresion.test(cid)) {
  res.status(400).json({ status: "error", message: "Invalid cart id" });
  return;
  }
  if (expresion.test(pid)) {
  res.status(400).json({ status: "error", message: "Invalid product id" });
  return;
  }
  
  
  // recibo y valido los datos del body
  const { quantity } = req.body;
  if (!quantity){
    return res.sendClientError('error en la cantidad del producto');
    // res.status(400).json({status: "error", message:"error en la cantidad del producto"});
    // return
  }
  
  // genero converciones para gestionar posibles errores
  const aux_quantity = Number(quantity)
  if (isNaN(aux_quantity) || aux_quantity <= 0){
    return res.sendClientError('error en la cantidad del producto');
    // res.status(400).json({status: "error", message:"error en la cantidad del producto"});
    // return
  }
  
  // creo un objeto nuevo con los datos ya validados
  const product_to_add = { pid, quantity:aux_quantity, cid };
  try {
    const resp = await this.Cartv2.addProduct(product_to_add);
    console.log (resp);
    return res.sendSuccess({message: "producto agregado"});
    // res.status(200).send();
  } catch (error) {
    console.log(error);
    // res.status(500).send();
    return res.sendServerError(error.message);
  }
};


