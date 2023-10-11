import { usersModel } from '../models/users.model.js'

export default class UsersManager {
  save = async (user) => {
    return await usersModel.create(user);
  }
  correctLogin = async (user) => {
    console.log("LLEGO: ",user)
    return await usersModel.findOne({email: user.email, password: user.password})
  }
  getOne = async(email) => await usersModel.findOne({email: email})
}