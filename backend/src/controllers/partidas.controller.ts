import { Request, Response, NextFunction } from 'express';
import * as servicio from '../services/partidas.service';

/** Capa HTTP de partidas. */

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const partidas = await servicio.listar();
    res.json({ partidas, total: partidas.length, requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ partida: await servicio.obtener(req.params.id), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ partida: await servicio.crear(req.body), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ partida: await servicio.actualizar(req.params.id, req.body), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await servicio.eliminar(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
