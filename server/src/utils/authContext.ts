import { ErrorNegocio } from '../shared/errors/dominio';

/**
 * Usuario autenticado extraído del token JWT.
 *
 * El payload del token de acceso usa `userId` (ver `JwtPayload`).
 */
export interface UsuarioAutenticado {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

/**
 * Extrae el usuario autenticado de la solicitud.
 *
 * Lanza `ErrorNegocio` con 401 si la solicitud no está autenticada o si el
 * token no contiene la identidad del usuario.
 */
export function obtenerUsuario(request: any): UsuarioAutenticado {
  const user = request?.user as
    | {
        id?: number;
        userId?: number;
        username?: string;
        role?: string;
        permissions?: string[];
      }
    | undefined;

  const id = user?.id ?? user?.userId;

  if (!id) {
    throw new ErrorNegocio('no_autenticado', 'Usuario no autenticado', 401);
  }

  return {
    id,
    username: user?.username ?? '',
    role: user?.role ?? '',
    permissions: user?.permissions ?? [],
  };
}
