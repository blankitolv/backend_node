/*
Estudiante: Lucas Vega
Tutor: Leonardo Pihuala
COM: 47300
*/

const fs = require('fs');
const path = require('path');

/*
f: recibe un arreglo de productos y
valida si el codigo de producto existe en ese arreglo
r: un posible error y mensaje
*/
const notDuplicatedCode = (code, products) =>{
  console.log (code, products)
  const error = {valid:false, msg:""}
  let found = products.find(el =>el.code == code)
  if (found != undefined) {
    error.valid = true
    error.msg = "El codigo de producto ya existe"
  }
  return error
}

class ProductManager {
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
  f: recibe un objeto de un producto
  y lo agrega al arreglo products y lo guarda.
  r: un posible error y mensaje
  */
  async addProduct(newProduct) {

    // se validan datos 
    if ( !newProduct.title ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.thumbnail ||
      !newProduct.code ||
      !newProduct.stock
      ) {
        return { error: "todos los campos son obligatorios"}
      }
      let db_aux = []
      let uid
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
          throw new Error(` El código \"${newProduct.code}\" ya se encuentra registrado `)
        } 

        // si llegó a esta instancia se agrega al arreglo
        db_aux.push({...newProduct,uid})

        // se guarda el documento
        try {
          await fs.promises.writeFile(this.path,JSON.stringify(db_aux,null,2))
          return ({message:" Producto cargado "})
        } catch (err) {
          return { error: "Error escribiendo el archivo"}
        }
      } catch (error) {
        return { error: `ocurrió un error || ${error} \n`}
      }
  }

  // retorna el arreglo products
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
        return { message: `no existe el producto con id: ${id}`}
      }
    } catch (err) {
      return { error: "ocurrió un error-> ",err}
    }
  }
  
  async updateProduct (oneProduct){

    let db
    let idx
    try {
      // lee el archivo
      const data = await fs.promises.readFile(this.path,"utf8")
      db = JSON.parse(data)

      // si el archivo tiene length 0 está vacío
      if (db.length == 0) {
        throw new Error("No tiene productos cargados")
      }
      
      // solicita la ubicación del objeto según su id
      let find_idx = db.findIndex(e => e.uid == oneProduct.uid)
      
      // valida haberlo encontrado satisfactoriamente
      if (find_idx == "-1") {
        throw new Error(`id de producto [id:${oneProduct.uid}]fuera de rango`)
      }

      // se filtra por codigo para no actualizar a un codigo existente
      const filtred = db.filter(e => e.code == oneProduct.code)

      // console.log ("db[find_idx].uid: ",db[find_idx].uid)
      // console.log ("filtred[0].uid: ",filtred[0].uid)
      // se verifica que el id sea igual
      if (filtred.length != 0) {
        console.log ("f>>:",filtred)
        if (db[find_idx].uid != filtred[0].uid){
          throw new Error (`El codigo ${oneProduct.code} ya se encuentra en uso por producto con id ${filtred[0].uid}`)
        }
      }

      // asigno find_idx (ubicación del item) a una variable con scope superior
      idx = find_idx;
    } catch (err) {
      return { error: `error al actualizar el producto || ${err.message}`}
    }

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
        throw new Error(`id de producto [${id}] fuera de rango`)
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
      return {message:`producto ${JSON.stringify(db[idx])} \n fue eliminado`}
    } catch (error) {
      return { error: "error al escribir en el archivo."}
    }
  }
}

soft = new ProductManager();

module.exports = ProductManager;