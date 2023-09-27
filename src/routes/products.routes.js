import { Router } from "express";

// deprecar
// import { ProductManager } from "../clase.js";
// import { CartManager } from "../clase.js";
// deprecar

import ProductManagerv2 from "../dao/bdmanager/products.manager.js";

import Response from "../errorMessages.js";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import { socketServer } from "../app.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pm = new ProductManagerv2();
// post ok: { continue: true, content: { message: ' Producto cargado ', id: 36 } }

// si el producto es eliminado o actualizado con imagenes, el archivo anterior se borra
// luego de 3 segundos para poder ser visualizado, posteriormente se va a eliminar el tiempo
const deleteFiles = async (...paths) => {
  console.log("borrando imagenes")
  if (paths.length == 0) {
    return
  }
  console.log(paths);
  console.log(paths.length);
  setTimeout(() => {
    for (const one of paths) {
      fs.promises.unlink(path.join(__dirname, "../public/img" + one));
    }
  }, 1000);
};

// es un objeto que va a utilizar multer con dos callbacks
const storage = multer.diskStorage({
  // donde lo guardo
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/img"));
  },

  // como lo guardo
  filename: (req, file, cb) => {
    // img-201245.jpeg
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage });

// se crea una instancia de product manager para ser utilizada y cargada en memoria
// const productM = new ProductManager();

// solicita productos del sistema [verificado]
router.get("/", async (req, res) => {
  // creo una instancia de mi sistema de respuesta
  // const r = new Response(req.headers.referer || '');

  // verifico si tiene query params
  // if (Object.keys(req.query).length !== 0) {
  // valido el url, si tiene limite se elimina archivos fuera de limite

  let productos;

  if (req.query.limit != undefined) {
    const limit = parseInt(req.query.limit);
    
    productos = await pm.getLimit(limit);
  } else {
    // solicito todos los productos
    productos = await pm.getAll();
  }
  // }

  // if (productos.error) {
  //   res.status(500).json(r.internalServerError(productos.error));
  //   return
  // }

  res.status(200).json(productos);
  // retorna el arreglo de productos
  // res.status(200).json(r.ok(productos));
});

// solicita un producto por numero de id [verificado]
router.get("/:id", async (req, res) => {
  console.log("-----------------------------------------")
  // creo una instancia de mi sistema de respuesta
  // const r = new Response(req.headers.referer || "");

  // valido id
  const { id } = req.params;

  const expresion = new RegExp("/[a-z0-9]+/");

  if (expresion.test(id)) {
    res.status(400).json({ status: "error", message: "Invalid id" });
    return;
  }

  // solicito el producto por id
  try {
    
    const product = await pm.getOne(id);
    res.status(200).json({ status: "success", payload: product });
    return;
  } catch (error) {
    console.error(">> ERROR: ", error.message);
    console.error(">> USING: ", id);
    res
      .status(400)
      .json({ status: "error", message: "error al solicitar el producto" });
    return;
  }
  // si retorna un mensaje, el producto no existe
  // if (product.message) {
  //   res.status(404).json(r.notFound(product.message));
  //   return;
  // }

  // si retorna un error es interno del sistema
  // if (product.error) {
  // res.status(500).json(r.internalServerError(product.error));
  // }

  // si pasó por todos los filtros y validaciones, retorna product
});

// img es el nombre que tiene en el formulario html
router.post("/", upload.array("img", 7), async (req, res) => {
  // creo una instancia de mi sistema de respuesta
  // const r = new Response(req.headers.referer || '');

  // console.log ('product.js post: req:',req.body)
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

        // // si es mayor a 4mb borro el elemento
        await deleteFiles(thumb_auxiliar);
        res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
        return
        // retorno bad request
        // res.status(400).json(r.badRequest(res,"Tamaño máximo del archivo es 4Mb"));
        // res.redirect('/badRequest')
        // return
      } else {
        thumb_auxiliar.push("/"+element.filename)
      }
      // si pasó la validación, lo agrego al arreglo thumb_auxiliar
    }

    // si el arreglo thumb_auxiliar contiene elementos, lo asigno al producto "product"
    // if (thumb_auxiliar.length > 0) {
    //   product.thumbnail = thumb_auxiliar
    // }
  }
  if (!title || !description || !price || !code || !stock || !category) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    res.status(400).json({ status: "error", message:"bad request" });
    return
  }

  // si product no está asignado, le asigno "N/C" (no contiene) al producto
  // if (product.thumbnail == undefined ){
  //   product.thumbnail = "N/C"
  // }

  // valido que los campos obligatorios se encuentren presentes
  // if ( !product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
  // console.log (product)
  // if (product.thumbnail != "N/C"){
  //   await deleteFiles(thumb_auxiliar)
  // }
  // r.badRequest(res, "Existen campos vacíos o no válidos")
  // r.badRequest(res, "Existen campos vacíos o no válidos")

  // }

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
    // if (product.thumbnail != "N/C"){
    //   await deleteFiles(product.thumbnail)
    // }
    // console.log (product)
    // r.badRequest(res,"Existen campos vacíos o no válidos");
    return
  }

  // le asigno un valor = true a status, doy por sentado que se crean productos con status true
  // product.status = true

  // agrego el producto
  // const response = await productM.addProduct(product)

  // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  // const ok = r.handler_message(res, response)
  // if (!ok.continue) {
  //   return
  // }
  // console.log ("post product.js ok:",ok)
  // console.log ("post product.js response:",response)
  // product.uid = response.id;

  // socketServer.sockets.emit('new_products', product);
  
  // caso contrario retorna un 200 con el producto cargado y un mensaje acorde
  // res.status(200).json(r.ok(ok.content.message));
  try {
    const resp = await pm.save({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnail: thumb_auxiliar
    });
    socketServer.sockets.emit('new_products', resp);
    res.status(200).json({ status: "ok", payload: resp });
  } catch (error) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    console.log(error)
    res.status(500).json({ status: error, error: error.message });
  }
  // res.redirect(r.ref);
});

