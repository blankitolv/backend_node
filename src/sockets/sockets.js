import ChatManager from '../dao/bdmanager/chat.manager.js';
import ProductManagerv2 from '../dao/bdmanager/products.manager.js'
import { tiempo } from '../utils.js'


let users = [];
let public_messages = [];
const chatM = new ChatManager();

export default (io) => {
  io.on("connection",async socket =>{
    console.log ("nuevo usuario conectado: ",socket.id)
  
    // se genera desde el method POST product.js
    socket.on("new_products", data => {
      console.log("EMITE MENSAJE DE ACTUALIZACION DE PRODUCTO")
      socket.emit('new_products',data);
    })
  
    socket.on('session', ()=>{
      const session = socket.request.session;
      console.log (session);
    })
  
    socket.on("signin", data =>{
      console.log (">> llego: ",data, socket.id);
      let status ="success";
      if (data.trim() == "") {
        status ="error";
      }
      const expresion = /[a-z0-9]+@[a-z0-9]+\.[a-z]+/;
  
      if (!expresion.test(data)){
        status="error";
      }
  
      if (status=="error") {
        socket.emit('logued', JSON.stringify({status}))
        return
      }
  
      users.push({conn:socket.id, username: data})
      
      socket.emit('logued', JSON.stringify(
        {
          status: 'success',
          user: {
            username: data,
            id: socket.id,
            aux: [] 
          }
        }
      ))
      socket.broadcast.emit("userLogged",JSON.stringify({data}))
    })
  
    socket.on('disconnect', () => {
      const user_disconected = users.filter(user => user.conn == socket.id)
      if (user_disconected.length == 0) {
        return
      }
  
      io.emit('userDisconnected', user_disconected[0])
      users = users.filter(oneUser => oneUser.conn !== user_disconected[0].conn);
    })
  
  
  
  
  
  
    socket.on("new_messagev2", data =>{
      console.log (socket.id, "envió el mensaje: ",data);
      const this_user = users.filter(user => user.conn == socket.id)
      console.log ("FILTRO: ",this_user)
      if (this_user.length == 0) {
        return
      }
  
      // console.log ("USERNAME: ",this_user[0].username)
      // console.log ("MENSAJE: ",data)
      const msg = {username: this_user[0].username, message: data, timestamp:tiempo()}
      
      public_messages.push(msg)
      
      try {
        const resp = chatM.save({username: this_user[0].username, message: data })
        io.emit("new_message_recibed", JSON.stringify(msg))
      } catch (error) {
        console.log("error guardando mensaje nuevo")
      }
  
    })
  
    socket.on("all_messages", async data => {
      try {
        const all = await chatM.getAll()
        socket.emit("historic_room_message", JSON.stringify(all))
        console.log ("SE ENVIA HISTORICO: ",all)
      } catch (error) {
        console.log ("error solicitando y enviando historico de mensajes en bd")
      }
    })
    socket.on("shakeit", data => {
      console.log ("se quiere sacudir a alguien: ", data);
      const shake_this = users.find((e) => e.username == data.user_to_shake);
      socket.to(shake_this.conn).emit("shake_yourself",users.find((e) => e.conn == socket.id))
    })
    
    // se genera desde el method DELETE product.js
    socket.on("del_product", data => {
      socket.emit('del_product',data);
    })
  
    // se llama desde public script.js 
    socket.on("message",async data => {
      console.log("se recibió mensaje: ",data)
      switch (data){
        case 'allProducts':
          const pm = new ProductManagerv2();
          try {
            const  all_prods = await pm.getAll({limit:100},{});
            socket.emit('allProducts',all_prods)
          } catch (err) {
            console.log (err)
          }
          break;
        default:
          socket.emit('error',"ja... cualquiera...")
      }
    })
  })

}
