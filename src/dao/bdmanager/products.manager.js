import { productsModel } from '../models/products.model.js'
// se importa el schema e interactúa con mongodb
// es la unión entre el esquema y la clase
export default class ProductManagerv2 {
  // getAll = async (options) => {
  //   let sort
  //   if (options.sort == null){
  //     sort = {}
  //   } else {
  //     sort =  { price: options.sort}
  //   }

  //   let filter = {}
  //   if (options.category != null){
  //     filter.category = options.category
  //   } else if (options.status != null) {
  //     filter.status = options.status
  //   }

  //   console.log(options.status);
  //   const products = await productsModel.paginate( filter ,{ limit: options.limit, page: options.page, sort })
  //   return products;
  // }
  getAll = async (options = {}, queries = {}) => {
    let option = {}
    let query = {}

    option["page"] = options.page ?? 1
    option["limit"] = options.limit ?? 10

    if (options.sort) {
      option["sort"] = { price: options.sort }
    }
    if (queries.category) {
      query["category"] = queries.category
    } else if (queries.status != undefined) {
      console.log ("status -> ",queries.status)
      query["status"] = queries.status
    }
    console.log(" ===== MANAGER =====")
    console.log(query, option)
    option["lean"]=true
    const { docs,
      totalDocs,
      page,
      totalPages, // cantpage
      prevPage, //n paginaanterio 
      nextPage, // npag sig
      hasPrevPage,
      hasNextPage,
      
    } = await productsModel.paginate(query, option);

    const resultObject = {
      status: 'success',
      payload: docs,
      totalDocs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
    };
    return resultObject
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
    return await productsModel.findById(id).lean();
  }

  update = async (id, product) => {
    return await productsModel.updateOne( { _id:id}, product  );
  }

  delete = async (id) => {
    return await productsModel.findOneAndDelete( { _id:id} ).lean();
  }
  
}