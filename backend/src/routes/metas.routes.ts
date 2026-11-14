import { Router } from 'express';
import * as c from '../controllers/metas.controller';

export const router = Router();

// Metas (no hay ruta para borrar: una meta solo se desactiva, RN-16)
router.post('/', c.crear); // 409 si ya hay meta activa o el juego no admite meta
router.get('/:id', c.obtener);
