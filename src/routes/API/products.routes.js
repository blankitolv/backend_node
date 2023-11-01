// import { Router } from "express";

// terceros
import multer from "multer";
import path from "path";
import fs, { access } from "fs";

// propios
import Router from "../router.routes.js"
import ProductManagerv2 from "../../dao/bdmanager/products.manager.js";
import { fileURLToPath } from "url";
import { __dirname } from "../../utils.js";
import { accessRoles, passportStrategiesEnum } from "../../config/enums.config.js";


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



// const router = Router();
export default class ProductRouter extends Router{
  constructor(){
    super();
    this.pm = new ProductManagerv2();
  }

  // router.post("/", upload.array("img", 7), async (req, res) => {
  init() {
    this.get('/',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, this.getAllProducts)
    this.post('/',[accessRoles.ADMIN], passportStrategiesEnum.JWT, this.createProduct)
    this.get('/:id',[accessRoles.ADMIN, accessRoles.USER], passportStrategiesEnum.JWT, this.getOneProductById)
    this.put('/:id',[accessRoles.ADMIN],passportStrategiesEnum.JWT, this.updateOneById)
    this.delete('/:id',[accessRoles.ADMIN],passportStrategiesEnum.JWT, this.deleteProductById)

  }

  async getAllProducts(req,res){
    // params 
    let limit
    let page
    req.query.limit != undefined ? limit = Number(req.query.limit) : limit = 10;
    req.query.page != undefined ? page = Number(req.query.page) : page = 1;
    let query = {}
    let options = { limit, page }
    
    if (req.query.sort != undefined) { 
      options["sort"] = req.query.sort == 'asc' ? 1 : -1
    }

    if (req.query.category != undefined) {
      query["category"] = req.query.category
    } else { 
      if (req.query.status != undefined) {
        if (req.query.status == "true" || req.query.status == "false") {
          query["status"] = req.query.status
        } else {
          return res.sendClientError("Invalid url param");
          // res.status(400).json({ status: "error", message: "Invalid url param" });
        }
      }
    }

    try {
      let productos = await this.pm.getAll(options, query);
      return res.sendSuccess(productos);
    } catch (error) {
      console.log(error)
      return res.sendServerError(error.message);
    }
  }

  async getOneProductById(req,res){
      // valido id
      const { id } = req.params;

      const expresion = new RegExp("/[a-z0-9]+/");

      if (expresion.test(id)) {
        return res.sendClientError("Invalid product id")
      }

      // solicito el producto por id
      try {
        const product = await this.pm.getOne(id);
        // res.status(200).json({ status: "success", payload: product });
        return res.sendSuccess(product)
        
      } catch (error) {
        console.error(">> ERROR: ", error.message);
        console.error(">> USING: ", id);
        return res.sendServerError(error.message)
        // res
        //   .status(400)
        //   .json({ status: "error", message: "error al solicitar el producto" });
      }
  }

  async updateOneById(req,res){
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
        // res.status(400).json({ status: "error", message: "Invalid id" });
        return res.sendClientError("Invalid url id")
      }
    
      // se liminan espacios vacios y se validan ceros en los campos
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
        // res.status(400).json({status:'error', message:'Existen campos vacíos o no válidos'});
      }
      
      // actualizo el producto
      try {
        const response = await this.this.pm.update(id, {title,  description,  price,  code,  stock,  category, thumbnail: thumb_auxiliar});
        if (response.modifiedCount == 0) {
          temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
          // res.status(400).json({ status:"error", message:'Datos incorrectos actualizando producto' });
          return res.sendClientError("Datos incorrectos actualizando producto")
        }
        return res.sendSuccess("producto actualizado")
        // res.status(202).json({status:"success", message:"producto actualizado"})
        // return
    
      } catch (error) {
        temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
        console.error(">> ErrorM: ",error.message)
        // res.status(500).json({ status:"error", message:'Error actualizando el producto' });
        return res.sendServerError("Error actualizando el producto");
    
      }
    // });
  }

  async deleteProductById(req,res){
      // tomo id que se quiere eliminar desde el url y se hacen validaciones
    const { id } = req.params;

    const expresion = new RegExp("/[a-z0-9]+/");

    if (expresion.test(id)) {
      return res.sendClientError("Invalid id")
      // res.status(400).json({ status: "error", message: "Invalid id" });
    }

    // borra el producto
    try {
      const response = await this.this.pm.delete(id);
      console.log ("SE RETORNO: ",response);
      response.thumbnail.length != 0 ? await deleteFiles(response.thumbnail) : false;
      // socketServer.sockets.emit("del_product", { uid: id });
      const io = req.app.get('socketio');
      io.emit('del_product',{ uid: id });
      return res.sendSuccess(response)
      // res.status(200).json({ status:"success", payload: response });
      // return
    } catch (error) {
      console.log (error.message);
      console.log("USING: >>",id);
      return res.sendServerError("No se pudo eliminar el producto")
      // res.status(500).json({ status:"error", message: "No se pudo eliminar el producto" });
      // return
    }
  }

  async createProduct(req,res){
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
          // res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
          // return
        } else {
          thumb_auxiliar.push("/"+element.filename)
        }
      }
    }
    if (!title || !description || !price || !code || !stock || !category) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      return res.sendClientError("bad request");
      // res.status(400).json({ status: "error", message:"bad request" });
      // return
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
      res.status(400).json({ status: "error", message:"bad request" });
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      return res.sendClientError("bad request");
    }
    try {
      const resp = await this.pm.save({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnail: thumb_auxiliar
      });
      // socketServer.sockets.emit('new_products', resp);
      const io = req.app.get('socketio');
      io.emit('new_products',resp);
      return res.sendSuccess(resp);
      // res.status(200).json({ status: "ok", payload: resp });
    } catch (error) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      console.log(error)
      return res.sendServerError(error.message);
      // res.status(500).json({ status: error, error: error.message });
    }
    // });
  }

}


