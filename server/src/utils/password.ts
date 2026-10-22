import { hash, verify } from 'argon2';

const ARGON2_OPTS: any = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  const result = await hash(password, ARGON2_OPTS);
  return typeof result === 'string' ? result : result.toString();
}

export async function comparePassword(
  plainPassword: string,
  hashPassword: string
): Promise<boolean> {
  try {
    return await verify(hashPassword, plainPassword);
  } catch {
    return false;
  }
}
