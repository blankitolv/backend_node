import { cartsModel } from "../models/carts.model.js";
import { productsModel } from "../models/products.model.js";

const cartCollection = 'carts';

export default class CartManagerv2 {

  save = async (products) =>{
    let all_ids = [];
    for (const one of products){
      all_ids.push(one.product);
    }
    const all_products = await productsModel.find(
      { 
        _id: 
        {
           $in: all_ids 
        },
        status: true
      })
    // si la base de datos no retornó la misma cantidad de productos
    // que se solicitó, retorna con un error
    if (all_ids.length !== all_products.length) {
      throw new Error ("Hay productos no válidos");
    }
    return await cartsModel.create({ products });
  }

  getOne = async (id) => {
    console.log("entro")
    return await cartsModel.findById(id).populate('products.product');
  }

  // findOneAndUpdate(filtro, acción, opción adicional)
  addProduct = async (compossition) => {
    console.log("COMP: ",compossition)
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
    let new_quantity
    for (const oneProduct of cart.products ){
      // console.log(oneProduct.product._id.toString(), " || ",pid)
      if (oneProduct.product._id.toString() == pid){
          // console.log (oneProduct.id," ES IGUAL A ",pid)
          exist = true
          new_quantity = oneProduct.quantity + quantity
          // oneProduct.quantity += quantity;
        }
      }

      if (exist == false) {
      console.log ("PRODUCTO NUEVO")
      return await cartsModel.updateOne({ _id: cid },
        // asignación
        { $push: { 'products': { product: product._id, quantity} } }
      );
    } else {
      console.log ("PRODUCTO EXISTENTE")
      console.log ("MODIFICACION: quantity = ",new_quantity);
      console.log ("MODIFICACION: carrito = ",cid);
      console.log ("MODIFICACION: producto = ",pid);
      
      return await cartsModel.findOneAndUpdate({ _id: cid, 'products.product':pid },
        // asignación -- del arreglo de productos actualizo el campo quantity
        { $set: { 'products.$.quantity': new_quantity } }
      );
    }
  }

  deleteOneProduct = async (data) => {
    return await cartsModel.updateOne({_id:data.cart_id},
      { $pull: { 'products': { product:data.product_id } } })
  }

  toEmptyCart = async (data) => {
    return await cartsModel.updateOne({_id:data},
      { $set: { 'products': [] } });
  }

  updateAllProducts = async (prod, cartID) => {
    console.log (prod[0], cartID);
    return await cartsModel.findOneAndUpdate(
      { _id: cartID },
      { products: prod}
    )
  }
  
  updateProductQuantity = async (prodID, cid, quantity) => {
    return await cartsModel.findOneAndUpdate(
      { _id: cid, 'products.product':prodID },
      { $set: { 'products.$.quantity': quantity} }
    )
  }
} 