// se crea una instancia de product manager para ser utilizada y cargada en memoria
// const productM = new ProductManager();

// // solicita productos del sistema
// router.get("/", async (req, res) => {  
//   console.log("SOLICITA ALL PRODUCTS: ",req.session)
//   let limit
//   let page
//   req.query.limit != undefined ? limit = Number(req.query.limit) : limit = 10;
//   req.query.page != undefined ? page = Number(req.query.page) : page = 1;
//   let query = {}
//   let options = { limit, page }
  
//   if (req.query.sort != undefined) { 
//     options["sort"] = req.query.sort == 'asc' ? 1 : -1
//   }

//   if (req.query.category != undefined) {
//     query["category"] = req.query.category
//   } else { 
//     if (req.query.status != undefined) {
//       if (req.query.status == "true" || req.query.status == "false") {
//         query["status"] = req.query.status
//       } else {
//         res.status(400).json({ status: "error", message: "Invalid url param" });
//       }
//     }
//   }
//   try {
//     let productos = await this.pm.getAll(options, query);
//     res.status(200).json(productos);
//   } catch (error) {
//     console.log(error)
//     res.status(500).json();
//   }
// });

// solicita un producto por numero de id [verificado]
// router.get("/:id", async (req, res) => {
//   // valido id
//   const { id } = req.params;

//   const expresion = new RegExp("/[a-z0-9]+/");

//   if (expresion.test(id)) {
//     res.status(400).json({ status: "error", message: "Invalid id" });
//     return;
//   }

//   // solicito el producto por id
//   try {
//     const product = await this.pm.getOne(id);
//     res.status(200).json({ status: "success", payload: product });
//     return;
//   } catch (error) {
//     console.error(">> ERROR: ", error.message);
//     console.error(">> USING: ", id);
//     res
//       .status(400)
//       .json({ status: "error", message: "error al solicitar el producto" });
//     return;
//   }
// });

// // img es el nombre que tiene en el formulario html
// router.post("/", upload.array("img", 7), async (req, res) => {
//   // convierto en una variable el body del request
//   const { title, description, code, price, stock, category } = req.body;

//   // variable auxiliar que contendrá los path de los thumbnails
//   const thumb_auxiliar = [];

//   // bandera que determina si se deben borrar imagenes si algún error ocurre
//   var temp_image = new Boolean(false);

//   // valido que tenga o no imagenes asociadas en el request
//   if (req.files) {
//     temp_image = true;

//     for (const element of req.files){

//       // valido que el peso sea menor que 4096 (discutible, debe haber otra forma)
//       if ((element.size / 1024)>4096){
//         // si es mayor a 4mb borro el elemento
//         await deleteFiles(thumb_auxiliar);
//         res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
//         return
//       } else {
//         thumb_auxiliar.push("/"+element.filename)
//       }
//     }
//   }
//   if (!title || !description || !price || !code || !stock || !category) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     res.status(400).json({ status: "error", message:"bad request" });
//     return
//   }

