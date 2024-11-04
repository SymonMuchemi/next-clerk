'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { JSONContent } from 'novel'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'

import { newPostSchema } from '@/lib/schemas'
import { createSlugFromName } from '@/lib/utils'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Editor from '@/components/editor/editor'
import { Spinner } from '@/components/ui/spinner'
import ImageUploader from '@/components/image-uploader'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

type Inputs = z.infer<typeof newPostSchema>

export default function NewPostForm() {
  const createPost = useMutation(api.posts.createPost)
  const router = useRouter()

  const [filePickerIsOpen, setFilePickerIsOpen] = useState(false)

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Inputs>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {}
  })

  function setCoverImageId(url: string) {
    setValue('coverImageId', url)
    setFilePickerIsOpen(false)
  }

  function setContent(content: JSONContent) {
    setValue('content', content, { shouldValidate: true })
  }

  const title = watch('title')
  useEffect(() => {
    if (title) {
      const slug = createSlugFromName(title)

      if (slug) {
        setValue('slug', slug, { shouldValidate: true })
      }
    }
  }, [title])

  const processForm: SubmitHandler<Inputs> = async data => {
    const contentJson = data.content
    const hasContent = contentJson?.content?.some(
      c => c.content && c.content.length > 0
    )

    if (!hasContent) {
      toast.error('Please add some content to the post')
      return
    }

    try {
      const postSlug = await createPost({
        ...data,
        coverImageId: data.coverImageId as Id<'_storage'> | undefined,
        content: JSON.stringify(contentJson)
      })

      if (!postSlug) throw new Error('Failed to create post')

      router.push(`/posts/${postSlug}`)
      toast.success('Post created!')
    } catch (error) {
      toast.error('Failed to create post')
    }
  }
  return (
    <form onSubmit={handleSubmit(processForm)}>
      <div className='flex flex-col gap-4'>
        {/* Cover image */}
        <div className='flex justify-between gap-4'>
          <div className='w-full'>
            <Input
              disabled
              type='text'
              className='w-full'
              placeholder='Select a cover image'
              {...register('coverImageId')}
            />
            {errors.coverImageId?.message && (
              <p className='mt-1 px-2 text-xs text-red-400'>
                {errors.coverImageId.message}
              </p>
            )}
          </div>
          <Dialog open={filePickerIsOpen} onOpenChange={setFilePickerIsOpen}>
            <DialogTrigger asChild>
              <Button size='sm'>Select file</Button>
            </DialogTrigger>
            <DialogContent>
              <ImageUploader setImageId={setCoverImageId} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Title and slug */}
        <div className='flex flex-col justify-between gap-4 sm:flex-row'>
          <div className='flex-1'>
            <Input
              type='text'
              placeholder='Post title'
              {...register('title')}
            />
            {errors.title?.message && (
              <p className='mt-1 px-2 text-xs text-red-400'>
                {errors.title.message}
              </p>
            )}
          </div>
          <div className='flex-1'>
            <Input type='text' placeholder='Post slug' {...register('slug')} />
            {errors.slug?.message && (
              <p className='mt-1 px-2 text-xs text-red-400'>
                {errors.slug.message}
              </p>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Input
            type='text'
            placeholder='Post excerpt'
            {...register('excerpt')}
          />
          {errors.excerpt?.message && (
            <p className='mt-1 px-2 text-xs text-red-400'>
              {errors.excerpt.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <Editor editable={true} setContent={setContent} />
        </div>

        <div>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full sm:w-1/2'
          >
            {isSubmitting ? (
              <>
                <Spinner className='mr-2' />
                <span>Creating post...</span>
              </>
            ) : (
              'Create post'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
