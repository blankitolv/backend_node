// recursos de terceros
import multer from "multer";
import path from "path";
import fs, { access } from "fs";

// recursos propios
// services
import { getAll, getOneById, updateOne, deleteById, saveProduct} from "../services/product.service.js"


// si el producto es eliminado o actualizado con imagenes, el archivo anterior se borra
// luego de 3 segundos para poder ser visualizado, posteriormente se va a eliminar el tiempo
const deleteFiles = async (...paths) => {
  console.log("borrando imagenes")
  if (paths.length == 0) {
    return
  }
  setTimeout(() => {
    for (const one of paths) {
      fs.promises.unlink(path.join(__dirname, "..","/src/public/img" + one));
    }
  }, 1000);
};



// es un objeto que va a utilizar multer con dos callbacks
const storage = multer.diskStorage({
  // donde lo guardo
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..","/src/public/img"));
  },

  // como lo guardo
  filename: (req, file, cb) => {
    // img-201245.jpeg
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage });




export const getAllProducts = async (req,res) =>{
  // params 
  let limit = req.query.limit
  let page = req.query.page
  let sort = req.query.sort 
  let category = req.query.category
  let status = req.query.status
  
  if (req.query.status) {
    if (req.query.status == "true" || req.query.status == "false") {
      status = req.query.status
    } else {
      return res.sendClientError("Invalid url param");
    }
  }
  try {
    let productos = await getAll(limit, page, sort, category, status);
    return res.sendSuccess(productos);
  } catch (error) {
    console.log(error)
    return res.sendServerError(error.message);
  }
}

export const getOneProductById = async (req,res)=>{
    const { id } = req.params;
    try {
      // solicito el producto por id
      const product = await getOneById(id);
      if (!product) {
        return res.sendClientError();
      }
      return res.sendSuccess(product);
    } catch (error) {
      console.error(">> ERROR: ", error.message);
      console.error(">> USING: ", id);
      return res.sendServerError(error.message);
    }
}

export const updateOneById = async(req,res)=>{
    // router.put("/:id", upload.array("img", 7), async (req, res) => {
    // convierto en una variable el contenido del body del request
    const { title, description, code, price, stock, category } = req.body;
  
    // variable auxiliar que contendrá los path de los thumbnails
    const thumb_auxiliar = [];
  
    // bandera que determina si se deben borrar imagenes si algún error ocurre
    var temp_image = new Boolean(false);
    
    // valido que tenga o no imagenes asociadas en el request
    if (req.files) {
      temp_image = true;
      
      for (const element of req.files){
  
        // valido que el peso sea menor que 4096 (discutible, debe haber otra forma)
        if ((element.size / 1024)>4096){
  
          // si es mayor a 4mb borro el elemento
          thumb_auxiliar.length > 0 ? await deleteFiles(thumb_auxiliar) : false
          return res.sendClientError("maximo permitido 4mb en multimedia")
          // res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
        } else {
          thumb_auxiliar.push("/"+element.filename)
        }
      }
    }
  
    // se validan todos los campos obligatorios
    if (
      !title ||
      !description ||
      !price ||
      !code ||
      !stock ||
      !category
    ) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      return res.sendClientError("Todos los campos son requeridos")
      // res.status(400).json({ status:"error", message:'Todos los campos son requeridos' });
      // res.status(400).json(r.badRequest(res, res, "Todos los campos son requeridos"));
      
    }
  
    const { id } = req.params;
  
    const expresion = new RegExp("/[a-z0-9]+/");
  
    if (expresion.test(id)) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      return res.sendClientError("Invalid url id")
    }
  
    // se eliminan espacios vacios y se validan ceros en los campos
    if (
      title.trim() == "" ||
      description.trim() == "" ||
      code.trim() == "" ||
      price <= 0 ||
      stock <= 0 ||
      isNaN(price) ||
      isNaN(stock)
    ) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      return res.sendClientError("Existen campos vacíos o no válidos")
    }
    
    // actualizo el producto
    try {
      const response = await updateOne(id, {title,  description,  price,  code,  stock,  category, thumbnail: thumb_auxiliar});
      if (response.modifiedCount == 0) {
        temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
        return res.sendClientError("Datos incorrectos actualizando producto")
      }
      return res.sendSuccess("producto actualizado")
    } catch (error) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      console.error(">> ErrorM: ",error.message)
      return res.sendServerError("Error actualizando el producto");
  
    }
}

export const deleteProductById = async(req,res)=>{
    // tomo id que se quiere eliminar desde el url y se hacen validaciones
  const { id } = req.params;

  const expresion = new RegExp("/[a-z0-9]+/");

  if (expresion.test(id)) {
    return res.sendClientError("Invalid id")
  }

  // borra el producto
  try {
    const response = await deleteById(id);
    console.log ("SE RETORNO: ",response);
    response.thumbnail.length != 0 ? await deleteFiles(response.thumbnail) : false;
    const io = req.app.get('socketio');
    io.emit('del_product',{ uid: id });
    return res.sendSuccess(response)
  } catch (error) {
    console.log (error.message);
    console.log("USING: >>",id);
    return res.sendServerError("No se pudo eliminar el producto")

  }
}

export const createProduct = async(req,res)=>{
  // router.post("/", upload.array("img", 7), async (req, res) => {
  // convierto en una variable el body del request
  const { title, description, code, price, stock, category } = req.body;

  // variable auxiliar que contendrá los path de los thumbnails
  const thumb_auxiliar = [];

  // bandera que determina si se deben borrar imagenes si algún error ocurre
  var temp_image = new Boolean(false);

  // valido que tenga o no imagenes asociadas en el request
  if (req.files) {
    temp_image = true;

    for (const element of req.files){

      // valido que el peso sea menor que 4096 (discutible, debe haber otra forma)
      if ((element.size / 1024)>4096){
        // si es mayor a 4mb borro el elemento
        await deleteFiles(thumb_auxiliar);
        return res.sendClientError("maximo permitido 4mb en multimedia")
      } else {
        thumb_auxiliar.push("/"+element.filename)
      }
    }
  }
  if (!title || !description || !price || !code || !stock || !category) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    return res.sendClientError("bad request");
  }

  // elimino los espacios en las palabras y valido valores iguales a 0
  // en caso de error, si tiene elementos cargados, los borra y retorna un 400
  if (
    title.trim() == "" ||
    description.trim() == "" ||
    code.trim() == "" ||
    price <= 0 ||
    stock <= 0 ||
    isNaN(price) ||
    isNaN(stock)
  ) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    return res.sendClientError('Bad request');
  }
  try {
    const resp = await saveProduct({title, description, code, price, stock, category, thumbnail: thumb_auxiliar});
    const io = req.app.get('socketio');
    io.emit('new_products',resp);
    return res.sendSuccess(resp);
  } catch (error) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    console.log(error)
    return res.sendServerError(error.message);
  }
}
