import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { getCurrentUserOrThrow } from './users'

export const generateUploadUrl = mutation(async ctx => {
  return await ctx.storage.generateUploadUrl()
})

export const getPosts = query({
  args: {},
  handler: async ctx => {
    const posts = await ctx.db.query('posts').order('desc').collect()
    return Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)

        return {
          ...post,
          author,
          ...(post.coverImageId
            ? {
                coverImageUrl:
                  (await ctx.storage.getUrl(post.coverImageId)) ?? ''
              }
            : {})
        }
      })
    )
  }
})

export const getRecentPosts = query({
  args: {},
  handler: async ctx => {
    const posts = await ctx.db.query('posts').order('desc').take(4)
    return Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)

        return {
          ...post,
          author
        }
      })
    )
  }
})

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query('posts')
      .withIndex('bySlug', q => q.eq('slug', slug))
      .unique()

    if (!post) {
      return null
    }

    const author = await ctx.db.get(post.authorId)

    return {
      ...post,
      author,
      ...(post.coverImageId
        ? { coverImageUrl: (await ctx.storage.getUrl(post.coverImageId)) ?? '' }
        : {})
    }
  }
})

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImageId: v.optional(v.id('_storage'))
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const data = {
      ...args,
      authorId: user._id,
      likes: 0
    }

    await ctx.db.insert('posts', data)

    return data.slug
  }
})

export const likePost = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await getCurrentUserOrThrow(ctx)

    const post = await ctx.db
      .query('posts')
      .withIndex('bySlug', q => q.eq('slug', slug))
      .unique()

    if (!post) {
      return null
    }

    // if (post.authorId === user._id) {
    //   return null
    // }

    await ctx.db.patch(post._id, { likes: post.likes + 1 })
  }
})
