var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express2 = __toESM(require("express"), 1);

// server/routes/analyzeRequest.ts
async function analyzeRequestHandler(req, res) {
  try {
    const { message, expertSkills, expertBio } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI that analyzes consultation requests. Given a guest's message and an expert's skills/bio, determine:
1. urgency: "high", "medium", or "low" based on how urgent the request sounds
2. relevance_score: 0.0-1.0 how well the request matches the expert's expertise
3. summary: a 1-2 sentence preview of the request

Respond using the analyze_request tool.`
          },
          {
            role: "user",
            content: `Guest message: "${message}"

Expert skills: ${(expertSkills || []).join(", ")}
Expert bio: ${expertBio || "N/A"}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_request",
              description: "Return analysis of the consultation request",
              parameters: {
                type: "object",
                properties: {
                  urgency: { type: "string", enum: ["high", "medium", "low"] },
                  relevance_score: { type: "number", minimum: 0, maximum: 1 },
                  summary: { type: "string" }
                },
                required: ["urgency", "relevance_score", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_request" } }
      })
    });
    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limited, please try again later." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "Payment required." });
      }
      const text2 = await response.text();
      console.error("AI error:", response.status, text2);
      return res.status(500).json({ error: "AI gateway error" });
    }
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const result = JSON.parse(toolCall.function.arguments);
      return res.json(result);
    }
    return res.json({ urgency: "medium", relevance_score: 0.5, summary: "Request received" });
  } catch (e) {
    console.error("analyze-request error:", e);
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

// server/routes.ts
var import_express = require("express");

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookingRequests: () => bookingRequests,
  chatMessages: () => chatMessages,
  expertTimeslots: () => expertTimeslots,
  insertBookingRequestSchema: () => insertBookingRequestSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertPendingVerificationSchema: () => insertPendingVerificationSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertReportSchema: () => insertReportSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertTimeslotSchema: () => insertTimeslotSchema,
  insertUserSchema: () => insertUserSchema,
  passwordResetTokens: () => passwordResetTokens,
  pendingVerifications: () => pendingVerifications,
  profiles: () => profiles,
  reports: () => reports,
  reviews: () => reviews,
  userRoles: () => userRoles,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var import_drizzle_zod = require("drizzle-zod");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  phone: (0, import_pg_core.text)("phone"),
  full_name: (0, import_pg_core.text)("full_name").notNull(),
  password_hash: (0, import_pg_core.text)("password_hash").notNull(),
  role: (0, import_pg_core.text)("role").notNull().default("client"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var pendingVerifications = (0, import_pg_core.pgTable)("pending_verifications", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  full_name: (0, import_pg_core.text)("full_name").notNull(),
  email: (0, import_pg_core.text)("email").notNull(),
  password_hash: (0, import_pg_core.text)("password_hash").notNull(),
  phone: (0, import_pg_core.text)("phone"),
  role: (0, import_pg_core.text)("role").notNull().default("client"),
  otp_code: (0, import_pg_core.text)("otp_code").notNull(),
  expires_at: (0, import_pg_core.timestamp)("expires_at").notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).omit({ id: true, created_at: true });
var insertPendingVerificationSchema = (0, import_drizzle_zod.createInsertSchema)(pendingVerifications).omit({ id: true, created_at: true });
var profiles = (0, import_pg_core.pgTable)("profiles", {
  user_id: (0, import_pg_core.text)("user_id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  email: (0, import_pg_core.text)("email"),
  role: (0, import_pg_core.text)("role").notNull().default("client"),
  title: (0, import_pg_core.text)("title"),
  bio: (0, import_pg_core.text)("bio"),
  skills: (0, import_pg_core.text)("skills").array(),
  qualifications: (0, import_pg_core.text)("qualifications").array(),
  category_id: (0, import_pg_core.text)("category_id"),
  subcategory_id: (0, import_pg_core.text)("subcategory_id"),
  show_community_hours: (0, import_pg_core.boolean)("show_community_hours").default(true),
  avatar_url: (0, import_pg_core.text)("avatar_url"),
  community_hours: (0, import_pg_core.real)("community_hours").default(0),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var expertTimeslots = (0, import_pg_core.pgTable)("expert_timeslots", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  expert_id: (0, import_pg_core.text)("expert_id").notNull(),
  day_of_week: (0, import_pg_core.text)("day_of_week").notNull(),
  start_time: (0, import_pg_core.text)("start_time").notNull(),
  end_time: (0, import_pg_core.text)("end_time").notNull(),
  is_booked: (0, import_pg_core.boolean)("is_booked").default(false),
  booking_request_id: (0, import_pg_core.uuid)("booking_request_id"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var bookingRequests = (0, import_pg_core.pgTable)("booking_requests", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  guest_id: (0, import_pg_core.text)("guest_id").notNull(),
  expert_id: (0, import_pg_core.text)("expert_id").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  urgency: (0, import_pg_core.text)("urgency").default("medium"),
  relevance_score: (0, import_pg_core.real)("relevance_score").default(0.5),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  chosen_timeslot_id: (0, import_pg_core.uuid)("chosen_timeslot_id"),
  duration_minutes: (0, import_pg_core.integer)("duration_minutes"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var chatMessages = (0, import_pg_core.pgTable)("chat_messages", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  booking_request_id: (0, import_pg_core.uuid)("booking_request_id").notNull(),
  sender_id: (0, import_pg_core.text)("sender_id"),
  content: (0, import_pg_core.text)("content").notNull(),
  is_ai: (0, import_pg_core.boolean)("is_ai").default(false),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var reviews = (0, import_pg_core.pgTable)("reviews", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  booking_request_id: (0, import_pg_core.uuid)("booking_request_id").notNull().unique(),
  reviewer_id: (0, import_pg_core.text)("reviewer_id").notNull(),
  expert_id: (0, import_pg_core.text)("expert_id").notNull(),
  rating: (0, import_pg_core.integer)("rating").notNull(),
  comment: (0, import_pg_core.text)("comment"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var userRoles = (0, import_pg_core.pgTable)("user_roles", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  user_id: (0, import_pg_core.text)("user_id").notNull(),
  role: (0, import_pg_core.text)("role").notNull().default("admin"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var reports = (0, import_pg_core.pgTable)("reports", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  reporter_id: (0, import_pg_core.text)("reporter_id").notNull(),
  reported_user_id: (0, import_pg_core.text)("reported_user_id").notNull(),
  reason: (0, import_pg_core.text)("reason").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var passwordResetTokens = (0, import_pg_core.pgTable)("password_reset_tokens", {
  id: (0, import_pg_core.uuid)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  user_id: (0, import_pg_core.uuid)("user_id").notNull(),
  token: (0, import_pg_core.text)("token").notNull(),
  expires_at: (0, import_pg_core.timestamp)("expires_at").notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertProfileSchema = (0, import_drizzle_zod.createInsertSchema)(profiles);
var insertBookingRequestSchema = (0, import_drizzle_zod.createInsertSchema)(bookingRequests).omit({ id: true, created_at: true });
var insertTimeslotSchema = (0, import_drizzle_zod.createInsertSchema)(expertTimeslots).omit({ id: true, created_at: true });
var insertChatMessageSchema = (0, import_drizzle_zod.createInsertSchema)(chatMessages).omit({ id: true, created_at: true });
var insertReviewSchema = (0, import_drizzle_zod.createInsertSchema)(reviews).omit({ id: true, created_at: true });
var insertReportSchema = (0, import_drizzle_zod.createInsertSchema)(reports).omit({ id: true, created_at: true });

// server/db.ts
var pool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  async getProfile(userId) {
    const [row] = await db.select().from(profiles).where((0, import_drizzle_orm2.eq)(profiles.user_id, userId));
    return row;
  }
  async getProfiles(userIds) {
    if (userIds.length === 0) return [];
    return db.select().from(profiles).where((0, import_drizzle_orm2.inArray)(profiles.user_id, userIds));
  }
  async getAllProfiles() {
    return db.select().from(profiles).orderBy((0, import_drizzle_orm2.desc)(profiles.created_at));
  }
  async upsertProfile(data) {
    const [row] = await db.insert(profiles).values(data).onConflictDoUpdate({ target: profiles.user_id, set: data }).returning();
    return row;
  }
  async updateProfile(userId, data) {
    const [row] = await db.update(profiles).set(data).where((0, import_drizzle_orm2.eq)(profiles.user_id, userId)).returning();
    return row;
  }
  async getBookingRequests(filter) {
    if (filter.expertId) {
      return db.select().from(bookingRequests).where((0, import_drizzle_orm2.eq)(bookingRequests.expert_id, filter.expertId)).orderBy((0, import_drizzle_orm2.desc)(bookingRequests.created_at));
    }
    if (filter.guestId) {
      return db.select().from(bookingRequests).where((0, import_drizzle_orm2.eq)(bookingRequests.guest_id, filter.guestId)).orderBy((0, import_drizzle_orm2.desc)(bookingRequests.created_at));
    }
    return [];
  }
  async getBookingRequest(id) {
    const [row] = await db.select().from(bookingRequests).where((0, import_drizzle_orm2.eq)(bookingRequests.id, id));
    return row;
  }
  async createBookingRequest(data) {
    const [row] = await db.insert(bookingRequests).values(data).returning();
    return row;
  }
  async updateBookingRequest(id, data) {
    const [row] = await db.update(bookingRequests).set(data).where((0, import_drizzle_orm2.eq)(bookingRequests.id, id)).returning();
    return row;
  }
  async getCompletedSessionsForExpert(expertId) {
    const completed = await db.select().from(bookingRequests).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookingRequests.expert_id, expertId), (0, import_drizzle_orm2.eq)(bookingRequests.status, "completed"))).orderBy((0, import_drizzle_orm2.desc)(bookingRequests.created_at)).limit(20);
    if (completed.length === 0) return [];
    const guestIds = [...new Set(completed.map((r) => r.guest_id))];
    const slotIds = completed.map((r) => r.chosen_timeslot_id).filter(Boolean);
    const [guestProfiles, slots] = await Promise.all([
      db.select({ user_id: profiles.user_id, name: profiles.name }).from(profiles).where((0, import_drizzle_orm2.inArray)(profiles.user_id, guestIds)),
      slotIds.length > 0 ? db.select({ id: expertTimeslots.id, start_time: expertTimeslots.start_time, end_time: expertTimeslots.end_time }).from(expertTimeslots).where((0, import_drizzle_orm2.inArray)(expertTimeslots.id, slotIds)) : Promise.resolve([])
    ]);
    const nameMap = new Map(guestProfiles.map((p) => [p.user_id, p.name]));
    const slotMap = new Map(slots.map((s) => [s.id, s]));
    return completed.map((r) => {
      let hours_earned = null;
      if (r.chosen_timeslot_id) {
        const slot = slotMap.get(r.chosen_timeslot_id);
        if (slot) {
          const [startH, startM] = slot.start_time.split(":").map(Number);
          const [endH, endM] = slot.end_time.split(":").map(Number);
          const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
          if (durationHours > 0) hours_earned = Math.round(durationHours * 100) / 100;
        }
      } else if (r.duration_minutes && r.duration_minutes > 0) {
        hours_earned = Math.round(r.duration_minutes / 60 * 100) / 100;
      }
      return {
        id: r.id,
        guest_name: nameMap.get(r.guest_id) || "Client",
        created_at: r.created_at ? r.created_at.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        hours_earned: hours_earned ?? 0
      };
    });
  }
  async getTimeslot(id) {
    const [row] = await db.select().from(expertTimeslots).where((0, import_drizzle_orm2.eq)(expertTimeslots.id, id));
    return row;
  }
  async getTimeslots(expertId, availableOnly = false) {
    if (availableOnly) {
      return db.select().from(expertTimeslots).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(expertTimeslots.expert_id, expertId), (0, import_drizzle_orm2.eq)(expertTimeslots.is_booked, false)));
    }
    return db.select().from(expertTimeslots).where((0, import_drizzle_orm2.eq)(expertTimeslots.expert_id, expertId));
  }
  async createTimeslots(data) {
    if (data.length === 0) return [];
    return db.insert(expertTimeslots).values(data).returning();
  }
  async deleteTimeslotsForExpert(expertId) {
    await db.delete(expertTimeslots).where((0, import_drizzle_orm2.eq)(expertTimeslots.expert_id, expertId));
  }
  async updateTimeslot(id, data) {
    const [row] = await db.update(expertTimeslots).set(data).where((0, import_drizzle_orm2.eq)(expertTimeslots.id, id)).returning();
    return row;
  }
  async claimTimeslot(slotId, bookingRequestId) {
    const [row] = await db.update(expertTimeslots).set({ is_booked: true, booking_request_id: bookingRequestId }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(expertTimeslots.id, slotId), (0, import_drizzle_orm2.eq)(expertTimeslots.is_booked, false))).returning();
    return row ?? null;
  }
  async releaseTimeslot(slotId, bookingRequestId) {
    const [row] = await db.update(expertTimeslots).set({ is_booked: false, booking_request_id: null }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(expertTimeslots.id, slotId), (0, import_drizzle_orm2.eq)(expertTimeslots.booking_request_id, bookingRequestId))).returning();
    return row ?? null;
  }
  async getChatMessages(bookingRequestId) {
    return db.select().from(chatMessages).where((0, import_drizzle_orm2.eq)(chatMessages.booking_request_id, bookingRequestId)).orderBy(chatMessages.created_at);
  }
  async createChatMessage(data) {
    const [row] = await db.insert(chatMessages).values(data).returning();
    return row;
  }
  async getReviewsForExpert(expertId) {
    return db.select().from(reviews).where((0, import_drizzle_orm2.eq)(reviews.expert_id, expertId)).orderBy((0, import_drizzle_orm2.desc)(reviews.created_at));
  }
  async getReviewByBooking(bookingRequestId) {
    const [row] = await db.select().from(reviews).where((0, import_drizzle_orm2.eq)(reviews.booking_request_id, bookingRequestId));
    return row;
  }
  async createReview(data) {
    const [row] = await db.insert(reviews).values(data).returning();
    return row;
  }
  async getAverageRatingForExpert(expertId) {
    const [row] = await db.select({ avg: (0, import_drizzle_orm2.avg)(reviews.rating) }).from(reviews).where((0, import_drizzle_orm2.eq)(reviews.expert_id, expertId));
    const val = row?.avg;
    if (val === null || val === void 0) return null;
    return parseFloat(String(val));
  }
  async incrementCommunityHours(expertId, hours) {
    await db.update(profiles).set({ community_hours: import_drizzle_orm2.sql`community_hours + ${hours}` }).where((0, import_drizzle_orm2.eq)(profiles.user_id, expertId));
  }
  async isAdmin(userId) {
    const [row] = await db.select().from(userRoles).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(userRoles.user_id, userId), (0, import_drizzle_orm2.eq)(userRoles.role, "admin")));
    return !!row;
  }
  async getReports(statusFilter) {
    if (statusFilter) {
      return db.select().from(reports).where((0, import_drizzle_orm2.eq)(reports.status, statusFilter)).orderBy((0, import_drizzle_orm2.desc)(reports.created_at));
    }
    return db.select().from(reports).orderBy((0, import_drizzle_orm2.desc)(reports.created_at));
  }
  async getReport(id) {
    const [row] = await db.select().from(reports).where((0, import_drizzle_orm2.eq)(reports.id, id));
    return row;
  }
  async createReport(data) {
    const [row] = await db.insert(reports).values(data).returning();
    return row;
  }
  async updateReport(id, data) {
    const [row] = await db.update(reports).set(data).where((0, import_drizzle_orm2.eq)(reports.id, id)).returning();
    return row;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET or SESSION_SECRET must be set as a Replit secret. Add it in the Secrets tab in your Replit project settings."
    );
  }
  return secret;
}
function signToken(payload) {
  return import_jsonwebtoken.default.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    const decoded = import_jsonwebtoken.default.verify(token, getJwtSecret());
    return decoded.userId;
  } catch {
    return null;
  }
}

// server/resend.ts
var import_resend = require("resend");
async function getUncachableResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken || !hostname) {
    throw new Error("Resend connector environment not available");
  }
  const settings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken
      }
    }
  ).then((r) => r.json()).then((d) => d.items?.[0]?.settings);
  if (!settings?.api_key) {
    throw new Error("Resend not connected \u2014 please connect Resend in the integrations panel");
  }
  const fromEmail = settings.from_email || "onboarding@resend.dev";
  return { client: new import_resend.Resend(settings.api_key), fromEmail };
}
async function sendOtpEmail(to, otp) {
  const { client, fromEmail } = await getUncachableResendClient();
  await client.emails.send({
    from: fromEmail,
    to,
    subject: "Your Shourak verification code",
    text: `Your Shourak verification code is: ${otp}

It expires in 10 minutes. If you did not sign up, you can safely ignore this email.`
  });
}
async function sendPasswordResetEmail(to, code) {
  const { client, fromEmail } = await getUncachableResendClient();
  await client.emails.send({
    from: fromEmail,
    to,
    subject: "Shourak password reset code",
    text: `Your Shourak password reset code is: ${code}

It expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.`
  });
}

