import { Router } from 'express';
import ProductManager from '../entregable2.js'
import Response from '../errorMessages.js'

const router = Router();

router.get('/',(req,res)=>{
  res.json({state:200, msg:"no content"})
})

export default router