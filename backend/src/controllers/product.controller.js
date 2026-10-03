import Product from "../models/product.model.js";

export const listAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { isListed: true },
        { isListed: { $exists: false } }
      ]
    }).populate("seller", "name email");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAllProductsToSeller = async (req, res) => {
  try {
    const sellerId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller ID not found in token",
      });
    }

    const products = await Product.find({ seller: sellerId });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller ID not found in token",
      });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        const filePath = file.path || file.filename;
        if (filePath) {
          const formattedPath = filePath.replace(/\\/g, "/");
          if (formattedPath.includes("uploads")) {
            return formattedPath.startsWith("/") ? formattedPath : `/${formattedPath}`;
          }
          return `/uploads/${file.filename || formattedPath.split('/').pop()}`;
        }
        return null;
      }).filter(Boolean);
    }

    if (imageUrls.length === 0 && req.body.images) {
      if (Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
      } else if (typeof req.body.images === 'string') {
        imageUrls = [req.body.images];
      }
    }

    const productData = {
      ...req.body,
      seller: sellerId,
      images: imageUrls, 
      isListed: true
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const unlistProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isListed: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product unlisted successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isListed: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product listed successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};