# Estructura del repositorio — POS Buen Gusto

## Organización actual (Fase 1)

El repositorio mantiene el scaffold Tauri en la raíz y añade el backend como subdirectorio. No se migró a monorepo en esta fase porque:

1. Rust/Cargo no está disponible en el entorno, por lo que no se puede verificar una migración de rutas de Tauri.
2. Phase 0 dejó el scaffold en raíz y Phase 1 permite migrar solo con plan verificable.
3. La estructura actual es funcional y mantenible para el alcance de Fase 1.

```
pos-buen-gusto/
├── src/                    # Aplicación Vue 3 + TypeScript (cliente compartido)
│   ├── App.vue
│   ├── main.ts
│   ├── components/         # Componentes Vue (ej. WelcomeMessage.vue)
│   ├── utils/              # Utilidades frontend (ej. currency.ts)
│   └── vite-env.d.ts
├── public/                 # Recursos estáticos de Vite
├── server/                 # Backend Fastify + TypeScript (mínimo)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts        # Punto de entrada, endpoint GET /health
│       └── health.test.ts  # Prueba del endpoint de diagnóstico
├── src-tauri/              # Capa de escritorio Tauri 2 (Rust)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── src/
│   │   ├── lib.rs          # Comandos Tauri (ej. greet)
│   │   └── main.rs         # Punto de entrada Rust
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   └── .gitignore
├── docs/                   # Documentación del proyecto
│   ├── ADR/
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   ├── DATA_MODEL.md
│   ├── DEVELOPMENT_SETUP.md
│   ├── IMPLEMENTATION_PHASES.md
│   ├── OPEN_QUESTIONS.md
│   ├── PRICING_ENGINE.md
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── SECURITY.md
│   └── TESTING.md
├── AGENTS.md               # Instrucciones para agentes
├── .env.example            # Ejemplo de variables de entorno
├── .eslintrc.js / eslint.config.js   # Configuración ESLint (flat config)
├── .prettierrc             # Configuración Prettier
├── .editorconfig           # Configuración EditorConfig
├── .gitignore              # Archivos ignorados por Git
├── index.html              # Punto de entrada Vite
├── package.json            # Scripts y dependencias del cliente
├── tsconfig.json           # Configuración TypeScript cliente
├── tsconfig.node.json      # Configuración TypeScript Node (Vite)
├── vite.config.ts          # Configuración Vite
└── vitest.config.ts        # Configuración Vitest
```

## Responsabilidades por paquete

| Ruta | Responsabilidad | Tecnología |
|------|----------------|------------|
| `src/` | Interfaz de usuario, estimaciones de precio, navegación, animaciones | Vue 3, TypeScript, Vite |
| `server/` | API mínima con `/health`, futura autoridad de precios | Node.js, TypeScript, Fastify |
| `src-tauri/` | Empaquetado Windows, ventana principal, acceso nativo futuro | Tauri 2, Rust |
| `docs/` | Documentación de arquitectura, requisitos, reglas del negocio | Markdown |

## Preparación móvil (Capacitor, fase futura)

- No hay código móvil instalado en Fase 1.
- La aplicación Vue en `src/` está diseñada para reutilizarse en Capacitor.
- Requisitos de construcción documentados en `docs/DEVELOPMENT_SETUP.md`.
- Android: Android Studio + SDK. iOS: Xcode (solo macOS).

## Contratos compartidos

- No hay paquete de contratos compartidos en Fase 1.
- Los contratos comerciales se definirán en fases posteriores basándose en el modelo de datos de Fase 0.
