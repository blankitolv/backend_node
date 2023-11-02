import Router from "../router.routes.js"

// import { ProductManager } from "../../dao/fsmanager/clase.js";
// import pManager from "../../dao/bdmanager/products.manager.js";
import ProductManagerv2 from "../../dao/bdmanager/products.manager.js";
import cartManager from "../../dao/bdmanager/carts.manager.js";
import { accessRoles, passportStrategiesEnum } from "../../config/enums.config.js";

// const router = Router();
/**
 * 
 * router.get("/",privateAcess, async (req, res) => {
    res.redirect('/products')
    });
 */

const expresion = new RegExp("/[a-z0-9]+/");
export default class ViewsRouter extends Router {
  constructor(){
    super();
    this.pm = new ProductManagerv2();
    this.cart = new cartManager();
  }

  init() {
    this.get('/',[accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.redirect)
    this.get('/products', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.render_products)
    this.get('/realtime', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.realTime)
    this.get('/product/:pid', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.productId)
    this.get('/cart/:cid', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.cartId)
    this.get('/chat', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.chat)
    this.get('/register', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.register)
    this.get('/login', [accessRoles.PUBLIC], passportStrategiesEnum.NOTHING, this.login)
  }
  redirect (req,res){
    res.redirect('/products')
  }
  async render_products(req,res){
    let limit;
    let page;
    req.query.limit != undefined
      ? (limit = Number(req.query.limit))
      : (limit = 10);

    req.query.page != undefined ? (page = Number(req.query.page)) : (page = 1);

    let query = {};
    let options = { limit, page };

    if (req.query.sort != undefined) {
      options["sort"] = req.query.sort == "asc" ? 1 : -1;
    }

    if (req.query.category != undefined) {
      query["category"] = req.query.category;
    } else {
      if (req.query.status != undefined) {
        if (req.query.status == "true" || req.query.status == "false") {
          query["status"] = req.query.status;
        } else {
          return res.sendClientError('');
          // res.status(400).json({ status: "error", message: "Invalid url param" });
        }
      }
    }
    // console.log("original: ", req.originalUrl);
    // console.log(myFilters);
    try {
      let data = await this.pm.getAll(options, query);
      if (data.payload == 0) {
        throw new Error("length of products are zero");
      }
      // let myFilters = req.originalUrl.slice(2).split("&");

      data.back_url = `?limit=${options.limit}&page=${options.page - 1}${options.sort?`&sort=${req.query.sort}`:''}${query.category?`&category=${query.category}`:""}`
      data.next_url = `?limit=${options.limit}&page=${options.page + 1}${options.sort?`&sort=${req.query.sort}`:''}${query.category?`&category=${query.category}`:""}`
      let all_prev = [];
      for (let i=1; i< data.page; i++) {
        const aux = `?limit=${options.limit}&page=${i}${options.sort?`&sort=${req.query.sort}`:''}${query.category ? `&category=${query.category}` : ""}`;
        all_prev.push({url: aux, page: i})
      }

      let all = []
      for (let i=(data.page+1); i<= data.totalPages; i++) {
        const aux = `?limit=${options.limit}&page=${i}${options.sort?`&sort=${req.query.sort}`:''}${query.category ? `&category=${query.category}` : ""}`;
        all.push({url: aux, page: i})
      }
      
      data.all_prev = all_prev;
      data.all = all;
      // data.user = "juan vega"

      res.render("products", { data });
    } catch (error) {
      console.log(error);
      return res.sendServerError(error.message);
    }
  }
  async realTime(req,res){
    res.render("realtime", {});
  }
  async productId(req,res){
    // parseo el id de param para validar tipo de dato
    // const pid = parseInt(req.params.pid);
    const { pid } = req.params;

    if (expresion.test(pid)) {
      return res.sendClientError('Invalid product id');
    }

    console.log("SE SOLICITA ",pid)
    try {
      const resp = await this.pm.getOne(pid)
      console.log(resp)
      res.render("oneProduct", resp);
    } catch (error) {
      return res.sendServerError(error.message);
    }
  }

  async cartId(req,res){
    const { cid } = req.params;

    if (expresion.test(cid)) {
      return res.sendClientError('Invalid cart id');
    }

    try {
      const data = await this.cart.getOne(cid);
      const objeto = data.toObject();
      console.log(objeto)
      // console.log("getOneCart: ",data);
      res.status(200).render("cart", objeto );
    } catch (error) {
      return res.sendServerError(error.message);
    }
  }

  async chat(req,res){
    res.status(200).render("chat", {});
  }

  async register(req,res){
    res.status(200).render("register", {});
  }

  async login(req,res){
    res.status(200).render("login", {});
  }


}


// // const router = Router();
// export default class ProductRouter extends Router{
//   constructor(){
//     super();
//     this.pm = new ProductManagerv2();
//   }
// const publicAccess = (req, res, next) => {
//   if(req.session.user) return res.redirect('/');
//   next();
// }

// const alreadyLogged = (req,res, next) =>{
//   if(req.session.user) return res.redirect('/');
//   next();
// }

// const privateAcess = (req, res, next) => {
//   if(!req.session.user) return res.redirect('/login');
//   next();
// }


// todos los productos (classic)
// const pm = new pManager();
// const cart = new cartManager();
// router.get("/",privateAcess, async (req, res) => {
// res.redirect('/products')
// });

// router.get("/products",privateAcess, async (req, res) => {
//   // console.log(req.session)
//   let limit;
//   let page;
//   req.query.limit != undefined
//     ? (limit = Number(req.query.limit))
//     : (limit = 10);

//   req.query.page != undefined ? (page = Number(req.query.page)) : (page = 1);

//   let query = {};
//   let options = { limit, page };

//   if (req.query.sort != undefined) {
//     options["sort"] = req.query.sort == "asc" ? 1 : -1;
//   }

//   if (req.query.category != undefined) {
//     query["category"] = req.query.category;
//   } else {
//     if (req.query.status != undefined) {
//       if (req.query.status == "true" || req.query.status == "false") {
//         query["status"] = req.query.status;
//       } else {
//         res.status(400).json({ status: "error", message: "Invalid url param" });
//       }
//     }
//   }
//   // console.log("original: ", req.originalUrl);
//   // console.log(myFilters);
//   try {
//     let data = await pm.getAll(options, query);
//     if (data.payload == 0) {
//       throw new Error("length of products are zero");
//     }
//     // let myFilters = req.originalUrl.slice(2).split("&");

//     data.back_url = `?limit=${options.limit}&page=${options.page - 1}${options.sort?`&sort=${req.query.sort}`:''}${query.category?`&category=${query.category}`:""}`
//     data.next_url = `?limit=${options.limit}&page=${options.page + 1}${options.sort?`&sort=${req.query.sort}`:''}${query.category?`&category=${query.category}`:""}`
//     let all_prev = [];
//     for (let i=1; i< data.page; i++) {
//       const aux = `?limit=${options.limit}&page=${i}${options.sort?`&sort=${req.query.sort}`:''}${query.category ? `&category=${query.category}` : ""}`;
//       all_prev.push({url: aux, page: i})
//     }

//     let all = []
//     for (let i=(data.page+1); i<= data.totalPages; i++) {
//       const aux = `?limit=${options.limit}&page=${i}${options.sort?`&sort=${req.query.sort}`:''}${query.category ? `&category=${query.category}` : ""}`;
//       all.push({url: aux, page: i})
//     }
    
//     data.all_prev = all_prev;
//     data.all = all;
//     data.user = req.session.user

//     res.render("products", { data });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json();
//   }
// });

// router.get("/fail", async(req,res)=>{
//   const message = req.query.message || ""
//   console.log ("ESTO VINO EN URL :> ",message)
//   res.render('fail', { layout: "secondary", data: message })
// })


// router.get("/realtime",privateAcess, async (req, res) => {
//   res.render("realtime", {});
// });

// router.get("/product/:pid",privateAcess,async (req, res) => {
//   // parseo el id de param para validar tipo de dato
//   // const pid = parseInt(req.params.pid);
//   const { pid } = req.params;

//   if (expresion.test(pid)) {
//     res.status(400).json({ status: "error", message: "Invalid product id" });
//     return;
//   }

//   console.log("SE SOLICITA ",pid)
//   try {
//     const resp = await pm.getOne(pid)
//     console.log(resp)
//     res.render("oneProduct", resp);
//   } catch (error) {
//     console.log(error.message)
//   }
// });

// // genero una vista para un bad request
// router.get("/badrequest", publicAccess, (req, res) => {
//   // tomo el valor del url que coloqué en la clase que maneja los errores
//   // y lo envío a renderizar cómo parametro
//   const errorMessage = req.query.message || "";

//   // renderiza la vista "badRequest" pero con el layout llamado secondary
//   res.status(400).render("badRequest", { layout: "secondary", errorMessage });
// });

// // vista generada pero no implementada para 500
// router.get("/internalServerError",publicAccess, (req, res) => {
//   const errorMessage = req.query.message || "";
//   res
//     .status(500)
//     .render("internalServerError", { layout: "secondary", errorMessage });
// });

// router.get("/cart/:cid", privateAcess, async(req, res) => {
//   const { cid } = req.params;

//   if (expresion.test(cid)) {
//     res.status(400).json({ status: "error", message: "Invalid cart id" });
//     return;
//   }


//   try {
//     const data = await cart.getOne(cid);
//     const objeto = data.toObject();
//     console.log(objeto)
//     // console.log("getOneCart: ",data);
//     res.status(200).render("cart", objeto );
//   } catch (error) {
//     console.log(error)
//   }
// });

// vista generada pero no implementada para 500
// router.get("/chat",privateAcess, (req, res) => {
//   res.status(200).render("chat", {});
// });

// router.get("/register", publicAccess, (req, res) => {
//   res.status(200).render("register", {});
// });

// router.get("/login",publicAccess,  (req, res) => {
//   res.status(200).render("login", {});
// });
// export default router;
