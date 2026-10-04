import Product from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const listAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { isListed: true },
        { isListed: { $exists: false } },
      ],
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listAllProductsToSeller = async (req, res) => {
  try {
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller ID not found in token",
      });
    }

    const products = await Product.find({
      seller: sellerId,
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller ID not found in token",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const response = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });

          return response.url;
        })
      );
    }

    if (imageUrls.length === 0 && req.body.images) {
      if (Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
      } else if (typeof req.body.images === "string") {
        imageUrls = [req.body.images];
      }
    }

    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      sizes: req.body.sizes,
      images: imageUrls,
      seller: sellerId,
      isListed: true,
    };

    const newProduct = await Product.create(productData);

    const populatedProduct = await Product.findById(newProduct._id)
      .populate("seller", "name email");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populatedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unlistProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you are not the owner",
      });
    }

    product.isListed = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product unlisted successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you are not the owner",
      });
    }

    product.isListed = true;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product listed successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};