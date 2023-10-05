import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productsCollection = 'products';

const productSchema = new mongoose.Schema({
  title: {
    type:String,
    required: true,
  },
  description: {
    type: String,
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

productSchema.plugin(mongoosePaginate);


export const productsModel = mongoose.model(productsCollection, productSchema);
