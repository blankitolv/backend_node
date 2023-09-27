// import { cartsModel } from "../models/carts.model.js";
import { chatModel } from "../models/chat.model.js";

export default class ChatManager {

  save = async (message) => {
    return await chatModel.create(message);
  }
  
  getAll = async () => {
    return await chatModel.find().lean();
  }
}