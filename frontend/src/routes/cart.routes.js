import { Router } from 'express';
import { addToCartValidator } from "../validator/cart.validator.js";
import { authenticate } from "../middlewares/authMiddleware.js"
import { addToCart } from "../controllers/cart.controller.js"

const router = Router();

router.post("/", authenticate, addToCartValidator, addToCart)

router.get("/",authenticate)





export default router;