import { Router } from "express";
import {
  createProductValidator,
  unlistProductValidator,
  listProductValidator,
} from "../validator/productValidator.js";
import {
  authenticate,
  authenticateSeller,
} from "../middlewares/authMiddleware.js";
import {
  createProduct,
  listAllProducts,
  unlistProduct,
  listProduct,
  listAllProductsToSeller,
} from "../controllers/product.controller.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 1 * 1024 * 1024,
  },
});

const router = Router();

router.get("/", listAllProducts);

router.get(
  "/seller",
  authenticate,
  authenticateSeller,
  listAllProductsToSeller
);

router.post(
  "/",
  authenticate,
  authenticateSeller,
  upload.array("images", 5),
  (req, res, next) => {
    try {
      if (req.body?.price) {
        if (typeof req.body.price === "string") {
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
        if (typeof req.body.sizes === "string") {
          try {
            req.body.sizes = JSON.parse(req.body.sizes);
          } catch {
            return res.status(400).json({
              success: false,
              message: "Invalid JSON format in 'sizes' field",
            });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON structure in form fields",
        details: error.message,
      });
    }
  },
  createProductValidator,
  createProduct
);

router.patch(
  "/unlist/:id",
  authenticate,
  authenticateSeller,
  unlistProductValidator,
  unlistProduct
);

router.patch(
  "/list/:id",
  authenticate,
  authenticateSeller,
  listProductValidator,
  listProduct
);

export default router;