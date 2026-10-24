import { Router } from 'express';
import * as c from '../controllers/videojuegos.controller';

export const router = Router();

// CRUD de Videojuego
router.get('/', c.listar); // ?estado=jugando (filtro opcional)
router.post('/', c.crear);
router.get('/:id', c.obtener);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

// Relaciones y cálculo
router.get('/:id/partidas', c.listarPartidas); // ruta anidada
router.get('/:id/resumen', c.resumen); // resumen calculado en el servicio
router.patch('/:id/logros/:logroId', c.actualizarLogro); // actualización de sub-documento embebido
