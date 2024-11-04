import Link from 'next/link'
import Image from 'next/image'

import { Post } from '@/lib/types'
import { combineName, formatDate } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { MessageSquare, Sparkle, ThumbsUp } from 'lucide-react'

export default function PostItem({ post }: { post: Post }) {
  return (
    <li className='mb-4 pb-10 pt-5 sm:border-b'>
      <Link href={`/posts/${post.slug}`} className='block'>
        {/* Author */}
        <div className='inline-flex items-center gap-3'>
          <Avatar className='size-6'>
            <AvatarImage
              src={post.author?.imageUrl}
              alt={combineName(post.author)}
            />
            <AvatarFallback>{post.author?.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className='text-sm'>{combineName(post.author)}</h2>
          </div>
        </div>

        <div className='mt-2 flex flex-col-reverse gap-x-10 sm:mt-4 sm:flex-row sm:items-center'>
          {/* Post details */}
          <div className='mt-4 w-full sm:mt-0 sm:w-3/4'>
            <div className='space-y-1'>
              <h3 className='font-serif text-xl font-bold'>{post.title}</h3>
              <p className='text-sm text-muted-foreground'>{post.excerpt}</p>
            </div>

            <div className='mt-7 flex items-center justify-between text-sm text-muted-foreground'>
              <div className='flex items-center gap-4'>
                <Sparkle className='h-4 w-4 fill-yellow-500 text-yellow-500' />
                <span>{formatDate(post._creationTime)}</span>
                <Separator orientation='vertical' className='h-4' />
                <div className='flex items-center gap-2'>
                  <ThumbsUp className='h-4 w-4' />
                  <span>{post.likes}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  <span>28</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className='relative aspect-video w-full sm:w-1/4'>
            {post.coverImageUrl && (
              <Image
                alt=''
                src={post.coverImageUrl}
                className='h-full w-full rounded-md object-cover'
                fill
              />
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}
