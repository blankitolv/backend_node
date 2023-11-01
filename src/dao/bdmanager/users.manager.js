import { usersModel } from '../models/users.model.js'

export default class UsersManager {
  save = async (user) => {
    // se crea un usuario
    console.log (user)
    return await usersModel.create(user);
  }
  correctLogin = async (user) => {
    console.log("LLEGO: ",user)
    return await usersModel.findOne({email: user.email, password: user.password})
  }
  getOne = async(email) => {
    const resp = await usersModel.findOne({email: email}).lean();
    console.log (resp);
    return resp
  }
  getById = async(id) => {
    try {
      return await usersModel.findById( id ).lean();
    } catch (error) {
      console.log("id: ",id," -- error solicitando por id", error)
    }
  }
}