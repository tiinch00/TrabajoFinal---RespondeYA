import express from 'express';
import preguntasControler from '../controllers/pregunta.controller.js';

const router = express.Router();

router.get('/preguntas', preguntasControler.index);
router.get('/pregunta/:id', preguntasControler.show);
router.get('/preguntas/categoria/:nombre/:dificultad', preguntasControler.preguntasByCategoria);

export default router;
