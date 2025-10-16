import avatarController from '../controllers/avatar.controller.js';
import express from 'express';

const router = express.Router();

router.get('/avatar', avatarController.index);
router.get('/avatar/:id', avatarController.show);
router.get('/avatar', avatarController.index);
router.post('/avatar/create', avatarController.store);
router.delete('/avatar/:id/delete', avatarController.destroy);

export default router;
