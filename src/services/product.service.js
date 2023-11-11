// import ProductManagerv2 from "../dao/bdmanager/products.manager.js";
import ProductManagerv2 from "../dao/bdmanager/products.manager.js";
const pm = new ProductManagerv2();

const getAll = async (raw_limit, raw_page, raw_sort, raw_category, raw_status) => {
  let limit
  let page
  raw_limit != undefined ? limit = Number(raw_limit) : limit = 10;
  raw_page != undefined ? page = Number(raw_page) : page = 1;
  let query = {}
  let options = { limit, page }
  
  if (raw_sort != undefined) { 
    options["sort"] = raw_sort == 'asc' ? 1 : -1
  }

  if (raw_category!= undefined) {
    query["category"] = raw_category
  } else { 
    if (raw_status != undefined) {
      query["status"] = raw_status
    }
  }
  return await pm.getAll(options, query);
}
const getOneById = async (id) => {
  const expresion = new RegExp("/[a-z0-9]+/");
  if (expresion.test(id)) {
    return
  }
  return await pm.getOneById(id);
}

const updateOne = async (id, product) => {
  const resp = await pm.update(id, product)
}

const deleteById = async (id) => {
  return await pm.delete(id)
}
const saveProduct = async (product) => {
  return await pm.delete(product)
}

export {
  getAll,
  getOneById,
  updateOne,
  deleteById,
  saveProduct
}