import { readAccessToken } from "../utils/auth.utils.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const accessToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!accessToken) {
    return res.status(401).json({
      message: "Access token missing or invalid format",
    });
  }

  try {
    const decoded = readAccessToken(accessToken);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}

export function authenticateSeller(req, res, next) {
  if (!req.user || req.user.role !== "seller") {
    return res.status(403).json({
      message: "User is not authorized as a seller",
    });
  }
  next();
}