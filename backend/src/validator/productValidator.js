
import { body, param, validationResult } from "express-validator";

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Invalid Request Data",
            errors: errors.array(),
        });
    }

    next();
};

export const createProductValidator = [
    body("title")
        .exists()
        .withMessage("Title is required")
        .bail()
        .isString()
        .withMessage("Title must be a string")
        .bail()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Title length must be between 2 to 100 characters"),

    body("description")
        .exists()
        .withMessage("Description is required")
        .bail()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ min: 20, max: 500 })
        .withMessage(
            "Description length must be between 20 to 500 characters"
        ),

    body("price.amount")
        .exists()
        .withMessage("Price amount is required")
        .bail()
        .isFloat({ min: 0 })
        .withMessage(
            "Price amount must be a number greater than or equal to 0"
        ),

    body("price.currency")
        .exists()
        .withMessage("Currency is required")
        .bail()
        .isString()
        .withMessage("Currency must be a string value")
        .isIn(["INR", "USD", "BDT"])
        .withMessage("Currency must be either INR, USD, or BDT"),

    body("sizes")
        .exists()
        .withMessage("Sizes are required")
        .bail()
        .isArray({ min: 1 })
        .withMessage("Sizes must be a non-empty array"),

    body("sizes.*.size")
        .exists()
        .withMessage("Size must be present in every entry of sizes array")
        .bail()
        .isString()
        .withMessage("Size must be a string value")
        .trim()
        .isIn(["XS", "S", "M", "L", "XL", "XXL"])
        .withMessage(
            "Size must be one of: XS, S, M, L, XL, XXL"
        ),

    body("sizes.*.stock")
        .exists()
        .withMessage("Stock must be present in every entry of sizes array")
        .bail()
        .isInt({ min: 0 })
        .withMessage(
            "Stock must be an integer value greater than or equal to 0"
        ),

    validate,
];

export const unlistProductValidator = [
    param("id")
        .exists()
        .withMessage("Product ID is required in params")
        .bail()
        .isMongoId()
        .withMessage("Product ID must be a valid Mongo ObjectId"),

    validate,
];

export const listProductValidator = [
    param("id")
        .exists()
        .withMessage("Product ID is required in params")
        .bail()
        .isMongoId()
        .withMessage("Product ID must be a valid Mongo ObjectId"),

    validate,
];

