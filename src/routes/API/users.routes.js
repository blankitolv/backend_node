/*            terceros*/
import { Router } from "express";

/*            propios*/
import { createHash } from "../../utils.js";
import { isValidPassword } from "../../utils.js";

import UsersManager from "../../dao/bdmanager/users.manager.js";

const usersManager = new UsersManager()
const router = Router();


const CODIGO_SECRETO = "soyunadmin" 

router.post("/reg",async(req,res)=>{
  const { birthday, registration_code, user_email, first_name, last_name, password} = req.body;
  let roles = []
  if (registration_code === CODIGO_SECRETO){
    roles = ['public','admin']
  } else {
    roles.push('public')
  }
  const register = { first_name, last_name, roles, birthday, email: user_email, password: createHash(password)}

  try {
    const userReturned = await usersManager.getOne(user_email)
    if (userReturned) {
      console.log("users.routes.js error");
      res.status(400).json({status: 'fail', message:"Datos icorrectos en la creación del usuario"})
      return
    }
    const resp = await usersManager.save(register)
    if (resp) {
      console.log('Usuario creado exitosamente:', resp);
      res.status(200).json({status: 'success', message:"ok"})
    } else {
      console.error('La creación del usuario falló');
      res.status(500).json({status: 'fail', message:"fail"})
    }
  } catch (error) {
    res.status(500).json({status: 'fail', message:"fail"})
    console.log (error)
  }

})
router.post("/login",async(req,res)=>{
  const {user_email, password} = req.body;
  try {
    const userReturned = await usersManager.getOne(user_email)
    if (!userReturned) {
      console.log("users.routes.js error");
      res.status(401).json({status: 'fail', message:"Datos icorrectos"})
      return
    }
    if (!isValidPassword(password, userReturned.password)) {
      res.status(401).json({status: 'fail', message:"Datos icorrectos"})
      return
    }
    
    req.session.user = {
      name: `${userReturned.first_name} ${userReturned.last_name}`,
      email: userReturned.email,
    }
    res.status(200).json({status:"success",message:"ok"})
  } catch (error) {
    return res.status(400).send({ status: 'error', message: 'incorrect credenetials' });
  }
})
router.get('/authstatus', (req, res) => {
  console.log("paso por auth")
  if (req.session && req.session.user) {
    // El usuario está autenticado
    res.json({ authenticated: true, user: req.session.user });
  } else {
    // El usuario no está autenticado
    res.json({ authenticated: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(error => {
      if(error) return res.status(500).send({ status: 'error', error: 'logout fail' });
      res.redirect('/login');
  })
})

export default router