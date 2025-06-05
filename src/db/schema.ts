import {
    timestamp,
    pgTable,
    text,
} from "drizzle-orm/pg-core"

// export const users = pgTable("user", {
//     id: text("id")
//         .primaryKey()
//         .$defaultFn(() => crypto.randomUUID()),
//     name: text("name"),
//     email: text("email").unique(),
//     image: text("image"),
//     password: text("password").notNull(),
//     createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
//     updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
// })

export const admins = pgTable("admin", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
})

export const laywers = pgTable("laywer", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
})
