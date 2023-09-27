import mongoose from 'mongoose';

const productsCollection = 'products';

const productSchema = new mongoose.Schema({
  title: {
    type:String,
    required: true,
  },
  code: {
    type:String,
    required: true,
  },
  price: {
    type:Number,
    required: true,
  },
  stock: {
    type:Number,
    required: true,
  },
  category: {
    type:String,
    required: true,
  },
  thumbnail: {
    type: Array,
    default: []
  },
  status: {
    type: Boolean,
    default: true
  }
});
export const productsModel = mongoose.model(productsCollection, productSchema);
