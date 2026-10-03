import api from "./axios";

export const createProduct = (formData) => {
  return api.post("/products", formData);
};

export const getAllProducts = () => {
  return api.get("/products");
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

export const getSellerProducts = () => {
  return api.get("/products/seller");
};

export const unlistProduct = (id, data) => {
  return api.patch(`/products/unlist/${id}`, data);
};


export const listProduct = (id, data) => {
  return api.patch(`/products/list/${id}`, data);
};