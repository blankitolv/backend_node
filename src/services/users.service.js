// import ProductManagerv2 from "../dao/bdmanager/products.manager.js";
// const pm = new ProductManagerv2();
import UsersManager from '../dao/bdmanager/users.manager.js';
import { CODIGO_SECRETO } from '../config/constant.config.js';
import { isValidPassword, generateToken, createHash } from "../utils.js";

const users = new UsersManager();

const login = async (user) => {
  const resp = await users.getOne(user.email)
  if (!resp) return
  const comparePass = isValidPassword(user.password, resp.password)
  if (!comparePass) return
  const accessToken = generateToken(resp);
  return accessToken
}

// Método para verificar si el usuario existe
async function checkUserExists(user_email) {
  const user = await users.getOne(user_email);
  return user !== null;
}

// Método para crear un usuario con contraseña hasheada
async function createUser(userData) {
  const { first_name, last_name, registration_code, birthday, email, password  } = userData;

  const userExists = await checkUserExists(email);
  if (userExists) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = createHash(password);
  let roles = [];
  if (registration_code) {
    if (registration_code.toUpperCase() === CODIGO_SECRETO.toUpperCase()){
      roles = ['ADMIN'];
    } else {
      throw new Error('error en el codigo de registro');
    }
  } else {
    roles = ['USER'];
  }
  userData.password = hashedPassword;
  const newUser = await users.save(userData);
  const userResponse = newUser.toObject();
  console.log(userResponse);
  delete userResponse.password;
  return userResponse;
}
export {
  login,
  checkUserExists,
  createUser,
}