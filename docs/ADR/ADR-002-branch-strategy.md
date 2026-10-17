# ADR-002: Estrategia de ramas Git

## Estado
Aceptado

## Contexto
El repositorio se conectará a `https://github.com/bakuandhal/pos-buen-gusto.git` (privado). Se requiere una rama de trabajo principal y una rama para releases estables.

## Decisión
- Rama principal de trabajo: `develop`
- Rama de releases estables: `main` (solo releases estables, merge directo o PR)
- Commits con mensajes convencionales: `feat:`, `fix:`, `chore:`, `docs:`
- Push a `develop`; mergear a `main` cuando la funcionalidad esté estable

## Consecuencias
- Positivo: separación clara entre trabajo en curso y releases estables.
- Negativo: `main` no recibirá commits directos salvo releases.

## Fecha
2026-10-16
