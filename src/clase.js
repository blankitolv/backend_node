/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

/*
f: recibe un arreglo de productos y
valida si el codigo de producto existe en ese arreglo
r: un posible error y mensaje
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log (path.join(__dirname,"../db/prods2.json"))

const notDuplicatedCode = (code, products) =>{
  // console.log (code, products)
  const error = {valid:false, msg:""}
  let found = products.find(el =>el.code == code)
  if (found != undefined) {
    error.valid = true
    error.msg = "El codigo de producto ya existe"
  }
  return error
}

export class ProductManager {
  constructor() {
    this.path = path.join(__dirname,"../db/prods2.json")
    // si el archivo no existe, lo genera cómo array vacío.
    if (!fs.existsSync(this.path)){
      let empty_array = []
      fs.promises.writeFile(this.path,empty_array,(err)=> {
        if (err) {
            console.log ('error al crear el archivo')
            return
        }
    })
    }
  }

  /*
  Recibe un arreglo de strings y borra todos los elementos de la carpeta
  img que estén en el arreglo
  */
  async delete_img (...paths){
    console.log ("Tenia imagenes asociada... eliminando...")
    setTimeout(async()=>{
      for (const one of paths) {
        try {
          await fs.promises.unlink(path.join(__dirname, './public/img/'+one))
          console.log ("Archivo eliminado")
        } catch (err){
          return ({error: err})
        }
      }
    },1000)
  }


  async addProduct(newProduct) {
      let db_aux = []
      let uid
      delete newProduct.img
      console.log ("clase: thumb:",newProduct.thumbnail)
      // se trae el archivo
      try {
        const res = await fs.promises.readFile(this.path,"utf8")
        if (res.length === 0) {
          uid = 1
        } else {
          // convierte el archivo en un arreglo de objetos
          db_aux = await JSON.parse(res)

          // se ordena para tomar el ultimo id
          let s = db_aux.sort((a,b)=>(a.id - b.id))

          // se toma el id del ultimo valor y se incrementa en uno
          // se guarda en una variable con scope superior
          uid = s[s.length-1].uid+1;
        }

        // verifica que no esté duplicado el codigo
        let err = notDuplicatedCode(newProduct.code, db_aux) 
        if (err.valid) {
          // throw new Error(` El código \"${newProduct.code}\" ya se encuentra registrado `)
          return ( { badRequest: `Código de producto ya registrado` } )
        } 

        // si llegó a esta instancia se agrega al arreglo
        db_aux.push({...newProduct,uid})
        // se guarda el documento
        try {
          await fs.promises.writeFile(this.path,JSON.stringify(db_aux,null,2))
          return ( { message:" Producto cargado " } )
        } catch (err) {
          return { error: "Error escribiendo el archivo", internalServerError: err.message}
        }
      } catch (error) {
        return { error: `ocurrió un error `}
      }
  }

  // retorna arreglo de todos los productos del sistema
  async getProducts(){
    let aux

    // se lee el archivo
    await fs.promises.readFile(this.path,"utf8")
      .then(res => {
        if (res.length != 0) {
          aux = JSON.parse(res)
        } else {
          aux = []
        }
      })
      .catch(error =>{
        console.log(error);
        return { error: "Ooops, ocurrió un error"}
      })
    return aux
  }

  // busca y retorna un producto por su numero de id
  async getProductById(id) {
    let db_aux

    try {

      // se lee el archivo
      const res = await fs.promises.readFile(this.path,"utf8");
      if (res.length === 0) {
        throw new Error("archivo vacío") 
      }
      db_aux = await JSON.parse(res)
      
      // busca el item por id
      const find = db_aux.find(e => e.uid == id)
      if (find) {
        return find
      } else {
        return { message: `no existe el producto con id: ${id}`, badRequest: `no existe el producto` }
      }
    } catch (err) {
      return { error: "ocurrió un error-> ",err}
    }
  }

  /*
  consulta contra la base de datos si existe un producto y lo retorna
  */
  async ExistsProducts(ids) {
    let db_aux

    try {
      // se lee el archivo
      const res = await fs.promises.readFile(this.path,"utf8");
      if (res.length === 0) {
        throw new Error("archivo vacío") 
      }

      db_aux = await JSON.parse(res)
      let prod_to_return = []
      // busca el item por id
      for (const one of ids) {
        const ok = db_aux.find(e => e.uid == one.id)
        
        if (ok == undefined) {
          return ( {exist: false, badRequest:"no existe el producto"} )
        }
        prod_to_return.push(ok)
      }

      return ({exist: true, products: prod_to_return})
    } catch (err) {
      return { error: "ocurrió un error-> ",err}
    }
  }
  
  // actualiza un producto
  async updateProduct (oneProduct){
    delete oneProduct.img
    let db
    let idx
    try {
      // lee el archivo
      const data = await fs.promises.readFile(this.path,"utf8")
      db = JSON.parse(data)

      // si el archivo tiene length 0 está vacío
      if (db.length == 0) {
        return ( { badRequest: "no tiene productos cargados" } )
      }
      
      // solicita la ubicación del objeto según su id
      let find_idx = db.findIndex(e => e.uid == oneProduct.uid)
      
      // valida haberlo encontrado satisfactoriamente
      if (find_idx == "-1") {
        return ( { badRequest: "no existe el producto" })
        // throw new Error(`id de producto [id:${oneProduct.uid}]fuera de rango`)
      }

      // se filtra por codigo para no actualizar a un codigo existente
      const filtred = db.filter(e => e.code == oneProduct.code)

      // se verifica que el id sea igual
      // si el producto que se piensa
      if (filtred.length != 0) {
        if (db[find_idx].uid != filtred[0].uid){
          return ( { badRequest: "codigo de producto ya se encuentra en uso" } )
        }
      }

      // asigno find_idx (ubicación del item) a una variable con scope superior
      idx = find_idx;
    } catch (err) {
      return { error: `error al actualizar el producto `}
    }
    
    // logica del thumbnail (discutible)

    // si viene un producto con imagen
    //    y ya tenia una imagen --> borrar imagen anterior
    //    y no tenia una imagen --> guardar la imagen
    // si viene un producto sin imagen
    //    y ya tenia una imagen --> dejar la imagen que tenia
    //    y no tenia una imagen --> dejar sin imagen
    
    
    // si viene un producto con imagen
    if (oneProduct.thumbnail.length != 0){
      //    y ya tenia una imagen --> borrar imagen anterior
      if (db[idx].thumbnail != "N/C"){
        const ok = this.delete_img(db[idx].thumbnail) 
        if (ok.error){
          return ({error: "error borrando la imagen del producto"})
        }
      }      
      // si viene un producto sin imagen
    } else {
      // y ya tenia una imagen --> dejar la imagen que tenia
      if (db[idx].thumbnail != "N/C"){
        oneProduct.thumbnail = db[idx].thumbnail
        //    y no tenia una imagen --> dejar sin imagen
      } else {
        oneProduct.thumbnail = "N/C"
      }      
    }

    // mantengo el estado, supongo que será en un futuro otro endpoint para desactivar/activar producto
    oneProduct.status = db[idx].status

    // piso el contenido según el index| "actualizo el item"
    db[idx]=oneProduct;

    // guardo en el archivo
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(db,null,2))
      return { message: "producto actualizado"}
    } catch (error) {
      console.log (error)
      return { error: "error escribiendo sobre el archivo"}
    }
  }

  // borra un producto por id
  async deleteProduct (id){

    let db
    let idx
    console.log ("eliminar producto: ",id)
    try {
      // lee el archivo
      const data = await fs.promises.readFile(this.path,"utf8")
      db = JSON.parse(data)
      if (db.length == 0) {
        throw new Error("No tiene productos cargados")
      }

      // solicita la ubicación del objeto según su id
      let find = db.findIndex(e => e.uid == id)
      
      // si no lo encuentra genera un error
      if (find == "-1") {
        return ( {badRequest: "no existe el id del"} )
      }
          
      // asigno el indice a una variable con scope superior
      idx = find;
    } catch (error) {
      return {error: `borrar producto error: ${error.message}`}
    }
    
    let aux = []

    // genero un nuevo arreglo con todos los items, menos el que
    // se desea eliminar
    db.forEach(each_product => {
      if (each_product.uid != db[idx].uid){
        aux.push(each_product)
      }
    });


    // se guarda el archivo con el nuevo arreglo sin el item 
    // a eliminar
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(aux,null,2))
      return {message:`producto eliminado`, product:db[idx]}
    } catch (error) {
      return { error: "error al escribir en el archivo."}
    }
  }
}




