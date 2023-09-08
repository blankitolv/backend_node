import { Router } from 'express';
import { ProductManager } from '../clase.js';
const router = Router();


// todos los productos (classic)
router.get('/', async (req,res)=>{

  const product = new ProductManager();

  const all_products = await product.getProducts();
  res.render('products',{product: all_products})
});
router.get('/realtime', async (req,res)=>{
  res.render('realtime',{})
});




router.get('/products/:id', async (req,res)=>{
  // parseo el id de param para validar tipo de dato
  const pid = parseInt(req.params.pid);
  
  // valido que sea un número y que sea mayor o igual a 0
  // console.log("isNaN", isNaN(pid))
  if (pid<=0 || isNaN(pid) ){
    res.status(400).json(r.badRequest());
    return
  }
  
  const product = new ProductManager();

  const all_products = await product.getProducts();
  console.log (all_products)
  res.render('products',{product: all_products})
});

router.get('/badrequest', (req,res)=>{
  const errorMessage = req.query.message || '';
  res.status(400).render('badRequest',{ layout:'secondary', errorMessage })
});

router.get('/internalServerError', (req,res)=>{
  const errorMessage = req.query.message || '';
  res.status(500).render('internalServerError', { layout:'secondary', errorMessage })
});

export default router;