// // import ProductManagerv2 from "../dao/bdmanager/products.manager.js";
// import ProductManagerv2 from "../dao/bdmanager/products.manager.js";
// const pm = new ProductManagerv2();

import CartManager from "../dao/bdmanager/carts.manager.js";
const cm = new CartManager();

const save = async(product) =>{
  return await cm.save(product)
}

const toEmptyCart = async( id) => {
  return await cm.toEmptyCart( id );
}
const deleteOneProduct = async( product ) => {
  return await cm.deleteOneProduct( product );
}


export {
  save,
  toEmptyCart,
  deleteOneProduct
}