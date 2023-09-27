import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
export const tiempo = () => {
  const fechaActual = new Date();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const segundosActuales = fechaActual.getSeconds();
  return `${horaActual}:${minutosActuales}:${segundosActuales}`;
}

export const mongo_data = new Map();
mongo_data.set('cloud','mongodb+srv://lucasvega2:74xHqd5ppo9pnpV0@cluster0.aykz8q6.mongodb.net/?retryWrites=true&w=majority');
mongo_data.set('local','mongodb://localhost:27017/ecommerce');

export const __dirname = path.dirname(__filename);

