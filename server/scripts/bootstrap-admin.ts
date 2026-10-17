import { config } from "../src/config";
import { hashPassword } from "../src/utils/password";
import { connectDb, getDb, schema } from "../src/db/connection";
import { eq } from "drizzle-orm";

async function main() {
  const env = config();

  console.log("Iniciando bootstrap del administrador...");

  try {
    await connectDb();
    const db = getDb();

    // Verificar si ya existe un administrador
    const existingAdmin = await db.query.users.findFirst({
      with: {
        role: true,
      },
    });

    if (existingAdmin && existingAdmin.role.name === "administrador") {
      console.log(
        "Ya existe un usuario con rol administrador. No se creará uno nuevo."
      );
      process.exit(0);
    }

    // Asegurar que exista el rol administrador
    let adminRole = await db.query.roles.findFirst({
      where: eq(schema.roles.name, "administrador"),
    });

    if (!adminRole) {
      const [newRole] = await db
        .insert(schema.roles)
        .values({
          name: "administrador",
          description: "Acceso total a administración",
          isActive: true,
        })
        .returning();
      adminRole = newRole;
      console.log("Rol 'administrador' creado.");
    }

    // Solicitar credenciales desde argumentos o variables de entorno
    const username =
      process.argv[2] || process.env.ADMIN_USERNAME || "admin";
    const password = process.argv[3] || process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error(
        "Error: Se requiere una contraseña para el administrador."
      );
      console.error(
        "Uso: node dist/scripts/bootstrap-admin.js <usuario> <contraseña>"
      );
      console.error(
        "O defina las variables ADMIN_USERNAME y ADMIN_PASSWORD."
      );
      process.exit(1);
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (existingUser) {
      console.error(
        `Error: El usuario '${username}' ya existe.`
      );
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    await db.insert(schema.users).values({
      username,
      email: `${username}@pos-buen-gusto.local`,
      passwordHash,
      fullName: "Administrador del Sistema",
      roleId: adminRole.id,
      isActive: true,
    });

    console.log(
      `Usuario administrador '${username}' creado exitosamente.`
    );
    console.log(
      "Guarde la contraseña en un lugar seguro. No se mostrará nuevamente."
    );
  } catch (error) {
    console.error(
      "Error durante el bootstrap:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
