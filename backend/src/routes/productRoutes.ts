import express, { Router } from "express";
import {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  testRoute,
  buyProduct,
  getCheckoutProduct,
  updateProductStatus,
  userOrderDashboard,
  getAdminDashboard,
  addToCart,
  getCartProducts,
  proceedToCheckout,
  getCartProductsInCheckout,
  updateCartCheckoutProductStatus,
  revertBuyCheckout,
  revertCartCheckout,
} from "../controller/productsController";

import { authenticateAndAuthorizeMiddleware } from "../middleware/authMiddleWare";

const router: Router = express.Router();

router.get("/test-product", testRoute);
router.get("/products", getAllProducts);
router.get("/products/:id", getSingleProduct);
router.post(
  "/product/create",
  authenticateAndAuthorizeMiddleware,
  createProduct
);
router.put(
  "/product/update/:id",
  authenticateAndAuthorizeMiddleware,
  updateProduct
);
router.delete(
  "/product/delete/:id",
  authenticateAndAuthorizeMiddleware,
  deleteProduct
);
router.post("/product/buy/:id", buyProduct);
router.get("/product/bought-by-user", getAdminDashboard);
router.get("/product/checkout/:id", getCheckoutProduct);
router.post("/product/revert-checkout", revertBuyCheckout);
router.put("/product/:id/status", updateProductStatus);
router.get("/product/order-dashboard", userOrderDashboard);
router.post("/product/add-to-cart/:id", addToCart);
router.get("/product/get-cart-products", getCartProducts);
router.put("/product/cart/checkout", proceedToCheckout);
router.get("/product/get-cart/checkout", getCartProductsInCheckout);
router.put("/product/cart/checkout/status", updateCartCheckoutProductStatus);
router.post("/product/cart/checkout/revert-checkout", revertCartCheckout);

export default router;