// server/routes.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_drizzle_orm3 = require("drizzle-orm");
var router = (0, import_express.Router)();
function requireUser(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = authHeader.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
  return userId;
}
router.post("/auth/signup", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "full_name, email, password, and role are required" });
    }
    if (!["client", "expert"].includes(role)) {
      return res.status(400).json({ error: "role must be client or expert" });
    }
    const existing = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const password_hash = await import_bcryptjs.default.hash(password, 12);
    const otp_code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1e3);
    await db.delete(pendingVerifications).where((0, import_drizzle_orm3.eq)(pendingVerifications.email, email.toLowerCase().trim()));
    await db.insert(pendingVerifications).values({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      otp_code,
      expires_at
    });
    await sendOtpEmail(email.toLowerCase().trim(), otp_code);
    res.status(200).json({ message: "Verification code sent. Please check your email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    if (!email || !otp_code) {
      return res.status(400).json({ error: "email and otp_code are required" });
    }
    const [pending] = await db.select().from(pendingVerifications).where((0, import_drizzle_orm3.eq)(pendingVerifications.email, email.toLowerCase().trim())).limit(1);
    if (!pending) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }
    if (pending.otp_code !== otp_code) {
      return res.status(400).json({ error: "Incorrect verification code" });
    }
    if (/* @__PURE__ */ new Date() > new Date(pending.expires_at)) {
      await db.delete(pendingVerifications).where((0, import_drizzle_orm3.eq)(pendingVerifications.id, pending.id));
      return res.status(400).json({ error: "Verification code has expired. Please sign up again." });
    }
    const [newUser] = await db.insert(users).values({
      full_name: pending.full_name,
      email: pending.email,
      password_hash: pending.password_hash,
      phone: pending.phone,
      role: pending.role
    }).returning();
    await storage.upsertProfile({
      user_id: newUser.id,
      name: pending.full_name,
      email: pending.email,
      role: pending.role
    });
    await db.delete(pendingVerifications).where((0, import_drizzle_orm3.eq)(pendingVerifications.id, pending.id));
    res.status(201).json({ message: "Account created. Please sign in.", email: newUser.email });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await import_bcryptjs.default.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.get("/auth/me", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const profile = await storage.getProfile(userId);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
});
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email.toLowerCase().trim())).limit(1);
    if (user) {
      const token = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expires_at = new Date(Date.now() + 10 * 60 * 1e3);
      await db.delete(passwordResetTokens).where((0, import_drizzle_orm3.eq)(passwordResetTokens.user_id, user.id));
      await db.insert(passwordResetTokens).values({
        user_id: user.id,
        token,
        expires_at
      });
      await sendPasswordResetEmail(email.toLowerCase().trim(), token);
    }
    res.json({ message: "If an account with that email exists, a reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, token, new_password } = req.body;
    if (!email || !token || !new_password) {
      return res.status(400).json({ error: "email, token, and new_password are required" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      return res.status(400).json({ error: "Invalid reset code" });
    }
    const [resetRecord] = await db.select().from(passwordResetTokens).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(passwordResetTokens.user_id, user.id),
        (0, import_drizzle_orm3.eq)(passwordResetTokens.token, token),
        (0, import_drizzle_orm3.gt)(passwordResetTokens.expires_at, /* @__PURE__ */ new Date())
      )
    ).limit(1);
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }
    const password_hash = await import_bcryptjs.default.hash(new_password, 12);
    await db.update(users).set({ password_hash }).where((0, import_drizzle_orm3.eq)(users.id, user.id));
    await db.delete(passwordResetTokens).where((0, import_drizzle_orm3.eq)(passwordResetTokens.id, resetRecord.id));
    res.json({ message: "Password updated successfully. Please sign in with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.get("/profiles", async (req, res) => {
  const ids = (req.query.userIds || "").split(",").filter(Boolean);
  if (ids.length === 0) return res.json([]);
  const ps = await storage.getProfiles(ids);
  res.json(ps);
});
router.get("/profiles/:userId", async (req, res) => {
  const profile = await storage.getProfile(req.params.userId);
  if (!profile) return res.status(404).json({ error: "Not found" });
  res.json(profile);
});
router.post("/profiles", async (req, res) => {
  try {
    const profile = await storage.upsertProfile(req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.patch("/profiles", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const profile = await storage.updateProfile(userId, req.body);
    if (!profile) return res.status(404).json({ error: "Not found" });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.get("/booking-requests", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const { expertId, guestId } = req.query;
  if (expertId && expertId !== userId) {
    return res.status(403).json({ error: "Cannot query booking requests for another expert" });
  }
  if (guestId && guestId !== userId) {
    return res.status(403).json({ error: "Cannot query booking requests for another guest" });
  }
  const requests = await storage.getBookingRequests({ expertId, guestId });
  res.json(requests);
});
router.get("/booking-requests/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const request = await storage.getBookingRequest(req.params.id);
  if (!request) return res.status(404).json({ error: "Not found" });
  if (request.expert_id !== userId && request.guest_id !== userId) {
    return res.status(403).json({ error: "Access denied: you are not a party to this booking" });
  }
  res.json(request);
});
router.post("/booking-requests", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { expert_id, chosen_timeslot_id } = req.body;
    if (!expert_id) return res.status(400).json({ error: "expert_id is required" });
    if (!chosen_timeslot_id) return res.status(400).json({ error: "chosen_timeslot_id is required \u2014 select an available time slot" });
    const slot = await storage.getTimeslot(chosen_timeslot_id);
    if (!slot) return res.status(400).json({ error: "Timeslot not found" });
    if (slot.expert_id !== expert_id) return res.status(400).json({ error: "Timeslot does not belong to this expert" });
    if (slot.is_booked) return res.status(409).json({ error: "That timeslot is no longer available" });
    const request = await storage.createBookingRequest({ ...req.body, guest_id: userId });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.patch("/booking-requests/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { status } = req.body;
    const extraFields = Object.keys(req.body).filter((k) => k !== "status");
    if (extraFields.length > 0) {
      return res.status(400).json({ error: `Only status may be updated. Unexpected fields: ${extraFields.join(", ")}` });
    }
    if (!status) return res.status(400).json({ error: "status is required" });
    const existing = await storage.getBookingRequest(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    const isExpert = existing.expert_id === userId;
    const isGuest = existing.guest_id === userId;
    if (!isExpert && !isGuest) {
      return res.status(403).json({ error: "Access denied: you are not a party to this booking" });
    }
    if (status === "accepted" || status === "declined") {
      if (!isExpert) return res.status(403).json({ error: "Only the expert can accept or decline this request" });
      if (existing.status !== "pending") return res.status(409).json({ error: `Cannot ${status} a request with status '${existing.status}'` });
    } else if (status === "cancelled") {
      if (!isGuest) return res.status(403).json({ error: "Only the client can cancel this request" });
      if (existing.status !== "pending") return res.status(409).json({ error: `Cannot cancel a request with status '${existing.status}'` });
    } else if (status === "completed" || status === "no_show") {
      if (!isExpert) return res.status(403).json({ error: "Only the expert can mark a session as completed or no-show" });
      if (existing.status !== "accepted") return res.status(409).json({ error: `Cannot mark '${status}' unless session is accepted (currently '${existing.status}')` });
    } else {
      return res.status(400).json({ error: `Invalid status transition to '${status}'` });
    }
    if (status === "accepted" && existing.chosen_timeslot_id) {
      const claimed = await storage.claimTimeslot(existing.chosen_timeslot_id, existing.id);
      if (!claimed) return res.status(409).json({ error: "The chosen timeslot is no longer available" });
    }
    const request = await storage.updateBookingRequest(req.params.id, { status });
    if (!request) return res.status(404).json({ error: "Not found" });
    if (status === "cancelled" && request.chosen_timeslot_id) {
      await storage.releaseTimeslot(request.chosen_timeslot_id, request.id);
    }
    if (status === "completed") {
      try {
        let hours = null;
        if (existing.chosen_timeslot_id) {
          const slot = await storage.getTimeslot(existing.chosen_timeslot_id);
          if (slot) {
            const [startH, startM] = slot.start_time.split(":").map(Number);
            const [endH, endM] = slot.end_time.split(":").map(Number);
            const duration = (endH * 60 + endM - (startH * 60 + startM)) / 60;
            if (duration > 0) hours = duration;
          }
        } else if (existing.duration_minutes && existing.duration_minutes > 0) {
          hours = existing.duration_minutes / 60;
        }
        if (hours !== null) {
          await storage.incrementCommunityHours(existing.expert_id, hours);
        }
      } catch (err) {
        console.error("Failed to increment community hours:", err);
      }
    }
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.get("/expert/completed-sessions", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const profile = await storage.getProfile(userId);
    if (!profile || profile.role !== "expert") {
      return res.status(403).json({ error: "Only experts can access this endpoint" });
    }
    const sessions = await storage.getCompletedSessionsForExpert(userId);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
router.get("/timeslots/:expertId", async (req, res) => {
  const availableOnly = req.query.availableOnly === "true";
  const slots = await storage.getTimeslots(req.params.expertId, availableOnly);
  res.json(slots);
});
router.post("/timeslots", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await storage.deleteTimeslotsForExpert(userId);
    const slots = await storage.createTimeslots(
      req.body.map((s) => ({
        expert_id: userId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time
      }))
    );
    res.status(201).json(slots);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.patch("/timeslots/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const existing = await storage.getTimeslot(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.expert_id !== userId) return res.status(403).json({ error: "Access denied: you do not own this timeslot" });
    const slot = await storage.updateTimeslot(req.params.id, req.body);
    if (!slot) return res.status(404).json({ error: "Not found" });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.get("/reviews/booking/:bookingId", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const booking = await storage.getBookingRequest(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.guest_id !== userId && booking.expert_id !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }
  const review = await storage.getReviewByBooking(req.params.bookingId);
  res.json(review ?? null);
});
router.get("/reviews/:expertId", async (req, res) => {
  const reviewList = await storage.getReviewsForExpert(req.params.expertId);
  const avgRating = await storage.getAverageRatingForExpert(req.params.expertId);
  res.json({ reviews: reviewList, averageRating: avgRating });
});
router.post("/reviews", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { booking_request_id, rating, comment } = req.body;
    if (!booking_request_id || !rating) {
      return res.status(400).json({ error: "booking_request_id and rating are required" });
    }
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be an integer between 1 and 5" });
    }
    const booking = await storage.getBookingRequest(booking_request_id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.guest_id !== userId) return res.status(403).json({ error: "Only the client can leave a review" });
    if (booking.status !== "completed") return res.status(409).json({ error: "Can only review completed sessions" });
    const existing = await storage.getReviewByBooking(booking_request_id);
    if (existing) return res.status(409).json({ error: "A review already exists for this booking" });
    const review = await storage.createReview({
      booking_request_id,
      reviewer_id: userId,
      expert_id: booking.expert_id,
      rating: Math.round(rating),
      comment: comment ?? null
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.get("/chat/:requestId", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const booking = await storage.getBookingRequest(req.params.requestId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.expert_id !== userId && booking.guest_id !== userId) {
    return res.status(403).json({ error: "Access denied: you are not a party to this booking" });
  }
  const messages = await storage.getChatMessages(req.params.requestId);
  res.json(messages);
});
router.post("/chat", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { booking_request_id } = req.body;
    if (!booking_request_id) return res.status(400).json({ error: "booking_request_id is required" });
    const booking = await storage.getBookingRequest(booking_request_id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.expert_id !== userId && booking.guest_id !== userId) {
      return res.status(403).json({ error: "Access denied: you are not a party to this booking" });
    }
    if (booking.status !== "accepted") {
      return res.status(409).json({ error: "Chat is only available for accepted bookings" });
    }
    const message = await storage.createChatMessage({ ...req.body, sender_id: userId });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.post("/reports", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { reported_user_id, reason } = req.body;
    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: "reported_user_id and reason are required" });
    }
    if (reported_user_id === userId) {
      return res.status(400).json({ error: "You cannot report yourself" });
    }
    const report = await storage.createReport({ reporter_id: userId, reported_user_id, reason, status: "pending" });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
router.get("/admin/check", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const isAdmin = await storage.isAdmin(userId);
  res.json({ isAdmin });
});
router.get("/admin/users", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const isAdmin = await storage.isAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Admin access required" });
  const allProfiles = await storage.getAllProfiles();
  res.json(allProfiles);
});
router.get("/admin/reports", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const isAdmin = await storage.isAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Admin access required" });
  const statusFilter = req.query.status;
  const reportList = await storage.getReports(statusFilter);
  res.json(reportList);
});
router.patch("/admin/reports/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const isAdmin = await storage.isAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Admin access required" });
  try {
    const report = await storage.updateReport(req.params.id, req.body);
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
var routes_default = router;

// server/index.ts
var import_drizzle_orm4 = require("drizzle-orm");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_meta = {};
var __dirname = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
async function runMigrations() {
  try {
    await db.execute(import_drizzle_orm4.sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT now()
      )
    `);
    const usersExists = await db.execute(import_drizzle_orm4.sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    if (usersExists.rows.length > 0) {
      await db.execute(import_drizzle_orm4.sql`
        INSERT INTO _migrations (name)
        VALUES ('0000_conscious_earthquake.sql')
        ON CONFLICT DO NOTHING
      `);
    }
    const migrationsDir = import_path.default.join(__dirname, "../drizzle");
    const files = import_fs.default.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      const rows = await db.execute(
        import_drizzle_orm4.sql`SELECT 1 FROM _migrations WHERE name = ${file}`
      );
      if (rows.rows.length === 0) {
        const sqlText = import_fs.default.readFileSync(import_path.default.join(migrationsDir, file), "utf8");
        const statements = sqlText.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
        for (const stmt of statements) {
          await db.execute(import_drizzle_orm4.sql.raw(stmt));
        }
        await db.execute(import_drizzle_orm4.sql`INSERT INTO _migrations (name) VALUES (${file})`);
        console.log(`[migrations] Applied: ${file}`);
      }
    }
  } catch (err) {
    console.error("[migrations] Failed:", err);
    throw err;
  }
}
var app = (0, import_express2.default)();
var PORT = parseInt(process.env.PORT || "3001", 10);
app.use(import_express2.default.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.post("/api/analyze-request", analyzeRequestHandler);
app.use("/api", routes_default);
if (process.env.NODE_ENV === "production") {
  const distPath = import_path.default.join(__dirname, "../dist");
  app.use(import_express2.default.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
}
runMigrations().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on port ${PORT}`);
  });
});
var TEN_MINUTES = 10 * 60 * 1e3;
async function runAutoCompleteSessions() {
  try {
    await db.execute(import_drizzle_orm4.sql`SELECT auto_complete_sessions()`);
    console.log("[scheduler] auto_complete_sessions() ran successfully");
  } catch (err) {
    console.error("[scheduler] auto_complete_sessions() failed:", err);
  }
}
runAutoCompleteSessions();
setInterval(runAutoCompleteSessions, TEN_MINUTES);
