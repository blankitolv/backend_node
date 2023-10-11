import path from "path";
import { fileURLToPath } from "url";
// SI SE QUIEREN CARGAR PRODUCTOS DESDE EL JSON QUE ESTÁ EN LA CARPETA BD
// import movies from '../db/prods_mongoose.json'
import fs from "fs";
import { productsModel } from "./dao/models/products.model.js";
import bcrypt from "bcrypt";

export const createHash = password => 
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (plainPass, hashedPass) => {
    // retorna bool
    bcrypt.compareSync(plainPass, hashedPass);
  }

export const charge_products = async (need_charge = false) => {
  if (!need_charge) {
    return;
  }

  try {
    console.log(__dirname)
    // Utiliza la función fs.readFile para leer el archivo
    const data = await fs.promises.readFile(
      path.join(__dirname,"..","db","prods_mongoose.json"),
      // "prods_mongoose.json",
      "utf8"
    );

    // El contenido del archivo se encuentra en la variable 'data'
    const contenidoJSON = JSON.parse(data);
    console.log("Contenido del archivo JSON:", contenidoJSON);
    // carga de productos
    if (data.length == 0) {
      console.log("length de data de productos es cero")
      return
    }
    console.log (data)
    try {
      const responseInsert = await productsModel.insertMany(contenidoJSON);
      console.log(responseInsert);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

const __filename = fileURLToPath(import.meta.url);
export const tiempo = () => {
  const fechaActual = new Date();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const segundosActuales = fechaActual.getSeconds();
  return `${horaActual}:${minutosActuales}:${segundosActuales}`;
};

export const mongo_data = new Map();
mongo_data.set(
  "cloud",
  "mongodb+srv://lucasvega2:74xHqd5ppo9pnpV0@cluster0.aykz8q6.mongodb.net/?retryWrites=true&w=majority"
);
mongo_data.set("local", "mongodb://localhost:27017/ecommerce");




export const __dirname = path.dirname(__filename);
