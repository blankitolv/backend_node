import mongoose from 'mongoose';

const cartsCollection = 'carts';

const cartsSchema = new mongoose.Schema({
  products: {
    type: [
      {
        quantity: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products'
        }
      }
    ],
  }
});
// se puede utilizar middleware pre para validar si contiene algo
// el criterio que voy a tener al borrar un producto, va a ser:
/**
 * 1.- el borrado de los productos van a ser lógicos y no físicos
 * 2.- si el producto se elimina, no se va a eliminar del carrito. a la 
 * hora de realizar la compra se frenará antes
 * 3.- se va a guardar el producto completo en el arreglo del carrito sin thumbnail
 */
export const cartsModel = mongoose.model(cartsCollection, cartsSchema);