// actualización de un producto
router.put("/:id", upload.array("img", 7), async (req, res) => {
  // const r = new Response(req.headers.referer || "");

  // convierto en una variable el contenido del body del request
  const { title, description, code, price, stock, category } = req.body;
  // const product = req.body;
  // product.price = Number(product.price);
  // product.stock = parseInt(product.stock);

  // consulto si tiene imagenes
  // if (req.files) {
  //   product.thumbnail = [];
  //   for (const element of req.files) {
  //     if (element.size / 1024 > 4096) {
  //       await deleteFiles([element.filename]);
  //       res
  //         .status(400)
  //         .json(r.badRequest(res, "Tamaño máximo del archivo es 4Mb"));
  //       return;
  //     }
  //     product.thumbnail.push("/" + element.filename);
  //   }
  // }

  

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

        // // si es mayor a 4mb borro el elemento
        thumb_auxiliar.length > 0 ? await deleteFiles(thumb_auxiliar) : false
        res.status(400).json({ status: "error", message: "maximo permitido 4mb en multimedia" });
        return
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
      res.status(400).json({ status:"error", message:'Todos los campos son requeridos' });
      // res.status(400).json(r.badRequest(res, res, "Todos los campos son requeridos"));
      return;
    }

  // parseo el id de param para validar tipo de dato
  const { id } = req.params;

  const expresion = new RegExp("/[a-z0-9]+/");

  if (expresion.test(id)) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    res.status(400).json({ status: "error", message: "Invalid id" });
    return
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
    res.status(400).json({status:'error', message:'Existen campos vacíos o no válidos'});
    // res.status(400).json(r.badRequest(res, "Existen campos vacíos o no válidos"));
    return
  }
  
  // elimino status para que no se actualice en la base de datos
  // doy por centado que se realiza en otro endpoint posteriormente
  // delete product.status;
  
  
  // actualizo el producto
  try {
    const response = await pm.update(id, {title,  description,  price,  code,  stock,  category, thumbnail: thumb_auxiliar});
    if (response.modifiedCount == 0) {
      temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
      res.status(400).json({ status:"error", message:'Datos incorrectos actualizando producto' });
      return
    }
    console.info("response >>>>>>>>>>>>> ",response)
    res.status(202).json({status:"success", message:"producto actualizado"})
    return

  } catch (error) {
    temp_image && thumb_auxiliar.length != 0 ? await deleteFiles(thumb_auxiliar) : false;
    console.error(">> ErrorM: ",error.message)
    console.error(">> Error: ",error)
    res.status(500).json({ status:"error", message:'Error actualizando el producto' });
    return

  }
});

// eliminar un producto
router.delete("/:id", async (req, res) => {
  // console.log("se va a borrar un producto");
  // genero una instancia de mi clase de respuesta al front
  // const r = new Response(req.headers.referer || "");

  // tomo id que se quiere eliminar desde el url y se hacen validaciones
  const { id } = req.params;

  const expresion = new RegExp("/[a-z0-9]+/");

  if (expresion.test(id)) {
    res.status(400).json({ status: "error", message: "Invalid id" });
    return
  }

  // const pid_int = parseInt(pid);
  // if (isNaN(pid_int)) {
  //   r.badRequest(res, "error en id, solo se aceptan numeros");
  //   return;
  // }

  // // se valida el id no sea negativo ni igual a 0
  // if (pid_int <= 0) {
  //   r.badRequest(res, "error en id f2");
  //   return;
  // }

  // borra el producto
  try {
    const response = await pm.delete(id);
    console.log ("SE RETORNO: ",response);
    response.thumbnail.length != 0 ? await deleteFiles(response.thumbnail) : false;
    socketServer.sockets.emit("del_product", { uid: id });
    res.status(200).json({ status:"success", payload: response });
    return
  } catch (error) {
    console.log (error.message);
    console.log("USING: >>",id);
    res.status(500).json({ status:"error", message: "No se pudo eliminar el producto" });
    return
  }
  // const ok = r.handler_message(res, response);
  // if (!ok.continue) {
  //   return;
  // }

  // valida si el producto tenía imagenes, las borra.
  // if (ok.continue) {
  //   if (response.product.thumbnail != "N/C") {
  //     await productM.delete_img(response.product.thumbnail);
  //   }
  // }

  // se crea una instancia del carrito, si el producto eliminado está en un carrito
  // se borra, y si es el unico elemento, se borra el carrito
  // const Cart = new CartManager();
  // const response2 = Cart.del_for_all_carts(pid_int);
  // const ok2 = r.handler_message(res, response2);
  // if (!ok2.continue) {
    // return;
  // }

  // si llego hasta acá se hace una respuesta acorde y se retorna un 200
  // res.status(200).json(r.ok(response.message));
});

export default router;
