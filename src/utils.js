// recursos de terceros
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

// mis recursos
import { productsModel } from "./dao/models/products.model.js";
import { PRIVATE_KEY_JWT } from "./config/constant.config.js";

// hash password
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// hash req password and verify
export const isValidPassword = (plainPass, hashedPass) => bcrypt.compareSync(plainPass, hashedPass);
  

// JWT -- genera y retorna token de JWT
export const generateToken = (user) => {
  delete user.password;
  const token = jwt.sign({user}, PRIVATE_KEY_JWT, { expiresIn: '24h'});
  return token;
}


// esta función retorna un string con la hora actual
export const tiempo = () => {
  const fechaActual = new Date();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const segundosActuales = fechaActual.getSeconds();
  return `${horaActual}:${minutosActuales}:${segundosActuales}`;
};


// export const authToken = (req,res,next) => {
//   const authToken = req.headers.authorization;
//   if (!authToken) return res.status(401).send({status:'error', message:'sin autenticación'});
//   const token = authToken.split(' ')[1];

//   jwt.verify(token, JWT_PASS, (error, credentials)=>{
//     if (error) return res.status(403).send({status:"error",message: "not authorized"})
//     req.user = credentials.user;
//     next();
//   })
// }

// esta función carga productos a la base de datos
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

export const mongo_data = new Map();
mongo_data.set( "cloud", "mongodb+srv://lucasvega2:74xHqd5ppo9pnpV0@cluster0.aykz8q6.mongodb.net/integradora2?retryWrites=true&w=majority");
mongo_data.set( "local", "mongodb://localhost:27017/ecommerce2");

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
