import mongoose from "mongoose";

const rolesPosibles = ["public", "admin"];

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [
      {
        type: String,
        enum: rolesPosibles, // Enumerador para roles permitidos
      },
    ],
    default: ["public"],
  }, // Valor predeterminado
  birthday: {
    type: String, // Puedes utilizar otro tipo de dato si prefieres una fecha
  },
  timestamp: {
    type: Date,
    default: Date.now, // Establece la fecha actual como valor predeterminado
  },
  status: {
    type: Boolean,
    default: true, // Establece el valor predeterminado como true (activo)
  },
});

export const usersModel = new mongoose.model(usersCollection, usersSchema);
