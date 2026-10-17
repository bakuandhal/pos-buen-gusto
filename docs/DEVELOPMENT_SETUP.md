# Requisitos del equipo y configuración local — POS Buen Gusto

## Requisitos del sistema

| Herramienta | Versión mínima | Notas |
|-------------|----------------|-------|
| Node.js | v22+ | Probado con v24.22.0 |
| npm | v10+ | Probado con v11.17.0 |
| Rust + Cargo | 1.80+ | Solo requerido para compilar Tauri (escritorio Windows). **No instalado en este entorno.** |
| Tauri CLI | v2+ | Probado con v2.12.3 |

## Herramientas opcionales (móvil, fases futuras)

| Herramienta | Propósito |
|-------------|-----------|
| Android Studio | Compilar apps Android con Capacitor |
| Xcode (macOS) | Compilar apps iOS con Capacitor |

## Configuración local

1. Clonar el repositorio.
2. Copiar `.env.example` a `.env` (sin valores reales).
3. Instalar dependencias desde la raíz: `npm install`
4. Instalar dependencias del servidor: `cd server && npm install`
5. Ejecutar verificaciones: `npm run check`

## Notas específicas de Windows

- Todos los scripts de `package.json` están diseñados para funcionar en PowerShell.
- No se usan herramientas exclusivas de Unix.
- Para compilar Tauri en Windows se requiere Rust/Cargo instalado y el SDK de compilación de Visual Studio.
