import { productsModel } from '../models/products.model.js'
// se importa el schema e interactúa con mongodb
// es la unión entre el esquema y la clase
export default class ProductManagerv2 {
  /**
   *  TERMINE ACÄ TENGO QUE VOLVER A HACER LA CLASE
   *  TENGO QUE HACER LAS VALIDACIONES EN ROUTER, LLEGAR LIMPIO
   *  Y MANDAR A LA BASE DE DATOS
   *  
   */
  getAll = async () => {
    const products = await productsModel.find().lean();
    return products;
  }

  getLimit = async (limit) => {
    const products = await productsModel.find().limit(limit).lean();
    return products;
  }

  save = async (product) => {
    const resp = await productsModel.create(product);
    return resp;
  }

  getOne = async (id) => {
    const oneProduct = await productsModel.findById(id).lean();
    return oneProduct;
  }

  update = async (id, product) => {
    return await productsModel.updateOne( { _id:id}, product  );
  }

  delete = async (id) => {
    return await productsModel.findOneAndDelete( { _id:id} ).lean();
  }
 
}