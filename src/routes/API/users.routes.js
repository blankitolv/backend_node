/*            terceros*/
// import { Router } from "express";

/*            propios*/
import Router from "../router.routes.js"
import UsersManager from "../../dao/bdmanager/users.manager.js";
import { accessRoles, passportStrategiesEnum } from '../../config/enums.config.js';
import { CODIGO_SECRETO } from '../../config/constant.config.js';
import { createHash } from "../../utils.js";
import { isValidPassword } from "../../utils.js";
import { generateToken } from '../../utils.js'



// const router = Router();
export default class UsersRouter extends Router{
  constructor(){
    super();
    this.usersManager = new UsersManager()
  }
  init(){
    this.post('/login',[accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.userLogin);
    this.post('/reg',[accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.userRegister);
  }

  async userLogin(req,res) {
    const {user_email, password} = req.body;
    try {
      const resp = await this.usersManager.getOne(user_email)
      if (!resp) return res.sendClientError('incorrect credentials');

      const comparePass = isValidPassword(password, resp.password)
      if (!comparePass) return res.sendClientError('incorrect credentials')

      const accessToken = generateToken(resp);
      return res.sendSuccess({accessToken});
      
    } catch(error){
      return res.sendServerError(error.message);
    }
    //   if (resp) {
    //     req.session.user = {
    //       name: `${resp.first_name} ${resp.last_name}`,
    //       email: resp.email,
    //     }
    //     return res.sendSuccess();
    //     // res.status(200).json({status:"success",message:"ok"})
    //   } else {
    //     return res.sendClientError('fail');
    //     // res.status(400).json({status:"fail",message:"fail"})
    //   }
    // } catch (error) {
    //   return res.sendClientError('incorrect credenetials');
    //   // return res.status(400).send({ status: 'error', message: 'incorrect credenetials' });
    // }
  }

  async userRegister(req,res){
    const { birthday, registration_code, user_email, first_name, last_name, password} = req.body;
    let roles = []

    if (registration_code) {
      if (registration_code.toUpperCase() === CODIGO_SECRETO.toUpperCase()){
        roles = ['ADMIN'];
      } else {
        return res.sendClientError('codigo incorrecto');
      }
    } else {
      roles = ['USER'];
    }
    

    const register = { first_name, last_name, roles, birthday, email: user_email, password }
  

    try {
      if (!first_name || !last_name || !birthday || !user_email || !password ) return res.sendClientError('incomplete values');
      
      const userReturned = await this.usersManager.getOne(user_email)
      if (userReturned) {
        return res.sendClientError('Datos incorrectos en la creación del usuario');
        // res.status(400).json({status: 'fail', message:"Datos icorrectos en la creación del usuario"})
        // return
      }

      register.password = createHash(password);

      const resp = await this.usersManager.save(register)
      if (resp) {
        const objResp = resp.toObject()
        delete objResp.password;
        console.log('Usuario creado exitosamente:', objResp);
        return res.sendSuccess(objResp);
        // res.status(200).json({status: 'success', message:"ok"})
      } else {
        console.error('La creación del usuario falló');
        return res.sendServerError("fail");
        // res.status(500).json({status: 'fail', message:"fail"})
      }
    } catch (error) {
      return res.sendServerError(error.message);
      // res.status(500).json({status: 'fail', message:"fail"})
      // console.log (error)
    }
  
  }
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