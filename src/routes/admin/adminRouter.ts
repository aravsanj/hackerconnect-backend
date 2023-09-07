import express from "express";
import {
  adminLogin,
  createNewAccount,
  getReportedPosts,
  deletePost
} from "../../controllers/adminControllers.js";
import verifyAdmin from "../../middleware/verifyAdmin.js";

const adminRouter = express.Router();

adminRouter.get("/ping", verifyAdmin, (req, res) => {
  return res.status(200).json({isLoggedIn: true});
});

adminRouter.post("/login", adminLogin);

adminRouter.get("/getReportedPosts", verifyAdmin, getReportedPosts);

adminRouter.post("/deletePost", verifyAdmin, deletePost)

adminRouter.post("/createNewAccount", verifyAdmin, createNewAccount);


export default adminRouter;