//   // elimino los espacios en las palabras y valido valores iguales a 0
//   // en caso de error, si tiene elementos cargados, los borra y retorna un 400
//   if (
//     title.trim() == "" ||
//     description.trim() == "" ||
//     code.trim() == "" ||
//     price <= 0 ||
//     stock <= 0 ||
//     isNaN(price) ||
//     isNaN(stock)
//   ) {
//     res.status(400).json({ status: "error", message:"bad request" });
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     return
//   }
//   try {
//     const resp = await this.pm.save({
//       title,
//       description,
//       code,
//       price,
//       stock,
//       category,
//       thumbnail: thumb_auxiliar
//     });
//     // socketServer.sockets.emit('new_products', resp);
//     const io = req.app.get('socketio');
//     io.emit('new_products',resp);
//     res.status(200).json({ status: "ok", payload: resp });
//   } catch (error) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     console.log(error)
//     res.status(500).json({ status: error, error: error.message });
//   }
// });

// actualización de un producto
// router.put("/:id", upload.array("img", 7), async (req, res) => {
//   // convierto en una variable el contenido del body del request
//   const { title, description, code, price, stock, category } = req.body;

//   // variable auxiliar que contendrá los path de los thumbnails
//   const thumb_auxiliar = [];

//   // bandera que determina si se deben borrar imagenes si algún error ocurre
//   var temp_image = new Boolean(false);
  
//   // valido que tenga o no imagenes asociadas en el request
//   if (req.files) {
//     temp_image = true;
    
//     for (const element of req.files){

//       // valido que el peso sea menor que 4096 (discutible, debe haber otra forma)
//       if ((element.size / 1024)>4096){

//         // si es mayor a 4mb borro el elemento
//         thumb_auxiliar.length > 0 ? await deleteFiles(thumb_auxiliar) : false
//         res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
//         return
//       } else {
//         thumb_auxiliar.push("/"+element.filename)
//       }
//     }
//   }

//   // se validan todos los campos obligatorios
//   if (
//     !title ||
//     !description ||
//     !price ||
//     !code ||
//     !stock ||
//     !category
//   ) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     res.status(400).json({ status:"error", message:'Todos los campos son requeridos' });
//     // res.status(400).json(r.badRequest(res, res, "Todos los campos son requeridos"));
//     return;
//   }

//   const { id } = req.params;

//   const expresion = new RegExp("/[a-z0-9]+/");

//   if (expresion.test(id)) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     res.status(400).json({ status: "error", message: "Invalid id" });
//     return
//   }

//   // se liminan espacios vacios y se validan ceros en los campos
//   if (
//     title.trim() == "" ||
//     description.trim() == "" ||
//     code.trim() == "" ||
//     price <= 0 ||
//     stock <= 0 ||
//     isNaN(price) ||
//     isNaN(stock)
//   ) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     res.status(400).json({status:'error', message:'Existen campos vacíos o no válidos'});
//     // res.status(400).json(r.badRequest(res, "Existen campos vacíos o no válidos"));
//     return
//   }
  
//   // actualizo el producto
//   try {
//     const response = await this.pm.update(id, {title,  description,  price,  code,  stock,  category, thumbnail: thumb_auxiliar});
//     if (response.modifiedCount == 0) {
//       temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//       res.status(400).json({ status:"error", message:'Datos incorrectos actualizando producto' });
//       return
//     }
//     res.status(202).json({status:"success", message:"producto actualizado"})
//     return

//   } catch (error) {
//     temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
//     console.error(">> ErrorM: ",error.message)
//     res.status(500).json({ status:"error", message:'Error actualizando el producto' });
//     return

//   }
// });

// eliminar un producto
// router.delete("/:id", async (req, res) => {
//   // tomo id que se quiere eliminar desde el url y se hacen validaciones
//   const { id } = req.params;

//   const expresion = new RegExp("/[a-z0-9]+/");

//   if (expresion.test(id)) {
//     res.status(400).json({ status: "error", message: "Invalid id" });
//     return
//   }

//   // borra el producto
//   try {
//     const response = await this.pm.delete(id);
//     console.log ("SE RETORNO: ",response);
//     response.thumbnail.length != 0 ? await deleteFiles(response.thumbnail) : false;
//     // socketServer.sockets.emit("del_product", { uid: id });
//     const io = req.app.get('socketio');
//     io.emit('del_product',{ uid: id });
//     res.status(200).json({ status:"success", payload: response });
//     return
//   } catch (error) {
//     console.log (error.message);
//     console.log("USING: >>",id);
//     res.status(500).json({ status:"error", message: "No se pudo eliminar el producto" });
//     return
//   }
// });

// export default router;
