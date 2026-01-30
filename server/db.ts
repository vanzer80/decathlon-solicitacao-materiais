import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  materialRequests,
  materialItems,
  MaterialRequest,
  MaterialItem,
  InsertMaterialRequest,
  InsertMaterialItem,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function createMaterialRequest(
  request: InsertMaterialRequest
): Promise<MaterialRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .insert(materialRequests)
      .values(request)
      .$returningId();
    return result.length > 0
      ? await db
          .select()
          .from(materialRequests)
          .where(eq(materialRequests.id, result[0].id))
          .limit(1)
          .then((rows) => rows[0])
      : undefined;
  } catch (error) {
    console.error("[Database] Failed to create material request:", error);
    throw error;
  }
}

export async function createMaterialItem(
  item: InsertMaterialItem
): Promise<MaterialItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .insert(materialItems)
      .values(item)
      .$returningId();
    return result.length > 0
      ? await db
          .select()
          .from(materialItems)
          .where(eq(materialItems.id, result[0].id))
          .limit(1)
          .then((rows) => rows[0])
      : undefined;
  } catch (error) {
    console.error("[Database] Failed to create material item:", error);
    throw error;
  }
}

export async function getMaterialRequestByRequestId(
  requestId: string
): Promise<MaterialRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(materialRequests)
      .where(eq(materialRequests.requestId, requestId))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get material request:", error);
    throw error;
  }
}

export async function getMaterialItemsByRequestId(
  requestId: string
): Promise<MaterialItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(materialItems)
      .where(eq(materialItems.requestId, requestId));
  } catch (error) {
    console.error("[Database] Failed to get material items:", error);
    throw error;
  }
}
