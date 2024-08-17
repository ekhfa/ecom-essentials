import express, { Router } from "express";
import {
  googleUserRegistration,
  testRoute,
  userLogin,
  userRegistration,
  userPasswordReset,
  userLogOut,
  userProfile,
} from "../controller/userController";
import { authenticateAndAuthorizeMiddleware } from "../middleware/authMiddleWare";

const router: Router = express.Router();

// For user Registration
router.post("/registration", userRegistration);
router.post("/login", userLogin);
router.post("/google-auth", googleUserRegistration);
router.post("/password-reset", userPasswordReset);
router.post("/logout", userLogOut);
router.get("/user-profile", userProfile);

export default router;
