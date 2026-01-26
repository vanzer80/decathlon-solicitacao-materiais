import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, solicitacoes, materiais, InsertMaterial, Solicitacao, Material, InsertSolicitacao } from "../drizzle/schema";
import { ENV } from './_core/env';

export let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function initDb() {
  return getDb();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSolicitacao(
  data: InsertSolicitacao
): Promise<Solicitacao | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(solicitacoes).values(data);
    const inserted = await db
      .select()
      .from(solicitacoes)
      .where(eq(solicitacoes.requestId, data.requestId))
      .limit(1);
    return inserted.length > 0 ? inserted[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create solicitacao:", error);
    throw error;
  }
}

export async function createMateriais(
  items: InsertMaterial[]
): Promise<Material[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    await db.insert(materiais).values(items);
    return items.map((item) => ({
      ...item,
      id: 0,
      createdAt: new Date(),
    })) as Material[];
  } catch (error) {
    console.error("[Database] Failed to create materiais:", error);
    throw error;
  }
}

export async function getSolicitacaoByRequestId(
  requestId: string
): Promise<Solicitacao | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(solicitacoes)
      .where(eq(solicitacoes.requestId, requestId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get solicitacao:", error);
    throw error;
  }
}

export async function getMaterialisBySolicitacaoId(
  solicitacaoId: number
): Promise<Material[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(materiais)
      .where(eq(materiais.solicitacaoId, solicitacaoId));
  } catch (error) {
    console.error("[Database] Failed to get materiais:", error);
    throw error;
  }
}
