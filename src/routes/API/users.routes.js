/*            terceros*/


/*            propios*/
import Router from "../router.routes.js"
import UsersManager from "../../dao/bdmanager/users.manager.js";
import { accessRoles, passportStrategiesEnum } from '../../config/enums.config.js';
import * as UserController from "../../controllers/users.controller.js"




// const router = Router();
export default class UsersRouter extends Router{
  constructor(){
    super();
    this.usersManager = new UsersManager()
  }
  init(){
    this.post('/login',[accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, UserController.userLogin);
    this.post('/reg',[accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, UserController.userRegister);
    this.get('/verifyAuth',[accessRoles.USER], passportStrategiesEnum.JWT, UserController.verifyAuth);
  }
 
}
export {
  UserController
}


// const router = Router();
// const usersManager = new UsersManager()



// router.post("/reg",passport.authenticate('register', { failureRedirect: ('fail-handler'), failureFlash: true }),
//  async(req,res)=>{
  //   res.send({status: 'success', message:'usuario registrado'})
  // })
  
// router.post("/reg", async(req,res)=>{
//   try {
    
//   } catch (error) {
//     res.status(500).send({status:"error", message: error.message});
//   }
// })

// router.get("/fail-handler", async(req,res)=>{
//   const mensaje = req.flash('error')[0]
//   res.redirect('http://localhost:8080/login');
//   // const uri = "/fail?message="+encodeURIComponent(mensaje);

//   // // const msg = {title: req.flash('title'), message: req.flash('message')}
//   // res.status(400).json({status: 'fail',redirectTo:uri})
// })

// router.post("/login",passport.authenticate('login', { failureRedirect: ('fail-handler') }), 
// async( req, res )=>{
//   console.log("LLEGUE A LOGIN ROUTER")
//   if (!req.user) return res.status(401).send({ status: 'error', error: 'Incorrect credentials' });
    
//   req.session.user = {
//     name: `${req.user.first_name} ${req.user.last_name}`,
//     email: req.user.email,
//   }
//   res.status(200).send({ status: 'success', message:'Login success' })
// })

// router.get("/github",passport.authenticate('github', { scope: ['user:email']}), async (req,res)=>{
//   res.send({ status: 'success', message:'User registered'});
// })

// router.get("/github-callback",passport.authenticate('github', { failureRedirect: '/login' }), async (req,res)=>{
//   req.session.user = req.user;
//   res.redirect('/');
// });



// router.get('/authstatus', (req, res) => {
//   if (req.session && req.session.user) {
//     // El usuario está autenticado
//     res.json({ authenticated: true, user: req.session.user });
//   } else {
//     // El usuario no está autenticado
//     res.json({ authenticated: false });
//   }
// });

// router.get('/logout', (req, res) => {
//   req.session.destroy(error => {
//       if(error) return res.status(500).send({ status: 'error', error: 'logout fail' });
//       res.redirect('/login');
//   })
// })

// export default router