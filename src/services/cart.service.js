import CartManager from "../dao/bdmanager/carts.manager.js";
const cm = new CartManager();

export const save = async(product) =>{
  return await cm.save(product)
}

export const toEmptyCart = async( id) => {
  return await cm.toEmptyCart( id );
}
export const deleteOneProduct = async( product ) => {
  return await cm.deleteOneProduct( product );
}
export const updateProductQuantity = async( product ) => {
  return await cm.updateProductQuantity( product );
}
export const getOne = async( id ) => {
  return await cm.getOne( id );
}
