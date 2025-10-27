import express from 'express';
import getSoap from '../controllers/soap.controller.js';
const router = express.Router();

router.get('/paises', getSoap);

export default router;
