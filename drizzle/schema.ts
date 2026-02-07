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

export const solicitacoes = mysqlTable("solicitacoes", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 64 }).notNull().unique(),
  timestampEnvio: timestamp("timestampEnvio").notNull(),
  lojaId: varchar("lojaId", { length: 10 }).notNull(),
  lojaLabel: text("lojaLabel").notNull(),
  solicitanteNome: varchar("solicitanteNome", { length: 255 }).notNull(),
  solicitanteTelefone: varchar("solicitanteTelefone", { length: 20 }),
  numeroChamado: varchar("numeroChamado", { length: 50 }),
  tipoEquipe: varchar("tipoEquipe", { length: 50 }).notNull(),
  empresaTerceira: varchar("empresaTerceira", { length: 255 }),
  tipoServico: varchar("tipoServico", { length: 50 }).notNull(),
  sistemaAfetado: varchar("sistemaAfetado", { length: 100 }).notNull(),
  descricaoGeralServico: text("descricaoGeralServico").notNull(),
  statusCompra: varchar("statusCompra", { length: 50 }).default("Recebido").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Solicitacao = typeof solicitacoes.$inferSelect;
export type InsertSolicitacao = typeof solicitacoes.$inferInsert;

export const materiais = mysqlTable("materiais", {
  id: int("id").autoincrement().primaryKey(),
  solicitacaoId: int("solicitacaoId").notNull(),
  requestId: varchar("requestId", { length: 64 }).notNull(),
  materialDescricao: text("materialDescricao").notNull(),
  materialEspecificacao: text("materialEspecificacao"),
  quantidade: int("quantidade").notNull(),
  unidade: varchar("unidade", { length: 20 }).notNull(),
  urgencia: varchar("urgencia", { length: 20 }).notNull(),
  foto1Url: text("foto1Url"),
  foto2Url: text("foto2Url"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Material = typeof materiais.$inferSelect;
export type InsertMaterial = typeof materiais.$inferInsert;