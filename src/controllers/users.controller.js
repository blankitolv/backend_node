import { login, checkUserExists, createUser } from '../services/users.service.js';

export const verifyAuth = async (req,res) => {
  console.log("LLEGO A VERIFYAUTH")
  return res.sendSuccess();
}

export const userLogin = async (req,res) => {
  const {user_email, password} = req.body;
  try {
    const resp = await login({email: user_email, password})
    if (!resp){
      return res.sendClientError();
    }
    return res.sendSuccess(resp);
  } catch(error){
    return res.sendServerError(error.message);
  }
}

export const userRegister = async(req,res) =>{
  const { birthday, registration_code, user_email, first_name, last_name, password} = req.body;
  const register = { first_name, last_name, registration_code, birthday, email: user_email, password }

  try {
    if (!first_name || !last_name || !birthday || !user_email || !password ) return res.sendClientError('incomplete values');

    // Verificación si el usuario ya existe en el servicio
    const userExists = await checkUserExists(user_email);
    if (userExists) {
      return res.sendClientError('Datos incorrectos en la creación del usuario');
    }
    // Llamada al servicio para crear un hash de la contraseña y guardar el usuario
    const newUser = await createUser(register);
    // Respuesta al cliente
    return res.sendSuccess(newUser);
  } catch (error) {
    console.log (error);
    return res.sendServerError(error.message);
  }

}
