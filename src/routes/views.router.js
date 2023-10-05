import { Router } from "express";
import { ProductManager } from "../dao/fsmanager/clase.js";
import pManager from "../dao/bdmanager/products.manager.js";
import { throws } from "assert";
const router = Router();

const expresion = new RegExp("/[a-z0-9]+/");


// todos los productos (classic)
const pm = new pManager();
router.get("/", async (req, res) => {
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
        res.status(400).json({ status: "error", message: "Invalid url param" });
      }
    }
  }
  console.log("original: ", req.originalUrl);
  // console.log(myFilters);
  try {
    let data = await pm.getAll(options, query);
    if (data.payload == 0) {
      throw new Error("length of products are zero");
    }
    // let myFilters = req.originalUrl.slice(2).split("&");
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS

    // let newURL
    // for (let i=0; i<= myFilters.length-1;i++){
    //   if (data.hasPrevPage){

    //   }
    // }

    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    let all_prev = [];
    for (let i=1; i< data.page; i++) {
      all_prev.push(i)
    }

    let all = []
    for (let i=(data.page+1); i<= data.totalPages; i++) {
      all.push(i)
    }
    data.all_prev = all_prev;
    data.all = all;
    res.render("products", { data });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
  // try {
  //   const resp = await pm.getAll();
  //   res.render('products',{product: resp})
  //   console.log (resp)
  // } catch (error) {
  //   console.log ("ERROR SOLICITANDO TODOS LOS PRODUCTOS MONGO (views)",error)
  // }
});

router.get("/products", async (req, res) => {
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
        res.status(400).json({ status: "error", message: "Invalid url param" });
      }
    }
  }
  console.log("original: ", req.originalUrl);
  // console.log(myFilters);
  try {
    let data = await pm.getAll(options, query);
    if (data.payload == 0) {
      throw new Error("length of products are zero");
    }
    // let myFilters = req.originalUrl.slice(2).split("&");
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS

    // let newURL
    // for (let i=0; i<= myFilters.length-1;i++){
    //   if (data.hasPrevPage){

    //   }
    // }

    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    // NO BORRAR FUTUROS FILTROS
    let all_prev = [];
    for (let i=1; i< data.page; i++) {
      all_prev.push(i)
    }

    let all = []
    for (let i=(data.page+1); i<= data.totalPages; i++) {
      all.push(i)
    }
    data.all_prev = all_prev;
    data.all = all;
    res.render("products", { data });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
  // try {
  //   const resp = await pm.getAll();
  //   res.render('products',{product: resp})
  //   console.log (resp)
  // } catch (error) {
  //   console.log ("ERROR SOLICITANDO TODOS LOS PRODUCTOS MONGO (views)",error)
  // }
});


router.get("/realtime", async (req, res) => {
  res.render("realtime", {});
});

router.get("/product/:pid", async (req, res) => {
  // parseo el id de param para validar tipo de dato
  // const pid = parseInt(req.params.pid);
  const { pid } = req.params;

  if (expresion.test(pid)) {
    res.status(400).json({ status: "error", message: "Invalid product id" });
    return;
  }

  console.log("SE SOLICITA ",pid)
  try {
    const resp = await pm.getOne(pid)
    console.log(resp)
    res.render("oneProduct", resp);
  } catch (error) {
    console.log(error.message)
  }

  // valido que sea un número y que sea mayor o igual a 0
  // console.log("isNaN", isNaN(pid))
  // if (pid <= 0 || isNaN(pid)) {
  //   res.status(400).json(r.badRequest());
  //   return;
  // }
  // res.send("llegaste");
  // const product = new ProductManager();

  // const all_products = await product.getProducts();
  // console.log(all_products);
  // res.render("products", { product: all_products });
});

// genero una vista para un bad request
router.get("/badrequest", (req, res) => {
  // tomo el valor del url que coloqué en la clase que maneja los errores
  // y lo envío a renderizar cómo parametro
  const errorMessage = req.query.message || "";

  // renderiza la vista "badRequest" pero con el layout llamado secondary
  res.status(400).render("badRequest", { layout: "secondary", errorMessage });
});

// vista generada pero no implementada para 500
router.get("/internalServerError", (req, res) => {
  const errorMessage = req.query.message || "";
  res
    .status(500)
    .render("internalServerError", { layout: "secondary", errorMessage });
});

// vista generada pero no implementada para 500
router.get("/chat", (req, res) => {
  const errorMessage = req.query.message || "";
  res.status(200).render("chat", {});
});

export default router;
