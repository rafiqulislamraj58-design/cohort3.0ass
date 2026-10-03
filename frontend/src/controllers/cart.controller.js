import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';

export async function addToCart(req, res) {
  try {
    const { productId, quantity, size } = req.body;

    
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const selectedSize = product.sizes?.find(s => s.size === size);
    if (!selectedSize) {
      return res.status(400).json({ message: "Invalid size selected" });
    }

    if (selectedSize.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

   
    let cart = await cartModel.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new cartModel({ user: req.user.userId, products: [] });
    }
 
    const productInCart = cart.products.find(
      p => p.product.toString() === productId && p.size === size
    );

    if (productInCart) {
      if (productInCart.quantity + quantity > selectedSize.stock) {
        return res.status(400).json({ message: "Insufficient stock for total item count" });
      }
      productInCart.quantity += quantity;
    } else {
      cart.products.push({
        product: productId,
        quantity,
        size
      });
    }

    
    await cart.save();

    return res.status(200).json({
      message: productInCart ? "Product quantity updated in cart" : "Product added to cart",
      cart
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getCart(req, res) {
  try {
    const cart = await cartModel
      .findOne({ user: req.user.userId })
      .populate('products.product');

    if (!cart) {
      return res.status(200).json({
        message: "Cart retrieved successfully",
        data: {
          cart: {
            user: req.user.userId,
            products: []
          }
        }
      });
    }

    return res.status(200).json({
      message: "Cart retrieved successfully",
      data: { cart }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}