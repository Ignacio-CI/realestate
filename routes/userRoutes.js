import express from 'express';
import { loginForm, authenticate, registerForm, register, confirm, forgotPasswordForm, resetPassword, verifyToken, newPassword } from '../controller/userController.js';


const router = express.Router();

// Routing
router.get('/login', loginForm);
router.post('/login', authenticate);

router.get('/register', registerForm);
router.post('/register', register);

router.get('/confirm/:token', confirm);

router.get('/forgot-password', forgotPasswordForm);
router.post('/forgot-password', resetPassword);

// Store the new password
router.get('/forgot-password/:token', verifyToken);
router.post('/forgot-password/:token', newPassword);

export default router;