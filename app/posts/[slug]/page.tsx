import Post from '@/components/post'

export default function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  return <Post slug={slug} />
}
