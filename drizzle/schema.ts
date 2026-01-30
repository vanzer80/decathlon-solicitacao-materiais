import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const materialRequests = mysqlTable("material_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull().unique(),
  timestampEnvio: timestamp("timestamp_envio").notNull(),
  lojaId: int("loja_id").notNull(),
  lojaLabel: varchar("loja_label", { length: 255 }).notNull(),
  solicitanteNome: varchar("solicitante_nome", { length: 255 }).notNull(),
  solicitanteTelefone: varchar("solicitante_telefone", { length: 20 }),
  numeroChamado: varchar("numero_chamado", { length: 50 }),
  tipoEquipe: varchar("tipo_equipe", { length: 50 }).notNull(),
  empresaTerceira: varchar("empresa_terceira", { length: 255 }),
  tipoServico: varchar("tipo_servico", { length: 50 }).notNull(),
  sistemaAfetado: varchar("sistema_afetado", { length: 50 }).notNull(),
  descricaoGeralServico: text("descricao_geral_servico").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MaterialRequest = typeof materialRequests.$inferSelect;
export type InsertMaterialRequest = typeof materialRequests.$inferInsert;

export const materialItems = mysqlTable("material_items", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull(),
  materialDescricao: varchar("material_descricao", { length: 255 }).notNull(),
  materialEspecificacao: text("material_especificacao"),
  quantidade: int("quantidade").notNull(),
  unidade: varchar("unidade", { length: 50 }).notNull(),
  urgencia: varchar("urgencia", { length: 50 }).notNull(),
  foto1Url: text("foto1_url"),
  foto2Url: text("foto2_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MaterialItem = typeof materialItems.$inferSelect;
export type InsertMaterialItem = typeof materialItems.$inferInsert;