import { v, Validator } from "convex/values";
import { internalMutation, query, QueryCtx } from "./_generated/server"
import { UserJSON } from "@clerk/backend";

/**
 * Retrieves a list of users from the database.
 *
 * This query does not take any arguments and returns all users
 * from the "users" collection in the database.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 */
export const getUsers = query({
    args: {},
    handler: async ctx => {
        return ctx.db.query("users").collect()
    }
});

/**
 * Retrieves the most recent users from the database.
 *
 * This query fetches the latest 5 users from the "users" table,
 * ordered in descending order.
 *
 * @returns {Promise<Array<User>>} A promise that resolves to an array of the most recent users.
 */
export const getRecentUsers = query({
    args: {},
    handler: async ctx => {
        return ctx.db.query("users").order("desc").take(5);
    }
});

/**
 * Query to get the current user.
 *
 * @constant
 * @type {Query}
 * @param {Object} args - The arguments for the query.
 * @param {Function} handler - The handler function to process the query.
 * @returns {Promise<Object>} The current user object.
 */
export const current = query({
    args: {},
    handler: async ctx => {
        return await getCurrentUser(ctx);
    }
})

/**
 * Retrieves the current user based on the authentication context.
 *
 * @param ctx - The query context containing authentication information.
 * @returns The current user object if the user is authenticated, otherwise null.
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return null;

    return await userByClerkUserId(ctx, identity.subject);
}

/**
 * Retrieves the current user record or throws an error if the user is not found.
 *
 * @param ctx - The context object containing query information.
 * @returns The current user record.
 * @throws Will throw an error if the current user cannot be retrieved.
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord) throw new Error("Can't get current user");
    return userRecord;
}

/**
 * Retrieves a user from the database using their Clerk user ID.
 *
 * @param ctx - The query context containing the database connection.
 * @param clerkUserId - The Clerk user ID of the user to retrieve.
 * @returns A promise that resolves to the user object if found, otherwise null.
 */
export const userByClerkUserId = async (ctx: QueryCtx, clerkUserId: string) => {
    return await ctx.db
        .query("users")
        .withIndex('byClerkUserId', q => q.eq("clerkUserId", clerkUserId))
        .unique()
}

/**
 * Upserts a user from Clerk data.
 *
 * This function is an internal mutation that takes user data from Clerk and either inserts a new user
 * into the database or updates an existing user based on the Clerk user ID.
 *
 * @param args - The arguments for the mutation.
 * @param args.data - The user data from Clerk, validated as `UserJSON`.
 * @param ctx - The context object, which includes the database instance.
 * @param ctx.db - The database instance for performing insert and patch operations.
 * @param ctx.db.insert - Function to insert a new user into the "users" collection.
 * @param ctx.db.patch - Function to update an existing user in the "users" collection.
 * @param handler - The async function that handles the upsert operation.
 * @param handler.ctx - The context object passed to the handler.
 * @param handler.data - The user data from Clerk passed to the handler.
 *
 * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
 */
export const upsertFromClerk = internalMutation({
    args: { data: v.any() as Validator<UserJSON> },
    async handler(ctx, { data }) {
        const userAttributes = {
            email: data.email_addresses[0].email_address,
            clerkUserId: data.id,
            firstname: data.first_name ?? undefined,
            lastname: data.last_name ?? undefined,
            imageUrl: data.image_url ?? undefined
        }

        const user = await userByClerkUserId(ctx, data.id);

        if (user === null) {
            await ctx.db.insert("users", userAttributes);
        } else {
            await ctx.db.patch(user._id, userAttributes);
        }
    }
});


/**
 * Deletes a user from the database based on the provided Clerk user ID.
 *
 * @param {Object} args - The arguments object.
 * @param {string} args.clerkUserId - The ID of the user in Clerk.
 * @returns {Promise<void>} - A promise that resolves when the user is deleted.
 *
 * @throws {Error} If the user cannot be found in the database.
 *
 * @example
 * ```typescript
 * await deleteFromClerk({ clerkUserId: 'user_123' });
 * ```
 */
export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    async handler(ctx, { clerkUserId }) {
        const user = await userByClerkUserId(ctx, clerkUserId);

        if (user !== null) {
            await ctx.db.delete(user._id);
        } else {
            console.warn(`Cannot delete user! No user with ID: ${clerkUserId}`);
        }
    }
});
