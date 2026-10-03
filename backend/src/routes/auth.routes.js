import { Router } from "express"
import { registerValidator, loginValidator } from "../validator/auth.validator.js"
import { register, login, refresh, getMe } from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/authMiddleware.js"



const router = Router()

router.post("/register", registerValidator, register)


router.post("/login", loginValidator, login)



router.post('/refresh', refresh)

router.get("/me", authenticate, getMe)


export default router