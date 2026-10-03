import { Router } from "express";
import { 
  createProductValidator, 
  unlistProductValidator, 
  listProductValidator 
} from "../validator/productValidator.js";
import { authenticate, authenticateSeller } from "../middlewares/authMiddleware.js";
import { 
  createProduct, 
  listAllProducts, 
  unlistProduct, 
  listProduct, 
  listAllProductsToSeller 
} from "../controllers/product.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Uploads folder na thakle automatic toiri korar jonno
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    files: 5,
    fileSize: 1 * 1024 * 1024, // 1MB max size per file
  },
});

const router = Router();

// 1. Get all public products (Je kono user ba visitor shob product dekhte parbe)
router.get("/", listAllProducts);

// 2. Get all products for a specific seller (Protected route)[cite: 2, 4]
router.get("/seller", authenticate, authenticateSeller, listAllProductsToSeller);

// 3. Create a new product (Protected write route)[cite: 2, 4]
router.post(
  "/",
  authenticate,
  authenticateSeller,
  upload.array("images", 5),
  (req, res, next) => {
    try {
      if (req.body?.price) {
        if (typeof req.body.price === 'string') {
          try {
            req.body.price = JSON.parse(req.body.price);
          } catch {
            if (!isNaN(req.body.price)) {
              req.body.price = Number(req.body.price);
            }
          }
        }
      }

      if (req.body?.sizes) {
        if (typeof req.body.sizes === 'string') {
          try {
            req.body.sizes = JSON.parse(req.body.sizes);
          } catch (err) {
            return res.status(400).json({ 
              success: false, 
              message: "Invalid JSON format in 'sizes' field" 
            });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid JSON structure in form fields",
        details: error.message 
      });
    }
  },
  createProductValidator,
  createProduct
);

// 4. Unlist product route[cite: 2, 4]
router.patch("/unlist/:id", authenticate, authenticateSeller, unlistProductValidator, unlistProduct);

// 5. List product route[cite: 2, 4]
router.patch("/list/:id", authenticate, authenticateSeller, listProductValidator, listProduct);

export default router;