import { Request, Response, NextFunction } from 'express';
import * as servicio from '../services/videojuegos.service';
import * as partidas from '../services/partidas.service';
import * as metas from '../services/metas.service';
import * as progreso from '../services/progreso.service';
import { queryTexto } from '../validacion';

/** Capa HTTP: traduce peticiones y respuestas. Las reglas y consultas viven en los servicios. */

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const videojuegos = await servicio.listar(queryTexto(req.query.estado));
    res.json({ videojuegos, total: videojuegos.length, requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ videojuego: await servicio.obtener(req.params.id), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ videojuego: await servicio.crear(req.body), requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ videojuego: await servicio.actualizar(req.params.id, req.body), requestId: req.id });
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

export async function actualizarLogro(req: Request, res: Response, next: NextFunction) {
  try {
    const videojuego = await servicio.actualizarLogro(req.params.id, req.params.logroId, req.body);
    res.json({ videojuego, requestId: req.id });
  } catch (e) {
    next(e);
  }
}

export async function listarPartidas(req: Request, res: Response, next: NextFunction) {
  try {
    const lista = await partidas.listarPorVideojuego(req.params.id);
    res.json({ partidas: lista, total: lista.length, requestId: req.id });
  } catch (e) {
    next(e);
  }
}

/** Devuelve exactamente la forma del enunciado: totalPartidas, horasTotales, ultimaPartida, porcentajeAvanceActual. */
export async function resumen(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await partidas.resumenDeVideojuego(req.params.id));
  } catch (e) {
    next(e);
  }
}

/** Ruta anidada: GET /api/videojuegos/:id/metas (historial de metas, la más reciente primero). */
export async function listarMetas(req: Request, res: Response, next: NextFunction) {
  try {
    const lista = await metas.listarPorVideojuego(req.params.id);
    res.json({ metas: lista, total: lista.length, requestId: req.id });
  } catch (e) {
    next(e);
  }
}

/** GET /api/videojuegos/:id/progreso-semanal: forma del diagnóstico §7.3, sin envoltorio (como el resumen). */
export async function progresoSemanal(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await progreso.progresoSemanalDeVideojuego(req.params.id));
  } catch (e) {
    next(e);
  }
}
