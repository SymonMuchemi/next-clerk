import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        clerkUserId: v.string(),
        firstname: v.optional(v.string()),
        lastname: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        posts: v.optional(v.array(v.id("posts"))),
    }).index('byClerkUserId', ['clerkUserId']),
    posts: defineTable({
        title: v.string(),
        slug: v.string(),
        excerpt: v.string(),
        content: v.string(),
        coverImgeId: v.optional(v.id("_storage")),
        authorId: v.id("users"),
        likes: v.number(),
    }).index('bySlug', ['slug'])
});
