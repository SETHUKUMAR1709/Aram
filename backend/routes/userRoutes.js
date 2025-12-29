import { protect } from "../middlewares/authmiddleware.js";
import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    getProfileById,
    updateUserProfile,
    findLawyers,
    logoutUser
} from "../controllers/userController.js";

import upload from '../lib/multer.js';
import { get } from "http";

const router = express.Router();


router.post('/register', upload.single("profilePic"), registerUser);
router.post('/login', loginUser);
router.post("/logout", protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.get('/:userId/profile', protect, getProfileById);
router.patch('/updateProfile', protect,upload.single("profilePic"), updateUserProfile);
router.post('/lawyer/search', protect, findLawyers);

export default router;