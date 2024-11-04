'use client'

import { useEffect, useState } from 'react'
// import { useDebouncedCallback } from 'use-debounce'

import { cn } from '@/lib/utils'
import { Post } from '@/lib/types'

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent
} from 'novel'

import { ImageResizer, handleCommandNavigation } from 'novel/extensions'
import { handleImageDrop, handleImagePaste } from 'novel/plugins'

import {
  slashCommand,
  suggestionItems
} from '@/components/editor/slash-command'
import EditorMenu from '@/components/editor/editor-menu'
import { uploadFn } from '@/components/editor/image-upload'
import { defaultExtensions } from '@/components/editor/extensions'
import { TextButtons } from '@/components/editor/selectors/text-buttons'
import { LinkSelector } from '@/components/editor/selectors/link-selector'
import { NodeSelector } from '@/components/editor/selectors/node-selector'
import { MathSelector } from '@/components/editor/selectors/math-selector'
import { ColorSelector } from '@/components/editor/selectors/color-selector'

import { Separator } from '@/components/ui/separator'

const hljs = require('highlight.js')

const extensions = [...defaultExtensions, slashCommand]

export const defaultEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: []
    }
  ]
}

interface EditorProps {
  post?: Post
  editable?: boolean
  setContent?: (content: JSONContent) => void
}

export default function Editor({
  post,
  editable = true,
  setContent
}: EditorProps) {
  // const [initialContent, setInitialContent] = useState<null | JSONContent>(null)
  const [saveStatus, setSaveStatus] = useState('Saved')
  const [charsCount, setCharsCount] = useState()

  const [openNode, setOpenNode] = useState(false)
  const [openColor, setOpenColor] = useState(false)
  const [openLink, setOpenLink] = useState(false)
  const [openAI, setOpenAI] = useState(false)

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, 'text/html')
    doc.querySelectorAll('pre code').forEach(el => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el)
    })
    return new XMLSerializer().serializeToString(doc)
  }

  const initialContent = post?.content
    ? JSON.parse(post.content)
    : defaultEditorContent

  // const debouncedUpdates = useDebouncedCallback(
  //   async (editor: EditorInstance) => {
  //     const json = editor.getJSON()
  //     setCharsCount(editor.storage.characterCount.words())
  //     window.localStorage.setItem(
  //       `${lesson.id}-html-content`,
  //       highlightCodeblocks(editor.getHTML())
  //     )
  //     window.localStorage.setItem(
  //       `${lesson.id}-novel-content`,
  //       JSON.stringify(json)
  //     )
  //     window.localStorage.setItem(
  //       `${lesson.id}-markdown`,
  //       editor.storage.markdown.getMarkdown()
  //     )
  //     setSaveStatus('Saved')
  //   },
  //   500
  // )

  // useEffect(() => {
  //   const content = window.localStorage.getItem(`${lesson.id}-novel-content`)
  //   if (content) setInitialContent(JSON.parse(content))
  //   else setInitialContent(defaultEditorContent)
  // }, [])

  if (!initialContent) return null

  return (
    <div className='relative w-full max-w-screen-lg'>
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          initialContent={initialContent}
          extensions={extensions}
          className={cn(
            'relative w-full max-w-screen-lg bg-background',
            editable
              ? 'h-[450px] overflow-scroll rounded-md border border-input shadow-sm'
              : 'min-h-[500px]'
          )}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event)
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: `prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full ${editable ? 'cursor-text text-sm' : 'cursor-default !p-0'}`
            }
          }}
          onUpdate={({ editor }) => {
            // debouncedUpdates(editor)
            setSaveStatus('Unsaved')
            if (setContent) setContent(editor.getJSON())
          }}
          onCreate={({ editor }) => {
            if (!editable) editor.setEditable(editable)
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className='z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all'>
            <EditorCommandEmpty className='px-2 text-muted-foreground'>
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map(item => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={val => item.command?.(val)}
                  className='flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent'
                  key={item.title}
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background'>
                    {item.icon}
                  </div>
                  <div>
                    <p className='font-medium'>{item.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorMenu open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation='vertical' />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />

            <Separator orientation='vertical' />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />

            <Separator orientation='vertical' />
            <MathSelector />

            <Separator orientation='vertical' />
            <TextButtons />

            <Separator orientation='vertical' />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorMenu>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
