// terceros
import passport from 'passport'
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'

// propios
import UsersManager from "../dao/bdmanager/users.manager.js";
import { createHash } from '../utils.js'
import { isValidPassword } from '../utils.js'

const usersManager = new UsersManager()

const LocalStrategy = local.Strategy;

const CODIGO_SECRETO = "soyunadmin" 


export const initPassport = () => {
  // hacemos una nueva estratégia
  passport.use('register', new LocalStrategy({
    // ########## OPCIONES DE LA ESTRATÉGIA ###############
    passReqToCallback: true,
    // by default espera "username" (en mi caso es email)
    usernameField: 'user_email'
    
  }, // LOS DATOS CON LOS QUE VA A TRABAJAR (var1, var2, callback)
  async (req, username, password, done)=>{
    // ########### logica de la estrategia ################
    try {
      const { birthday, registration_code, first_name, last_name} = req.body;
      let roles = []
      if (registration_code === CODIGO_SECRETO){
        roles = ['public','admin']
      } else {
        roles.push('public')
      }
      
      const userReturned = await usersManager.getOne(username)
      if (userReturned) {
        // done = (huboError?, datos a retornar)
        req.flash('error', "Hay datos incorrectos en su registro");
        return done(null, false, {message:"datos incorrectos"} )
        // res.status(400).json({status: 'fail', message:"Datos icorrectos en la creación del usuario"})
      }
      const register = { first_name, last_name, roles, birthday, email: username, password: createHash(password)}
      
      const new_user = await usersManager.save(register)
      
      if (new_user) {
        console.log('Usuario creado exitosamente:', new_user);
        req.flash('success', "registro completo")
        return done(null, new_user)
        // res.status(200).json({status: 'success', message:"ok"})
      } else {
        req.flash('fail', "Hay datos incorrectos en su registro")

        return done(null, false,{ message:"La creación del usuario falló"})
        // res.status(500).json({status: 'fail', message:"fail"})
      }
    } catch (error) {
      // res.status(500).json({status: 'fail', message:"fail"})
      console.log (error)
      req.flash('fail', "Hay datos incorrectos en su registro")
      return done(error.message, false, { message:"La creación del usuario falló"})
    }
  }
  ));
  
  passport.use('login', new LocalStrategy({
    // passReqToCallback: true, --> con esto tengo acceso al req
    usernameField: 'user_email'
    }, 
    async (username, password, done)=>{
      try {
        
        const userReturned = await usersManager.getOne(username)
        if (!userReturned) {
          // req.flash("No se comprobaron las credenciales")
          return done(null, false)
        }
        console.log(userReturned)
        if (!isValidPassword(password, userReturned.password)) {
          // req.flash("No se comprobaron las credenciales")
          return done(null, false)
        }
        console.log("userReturned: " + userReturned)
        done(null, userReturned) // req.user
      } catch (error) {
        console.log("SALE CON ERROR")
        done(`Error al loguear al usuario ${error.message}`)
      }
    })
  )

  passport.use('github', new GitHubStrategy({
    clientID: 'Iv1.94730ee5d3cd6461',
    clientSecret: '4d5b82a3a329bef46ce2ff16deebe87ce223e6ac',
    callbackURL: 'http://localhost:8080/api/users/github-callback',
    scope: ['user: email']
  }, async (accessToken, refreshToken, profile, done) =>{
    try {
      console.log("pp.cfg.js: ",profile);
      const email = profile.emails[0].value;
      console.log("EL EMAIL ES -------->",email);
      const userReturned = await usersManager.getOne(email);
      if (!userReturned) {
        // crear la cuenta
        const newUser = {
          first_name: profile._json.name,
          last_name: ' ',
          email,
          password:' '
        }
        const resp = await usersManager.save(newUser);
        return done(null, resp);
        return done(null, false)
      } else {
        return done(null, userReturned);
      }      
    } catch (error) {
      return done(error);
    }
  }))
  
  passport.serializeUser(( user, done )=>{
    console.log("serialize: ",user)
    done(null, user._id);
  })

  passport.deserializeUser( async ( id, done )=>{
    console.log("desc_id: ",id)
    try {
      const user = await usersManager.getById(id);
      done(null, user) // req.user
    } catch (error) {
      console.log(error)
    }
  })

  // autenticación GITHUB



}



/* machete
passport.use('register', new LocalStrategy(
  {
    opciones de la estrategia
  },
  (username, password, done) => {
    logica de la estrategia
  }
));

*/