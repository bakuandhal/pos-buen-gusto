// Variables de entorno para pruebas (valores de ejemplo, no credenciales reales)
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:cambiar_esta_contraseña@localhost:5432/pos_buen_gusto_test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "clave-de-prueba-para-desarrollo-solo-123456789012";
process.env.JWT_ACCESS_TOKEN_EXPIRY = "15m";
process.env.JWT_REFRESH_TOKEN_EXPIRY = "7d";
process.env.CORS_ORIGINS = "http://localhost:1420";
process.env.PORT = "3000";
process.env.HOST = "0.0.0.0";
process.env.NODE_ENV = "test";
