import { Router } from 'express';
import * as c from '../controllers/partidas.controller';

export const router = Router();

// CRUD de Partida
router.get('/', c.listar); // con populate("videojuego")
router.post('/', c.crear); // valida que el videojuego exista (404 si no)
router.get('/:id', c.obtener);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);