// carrito de compras
export class CartManager {
  constructor() {
    this.path = path.join(__dirname,"../db/carts.json")
    // si el archivo no existe, lo genera cómo array vacío.
    if (!fs.existsSync(this.path)){
      let empty_array = []
      fs.promises.writeFile(this.path,empty_array,(err)=> {
        if (err) {
            console.log ('error al crear el archivo')
            return
        }
      })
    }
  }

  // elimina un producto de todos los carrito por id
  // si existe solamente ese producto, elimina el carrito completo
  async del_for_all_carts(id) {
    let db_aux
    try {
      console.log (id)
      // se lee el archivo
      const res = await fs.promises.readFile(this.path,"utf8");
      if (res.length === 0) {
        throw new Error("archivo vacío") 
      }
      db_aux = await JSON.parse(res)
    } catch (err){
      return {error: err}
    }

    // por cada uno de los carritos de compra
    db_aux.forEach((each_cart,idx) => {
      const filtered_cart = each_cart.products.filter(one => one.id != id) 
      // si el carrito queda con 0 elementos borra el carrito
      if (filtered_cart.length == 0) {
        db_aux.splice(idx,1)
      } else {
        // le agrega todos los elementos, menos el borrado
        db_aux[idx].products = filtered_cart
      }
    });
     // se guarda el documento
     try {
      await fs.promises.writeFile(this.path,JSON.stringify(db_aux,null,2))
      return ({message:" Carritos actualizados "})
    } catch (err) {
      return { error: "Error escribiendo el archivo"}
    }
  }

