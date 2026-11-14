import { Request, Response, NextFunction } from 'express';
import * as servicio from '../services/metas.service';

/** Capa HTTP de metas. Las reglas (RN-07, RN-09) viven en el servicio. */

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ meta: await servicio.obtener(req.params.id), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ meta: await servicio.crear(req.body), requestId: req.id });
  } catch (e) {
    next(e);
  }
}
