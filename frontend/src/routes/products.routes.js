import { Router } from "express"
import { createProductValidator, unlistProductValidator, listProductValidator } from "../validator/productValidator.js"
import { authenticate, authenticateSeller } from "../middlewares/authMiddleware.js"
import { createProduct, listAllProducts, unlistProduct, listProduct, listAllProductsToSeller } from "../controllers/product.controller.js"


import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 5,
        fileSize: 1 * 1024 * 1024 
    },
})



const router = Router()


router.post("/",
    
    authenticate,
    
    authenticateSeller,
    
    upload.array("images"),
  
    (req, res, next) => {
        req.body?.price && (req.body.price = JSON.parse(req.body.price))
        req.body?.sizes && (req.body.sizes = JSON.parse(req.body.sizes))
        next()
    },
    createProductValidator,
    createProduct)

router.get("/", authenticate, listAllProducts)


router.get("/seller", authenticate, authenticateSeller, listAllProductsToSeller)


router.patch("/unlist/:id", authenticate, authenticateSeller, unlistProductValidator, unlistProduct)


router.patch("/unlist/:id", authenticate, authenticateSeller, listProductValidator, listProduct)


export default router