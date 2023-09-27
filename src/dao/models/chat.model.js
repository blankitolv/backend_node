import mongoose from 'mongoose';

const chatCollection = 'chat';

const chatSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  message : {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date, 
    default: Date.now,
  }
  
});

export const chatModel = new mongoose.model(chatCollection, chatSchema);