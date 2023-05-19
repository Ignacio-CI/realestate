import express from 'express';
import { admin, create } from '../controller/propertyController.js';
const router = express.Router();


router.get('/my-properties', admin);
router.get('/properties/create', create);
//router.delete('/properties/:id', create);

export default router;