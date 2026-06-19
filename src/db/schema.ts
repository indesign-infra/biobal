import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";

// ─── LEADS (formulario de contacto / solicitud de visita) ─────────────────
export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    email: text("email").notNull(),
    telefono: text("telefono").notNull(),
    especialidad: text("especialidad"),
    mensaje: text("mensaje"),
    origen: text("origen").default("web"), // 'web' | 'instagram' | 'referido'
    estado: text("estado").default("nuevo"), // 'nuevo' | 'contactado' | 'en-proceso' | 'cerrado'
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => ({
    emailIdx: index("leads_email_idx").on(table.email),
    estadoIdx: index("leads_estado_idx").on(table.estado),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// ─── USERS (administración) ───────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin").notNull(), // 'owner' | 'admin'
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── CHAT (asistente virtual) ─────────────────────────────────────────────
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  lastActive: text("last_active")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const chatbotSettings = sqliteTable("chatbot_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activo: integer("activo", { mode: "boolean" }).default(true),
  nombre: text("nombre").default("Asistente BioBal"),
  tono: text("tono").default("Amigable, profesional y servicial"),
  instrucciones: text("instrucciones"),
  conocimiento: text("conocimiento"),
  saludo: text("saludo").default(
    "¡Hola! Soy el asistente virtual de BioBal. Puedo contarte sobre el alquiler de consultorios, las especialidades y los servicios. ¿En qué te ayudo?",
  ),
  cta: text("cta").default(
    "Para coordinar una visita o más información, escribinos por WhatsApp:",
  ),
  whatsapp: text("whatsapp").default("5491127585392"),
  avatarUrl: text("avatar_url"),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ChatbotSettings = typeof chatbotSettings.$inferSelect;
export type NewChatbotSettings = typeof chatbotSettings.$inferInsert;

// ─── INSTAGRAM POSTS (feed cacheado desde Behold.so) ──────────────────────
export const instagramPosts = sqliteTable("instagram_posts", {
  id: text("id").primaryKey(),
  permalink: text("permalink").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type"),
  caption: text("caption"),
  timestamp: text("timestamp"),
});

export type InstagramPost = typeof instagramPosts.$inferSelect;
export type NewInstagramPost = typeof instagramPosts.$inferInsert;

// ─── VIDEOS VERTICALES (Reels) ────────────────────────────────────────────
export const verticalVideos = sqliteTable("vertical_videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isActive: integer("is_active").default(1).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type VerticalVideo = typeof verticalVideos.$inferSelect;
export type NewVerticalVideo = typeof verticalVideos.$inferInsert;

// ─── GALERIA DE IMAGENES ──────────────────────────────────────────────────
export const galeria = sqliteTable("galeria", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  category: text("category"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type GalleryImage = typeof galeria.$inferSelect;
export type NewGalleryImage = typeof galeria.$inferInsert;

// ─── SECCIONES DEL HOME (visibilidad + contenido editable) ────────────────
export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(), // slug: hero, sobre, bio-banco, ...
  label: text("label").notNull(), // nombre para el admin
  enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
  inNav: integer("in_nav", { mode: "boolean" }).default(false).notNull(),
  navLabel: text("nav_label"),
  displayOrder: integer("display_order").default(0).notNull(),
  // contenido editable (solo se usan los campos relevantes de cada sección)
  eyebrow: text("eyebrow"),
  title: text("title"),
  subtitle: text("subtitle"),
  body: text("body"),
  imageUrl: text("image_url"),
});

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

// ─── DATOS DEL NEGOCIO (singleton, id = 1) ────────────────────────────────
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  tagline: text("tagline"),
  phoneDisplay: text("phone_display"),
  phoneTel: text("phone_tel"),
  whatsapp: text("whatsapp"),
  instagramHandle: text("instagram_handle"),
  instagramUrl: text("instagram_url"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  mapsUrl: text("maps_url"),
  email: text("email"),
  referente: text("referente"),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
