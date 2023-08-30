import { Router } from 'express';
import ProductManager from '../entregable2.js'
import Response from '../errorMessages.js'
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'
const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFiles = async (...paths)=>{
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
    // debería primero enviarlo a temp y luego moverlo de temp a src/img
    cb(null, path.join(__dirname, '../public/img'));
  },

  // como lo guardo
  filename: (req, file, cb) => {
    // img-201245.jpeg
    cb(null, file.fieldname + "-" + Date.now())
  }
})
const upload = multer({ storage })


// const extName = (mime) => {
//   console.log (mime)
//   return "."+mime.split('/')[1];
// }


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
    //valido el url
    // y altera el arreglo de productos
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
  const r = new Response()
  const product = req.body
  if (req.files) {
    product.thumbnail = [];
    // console.log (req.files.length)
    for (const element of req.files){
      product.thumbnail.push("/"+element.filename)
      console.log ("p:> ",element)
      if ((element.size / 1024)>4096){
        await deleteFiles([element.filename])
        res.status(400).json(r.badRequest("Tamaño máximo del archivo es 4Mb"));
        return
      }
    }
  } else {
    product.thumbnail = "N/C"
  }
  // const { title, code, price, stock, category } = req.body;
  console.log (product)
  if ( !product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Todos los campos son requeridos"));
    return
  }
  if (product.title.trim() != "" &&
  product.description.trim() != "" &&
  product.code.trim() != "" &&
  product.price <= 0 &&
  product.stock <= 0) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Existen campos vacíos o no válidos"));
    return
  }

  // le asigno un valor = true a status
  product.status = true

  const response = await productM.addProduct(product)
  if (response.error) {
    res.status(500).json(r.internalServerError(response.error));
    return
  }

  if (response.message){
    res.status(500).json(r.ok(response.message));
    return
  }
  res.status(200);
  // res.redirect('/')
})

router.put('/:pid', upload.array("img",7),async(req,res)=>{
  const r = new Response()
  const product = req.body
  if (req.files) {
    product.thumbnail = [];
    // console.log (req.files.length)
    for (const element of req.files){
      product.thumbnail.push("/"+element.filename)
      console.log ("p:> ",element.filename)
      if ((element.size / 1024)>4096){
        await deleteFiles([element.filename])
        res.status(400).json(r.badRequest("Tamaño máximo del archivo es 4Mb"));
        return
      }
    }
  } else {
    product.thumbnail = "N/C"
  }
  const { pid } = req.params
  
  if (pid <= 0 ) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Error en el id de producto"));
    return
  }
  product.uid = pid

  if ( !product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Todos los campos son requeridos"));
    return
  }
  if (product.title.trim() != "" &&
  product.description.trim() != "" &&
  product.code.trim() != "" &&
  product.price <= 0 &&
  product.stock <= 0) {
    await deleteFiles(product.thumbnail)
    res.status(400).json(r.badRequest("Existen campos vacíos o no válidos"));
    return
  }

  // elimino status para que no se actualice en la base de datos
  delete product.status;

  const response = await productM.updateProduct(product)
  if (response.error) {
    res.status(500).json(r.internalServerError(response.error));
    return
  }

  if (response.message){
    res.status(200).json(r.ok(response.message));
    return
  }

  res.status(200);
  res.redirect('/')
})

router.delete('/:pid', async(req,res)=>{
  const r = new Response()
  const { pid } = req.params
  const pid_int = parseInt(pid)
  if (isNaN(pid_int)){
    res.status(400).json(r.badRequest("error en id, solo se aceptan numeros"));
    return
  }

  if (pid_int <= 0  ){
    res.status(400).json(r.badRequest("error en id f2"));
    return
  }
  
  const response = await productM.deleteProduct(pid_int)
  if (response.error) {
    res.status(500).json(r.internalServerError(response.error));
    return
  }

  if (response.message){
    if (response.product.thumbnail != "N/C") {
      await deleteFiles(response.product.thumbnail)
    }
    res.status(200).json(r.ok(response.message));
    return
  }


  res.status(200).json(r.ok("ok"));

})




export default router