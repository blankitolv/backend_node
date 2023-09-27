import { cartsModel } from "../models/carts.model.js";
import { productsModel } from "../models/products.model.js";

const cartCollection = 'carts';

export default class CartManagerv2 {

  save = async (products) =>{
    let all_ids = [];
    for (const one of products){
      all_ids.push(one.id);
    }
    const all_products = await productsModel.find(
      { 
        _id: 
        {
           $in: all_ids 
        },
        status: true
      })
    if (all_ids.length !== all_products.length) {
      throw new Error ("Hay productos no válidos");
    }

    return await cartsModel.create({ products });
  }
  /* FALTA IMPLEMENTAR ONE, FALTA VERIFICAR SAVE */
  getOne = async (id) => {
    const oneCart = await cartsModel.findById(id).lean();
    console.log(oneCart);
    return oneCart;
  }

  // findOneAndUpdate(filtro, acción, opción adicional)
  addProduct = async (compossition) => {
    const { pid, quantity, cid } = compossition;
    const cart = await cartsModel.findById({_id: cid}).lean();
    if (cart == null){
      throw new Error ("Error en id carrito")
    }
    const product = await productsModel.findById({_id: pid}).lean();
    if (product == null){
      throw new Error ("Error en id producto")
    }
    // console.log(cart)
    let exist = new Boolean(false);
    let old_quantity
    for (const oneProduct of cart.products ){
      if (oneProduct.id == pid){
        console.log (oneProduct.id," ES IGUAL A ",pid)
        exist = true
        old_quantity = oneProduct.quantity
        // oneProduct.quantity += quantity;
      }
    }
    // console.log (quantity+old_quantity)
    // console.log ( typeof quantity)
    // console.log ( typeof old_quantity)
    // return true
    if (exist == false) {
      console.log ("PRODUCTO NUEVO")
      return await cartsModel.updateOne(
        // busqueda
        {
          _id: cid
        },
        // asignación
        {
          $push: { products: {id: product._id.toString(), quantity} }
        }
      );
    } else {
      console.log ("PRODUCTO EXISTENTE")
      return await cartsModel.updateOne(
        // busqueda
        {_id: cid,
        'products.id':pid
        },
        // asignación -- del arreglo de productos actualizo el campo quantity
        {
          $set: { 'products.$.quantity': (quantity+old_quantity) }
        }
      );
    }
    console.log(cart)

  }
} 