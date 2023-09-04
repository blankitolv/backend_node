import { Router } from 'express';
import { ProductManager }  from '../clase.js'
import { CartManager }  from '../clase.js'
import Response from '../errorMessages.js'
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'
const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// si el producto es eliminado o actualizado con imagenes, el archivo anterior se borra
// luego de 3 segundos para poder ser visualizado, posteriormente se va a eliminar el tiempo
const deleteFiles = async (...paths)=>{
  console.log(paths)
  console.log(paths.length)
  setTimeout(()=>{
    for (const one of paths) {
      fs.promises.unlink(path.join(__dirname, '../public/img'+one))
    }
  },3000)
}


// es un objeto que va a utilizar multer con dos callbacks 
const storage = multer.diskStorage({
  // donde lo guardo
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/img'));
  },

  // como lo guardo
  filename: (req, file, cb) => {
    // img-201245.jpeg
    cb(null, file.fieldname + "-" + Date.now())
  }
})
const upload = multer({ storage })

// se crea una instancia de product manager para ser utilizada y cargada en memoria
const productM = new ProductManager();


// solicita productos del sistema [verificado]
router.get('/', async(req,res)=>{
  // creo una instancia de mi sistema de respuesta
  let r = new Response()

  // solicito todos los productos
  let productos = await productM.getProducts()
  
  if (productos.error) {
    res.status(500).json(r.internalServerError(productos.error));
    return
  }

  // verifico si tiene query params
  if (Object.keys(req.query).length !== 0) {
    // valido el url, si tiene limite se elimina archivos fuera de limite
    if (req.query.limit) {
      const limit = parseInt(req.query.limit)
      productos = productos.slice(0,limit)
    } else {
      res.status(400).json(r.badRequest());
      return
    }
  }

  // retorna el arreglo de productos
  res.status(200).json(r.ok(productos));
})

// solicita un producto por numero de id [verificado]
router.get('/:pid', async(req,res)=>{
  // creo una instancia de mi sistema de respuesta
  let r = new Response()  
  
  // parseo el id de param para validar tipo de dato
  const pid = parseInt(req.params.pid);
  
  // valido que sea un número y que sea mayor o igual a 0
  // console.log("isNaN", isNaN(pid))
  if (pid<=0 || isNaN(pid) ){
    res.status(400).json(r.badRequest());
    return
  }
  
  // solicito el producto por id
  const product = await productM.getProductById(pid)
  
  // si retorna un mensaje, el producto no existe
  if (product.message) {
    res.status(404).json(r.notFound(product.message));
    return 
  }

  // si retorna un error es interno del sistema
  if (product.error) {
    res.status(500).json(r.internalServerError(product.error));
  }

  // si pasó por todos los filtros y validaciones, retorna product
  res.status(200).json(r.ok(product))

})


// img es el nombre que tiene en el formulario html
router.post('/', upload.array("img",7), async (req,res)=>{
  // creo una instancia de mi sistema de respuesta
  const r = new Response()

  // convierto en una variable el body del request
  const product = req.body
  product.price = Number(product.price)
  product.stock = parseInt(product.stock)
  // valido que tenga o no imagenes asociadas en el request
  if (req.files) {

    // genero una variable auxiliar que contendrá los path de los thumbnails
    const auxiliar = []
    for (const element of req.files){

      
      // valido que el peso sea menor que 4096 (discutible, debe haber otra forma)
      if ((element.size / 1024)>4096){
        
        // si es mayor a 4mb borro el elemento
        await deleteFiles([element.filename])
        
        // retorno bad request
        res.status(400).json(r.badRequest("Tamaño máximo del archivo es 4Mb"));
        return
      }
      // si pasó la validación, lo agrego al arreglo auxiliar
      auxiliar.push("/"+element.filename)
    }

    // si el arreglo auxiliar contiene elementos, lo asigno al producto "product"
    if (auxiliar.length > 0) {
      product.thumbnail = auxiliar
    }
  }
  
  // si product no está asignado, le asigno "N/C" (no contiene) al producto
  if (product.thumbnail == undefined ){
    product.thumbnail = "N/C"
  }

  // elimino los espacios en las palabras y valido valores iguales a 0
  // en caso de error, si tiene elementos cargados, los borra y retorna un 400
  if (product.title.trim() == "" || product.description.trim() == "" || product.code.trim() == "" || product.price <= 0 || product.stock <= 0 || isNaN(product.price) || isNaN(product.stock)){

    if (product.thumbnail != "N/C"){
      await deleteFiles(product.thumbnail)
    }
    console.log (product)
    res.status(400).json(r.badRequest("Existen campos vacíos o no válidos"));
    return
  }


  // valido que los campos obligatorios se encuentren presentes
  if ( !product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
    console.log (product)
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Todos los campos son requeridos"));
    return
  }


  // le asigno un valor = true a status, doy por sentado que se crean productos con status true
  product.status = true

  // agrego el producto
  const response = await productM.addProduct(product)
  
  // si el resultado es un internal server error o bad request lo filtro y sale automáticamente
  const ok = r.handler_message(res, response)
  if (!ok.continue) {
    return
  }

  // caso contrario retorna un 200 con el producto cargado y un mensaje acorde
  res.status(200).json(r.ok(ok.content.message))

})