  // recibe un arreglo de productos y crea un carrito
  async createCart(products){
    try {
      const res = await fs.promises.readFile(this.path,"utf8")
      let uid = -1
      let db_aux = []
      if (res.length === 0) {
        uid = 1
      } else {
        // convierte el archivo en un arreglo de objetos
        db_aux = await JSON.parse(res)

        // se ordena para tomar el ultimo id
        let s = db_aux.sort((a,b)=>(b.id - a.id))

        // se toma el id del ultimo valor y se incrementa en uno
        // se guarda en una variable con scope superior
        uid = s[0].id+1;
      }

      // no se puede crear un carrito sin productos
      if (products.length == 0) {
        throw new Error("Acción no disponible, sin productos")
      }
      
      // si llegó a esta instancia se agrega al arreglo
      const obj_to_save = {id:uid, products}
      db_aux.push(obj_to_save)

      // se guarda el documento
      try {
        await fs.promises.writeFile(this.path,JSON.stringify(db_aux,null,2))
        return ({message:" Carrito cargado ", id:obj_to_save.id })
      } catch (err) {
        return { error: "Error escribiendo el archivo"}
      }
    } catch (error) {
      return { error: `ocurrió un error || ${error} \n`}
    }
  }

  // consulta si existe el carrito y retorna el objeto encontrado
  async Exists(id){
    let db_aux = []
    try {
      // se lee el archivo
      const res = await fs.promises.readFile(this.path,"utf8");
      if (res.length === 0) {
        throw new Error("archivo vacío") 
      }
      db_aux = await JSON.parse(res)

      // busca el carrito por id
      const find = db_aux.find(e => e.id == id)
      if (find) {
        return { message: 'carrito encontrado', carrito: find}
      } else {
        return { error: `no existe el carrito con id: ${id}`}
      }
    } catch (err) {
      return { error: "ocurrió un error-> ",err}
    }
  }

  // actualiza un carrito de productos
  async updateCart(products) {
    let db_aux = []
    try {
      // se lee el archivo
      const res = await fs.promises.readFile(this.path,"utf8");
      if (res.length === 0) {
        throw new Error("archivo vacío") 
      }
      db_aux = await JSON.parse(res)

      // retorna todos los elementos MENOS el que llega cómo parametro
      const filter_db =  db_aux.filter(one => one.id !== products.id)

      // agrega el elemento a la nueva base de datos
      filter_db.push(products)

      // se guarda el documento
      try {
        await fs.promises.writeFile(this.path,JSON.stringify(filter_db,null,2))
        return ({message:" Carrito actualizado "})
      } catch (err) {
        return { error: "Error escribiendo el archivo"}
      }

    } catch (err) {
      return { error: "ocurrió un error-> ",err}
    }
  }
}
