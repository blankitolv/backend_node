import { Router as expressRouter } from 'express';
// import { passportStrategiesEnum } from '../config/enums.config/passportStrategies.js';
import { passportStrategiesEnum } from '../config/enums.config.js';
import passport from 'passport';
// import passport, { authenticate } from 'passport';
/*
https://coderhouse.zoom.us/rec/play/cDiiUnlyVeOFiEoVGnnITdRH4KshWIw8PQN4_0IS7NfP4DB1sSsjtrwb_8_1FD6nrjP7aiucPINNV9Ml.D17rJjDFko3pp6o8?canPlayFromShare=true&from=share_recording_detail&continueMode=true&componentName=rec-play&originRequestUrl=https%3A%2F%2Fcoderhouse.zoom.us%2Frec%2Fshare%2FCzMnfVzFWax6xqVs_80qMzfnkNZFVvOZ6Os7WRc0FFCFgpLtrdiXnl9guB5l9amj.9SAUx06h6ah-RpAH
quedaste en 00.56.20

por las dudas
https://coderhouse.zoom.us/rec/play/VlZlxunhmXqmWlp1SPOnNqa6wmeBydCnIn-nlBJBJCU0jvlYehpJZwmLsRx7crCDnhiFwFi2zjudRaE_.TVKFoW5Sr5bmbLIu?canPlayFromShare=true&from=share_recording_detail&continueMode=true&componentName=rec-play&originRequestUrl=https%3A%2F%2Fcoderhouse.zoom.us%2Frec%2Fshare%2FrIr7ZeZS77fT9V2eSUxvfb3_B-nyhDpIEVzVH7mzNjcQcbeTBbA3wxIZU_Z-wHU1.2HQ4sGCU5y56ctgx
routeo avanzado
quedaste en 01.04.26 

passport avanzado
https://coderhouse.zoom.us/rec/play/1tktL3n-vw_GZyiqx-wr-WCSd7ufB01duVD-JpiYON5rv7uxQLxTxOP1RHZN03HRN-I0O6Z1c2Asbh1s.3EpyCOPeUwJVAPB5?canPlayFromShare=true&from=share_recording_detail&continueMode=true&componentName=rec-play&originRequestUrl=https%3A%2F%2Fcoderhouse.zoom.us%2Frec%2Fshare%2F839_mb8As41BfmKLGVYHgoqIjFYM_tDpVOSs6GnzbdpAYxl_4rXY6xs7hZtRxbvT.d45Fw2VMrApR1FhB
quedaste 00.15.55
hay que modificar los routers

https://github.com/JaviAPS94/backend47300/blob/main/clase23/ejercicio2/src/routes/router.js
github

https://docs.google.com/presentation/d/1NS73Kdoo-8GvIq4KIERo4MkJ9OnTutKFg11sw28Ee1g/preview?slide=id.g155b384045a_0_7
entregable
*/
export default class Router {
    constructor() {
        this.router = expressRouter();
        this.init();
    }

    getRouter() {
        return this.router;
    }

    init() {}

    get(path, policies,passportStrategy, ...callbacks) {
        this.router.get(
            path,
            this.applyCustomPassportCall(passportStrategy),
            this.handlePolicies(policies),
            this.generateCustomResponse,
            this.applyCallbacks(callbacks) 
        )
    }

    post(path, policies,passportStrategy, ...callbacks) {
        this.router.post(
            path,
            this.applyCustomPassportCall(passportStrategy),
            this.handlePolicies(policies),
            this.generateCustomResponse,
            this.applyCallbacks(callbacks) 
        )
    }

    put(path, policies, passportStrategy, ...callbacks) {
        this.router.put(
            path,
            this.applyCustomPassportCall(passportStrategy),
            this.handlePolicies(policies),
            this.generateCustomResponse,
            this.applyCallbacks(callbacks) 
        )
    }

    delete(path, policies, passportStrategy, ...callbacks) {
        this.router.delete(
            path,
            this.applyCustomPassportCall(passportStrategy),
            this.handlePolicies(policies),
            this.generateCustomResponse,
            this.applyCallbacks(callbacks) 
        )
    }

    applyCustomPassportCall = (strategy) => (req,res,next)=>{
        if (strategy === passportStrategiesEnum.JWT) {
            passport.authenticate(strategy, function (err, user, info) {
                if (err) return next(err);
                if (!user) {
                    console.log("no está user")
                    return res.status(401).send({error: info.messages? info.messages: info.toString()})
                }
                req.user = user;
                next();
            })(req,res,next);
        } else {
            next();
        }
    }

    handlePolicies = (policies) => (req, res, next) => {
        //["ADMIN"]

        //No validamos nada
        if(policies[0] === 'PUBLIC') return next();
        const user = req.user
        console.log("----> ",req.user)
        console.log("----> ",typeof user.roles)
        if(!policies.includes(user.roles.toString().toUpperCase()))
            return res.status(403).json({ error: 'not permissions' })
        console.log("mostrando user: ",user)
        next();
    }

    generateCustomResponse = (req, res, next) => {
        
        res.sendSuccess = (data = {}) => {
            const toSend = {}
            toSend.payload = data
            toSend.status = "ok"
            res.status(200).json(toSend)
        };
        
        res.sendServerError = (error = "Internal Server Error") => {
            const toSend = {}
            toSend.error = error
            toSend.status = "fail"
            res.status(500).json(toSend);
        };
        
        res.sendClientError = (error ="Bad Request") => {
            const toSend = {}
            toSend.error = error
            toSend.status = "fail"
            res.status(400).json(toSend);
        };

        next();
    }

    applyCallbacks(callbacks) {
        //mapear los calbacks 1 a 1, obtiendo sus parámetros
        return callbacks.map((callback) => async (...params) => {
            try {
                //apply, va a ejecutar la función callback, a la instancia de nuestra clase
                await callback.apply(this, params);
            } catch (error) { //[req, res, next]
                params[1].status(500).json({ status: 'error', message: error.message });
            }
        })
    }
}