// actualización de un producto
router.put('/:pid', upload.array("img",7),async(req,res)=>{
  const r = new Response()

  // convierto en una variable el contenido del body del request
  const product = req.body
  product.price = Number(product.price)
  product.stock = parseInt(product.stock)

  // consulto si tiene imagenes
  if (req.files) {
    product.thumbnail = [];
    for (const element of req.files){
      if ((element.size / 1024)>4096){
        await deleteFiles([element.filename])
        res.status(400).json(r.badRequest("Tamaño máximo del archivo es 4Mb"));
        return
      }
      product.thumbnail.push("/"+element.filename)
    }
  }

  // tomo del url el valor del id de un producto
  const { pid } = req.params
  
  // lo convierto en un número para filtrar posibles errores
  product.uid = parseInt(pid)
  
  // se valida que el id del producto luego de ser parseado no es un numero
  if (isNaN(product.uid)){
    res.status(400).json(r.badRequest("Todos los campos son requeridos"));
    return
  }

  // tomo cómo error si el valor del id del producto es menor o igual a 0
  // si tiene algun error elimino las imagenes del servidor
  // y retorna con un error 400
  if (product.uid <= 0 ) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Error en el id de producto"));
    return
  }

  // se liminan espacios vacios y se validan ceros en los campos
  if (product.title.trim() == "" || product.description.trim() == "" || product.code.trim() == "" || product.price <= 0 || product.stock <= 0 || isNaN(product.price) || isNaN(product.stock)){
    if (req.files.length > 0) {
      await deleteFiles(product.thumbnail)
    }
    res.status(400).json(r.badRequest("Existen campos vacíos o no válidos"));
    return
  }

  // se validan todos los campos obligatorios
  if ( !product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
    if (req.files.length > 0) {
      await deleteFiles(product.thumbnail)
    }
    res.status(400).json(r.badRequest("Todos los campos son requeridos"));
    return
  }

  // elimino status para que no se actualice en la base de datos
  // doy por centado que se realiza en otro endpoint posteriormente
  delete product.status;

  // actualizo el producto
  const response = await productM.updateProduct(product)
  const ok = r.handler_message(res, response)
  if (!ok.continue) {
    return
  }

  // si llegó hasta acá contesto con un mensaje acordé y un 200 al front
  res.status(200).json(r.ok(ok.content.message))
})

// eliminar un producto
router.delete('/:pid', async(req,res)=>{
  // genero una instancia de mi clase de respuesta al front
  const r = new Response()

  // tomo id que se quiere eliminar desde el url y se hacen validaciones
  const { pid } = req.params
  const pid_int = parseInt(pid)
  if (isNaN(pid_int)){
    res.status(400).json(r.badRequest("error en id, solo se aceptan numeros"));
    return
  }

  // se valida el id no sea negativo ni igual a 0
  if (pid_int <= 0  ){
    res.status(400).json(r.badRequest("error en id f2"));
    return
  }

  // borra el producto
  const response = await productM.deleteProduct(pid_int)
  const ok = r.handler_message(res, response)
  if (!ok.continue) {
    return
  }

  // valida si el producto tenía imagenes, las borra.
  if (ok.continue){
    if (response.product.thumbnail != "N/C") {
      await productM.delete_img(response.product.thumbnail)
    }
  }

  // se crea una instancia del carrito, si el producto eliminado está en un carrito
  // se borra, y si es el unico elemento, se borra el carrito
  const Cart = new CartManager();
  const response2 = Cart.del_for_all_carts(pid_int)
  const ok2 = r.handler_message(res, response2)
  if (!ok2.continue) {
    return
  }

  // si llego hasta acá se hace una respuesta acorde y se retorna un 200
  res.status(200).json(r.ok(response.message));
})




export default router