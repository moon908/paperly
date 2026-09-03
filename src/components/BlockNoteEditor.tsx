"use client";

import { useEffect, useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@mantine/core/styles.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface DocEditorProps {
  initialContent: string;
  onChange: (markdown: string) => void;
}

export default function DocEditor({ initialContent, onChange }: DocEditorProps) {
  const [initialBlocks, setInitialBlocks] = useState<PartialBlock[] | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function parse() {
      try {
        const temp = BlockNoteEditor.create();
        const blocks = await temp.tryParseMarkdownToBlocks(initialContent || "");
        if (isMounted) {
          setInitialBlocks(blocks);
          setReady(true);
        }
      } catch {
        if (isMounted) {
          setInitialBlocks(undefined);
          setReady(true);
        }
      }
    }
    parse();
    return () => {
      isMounted = false;
    };
  }, [initialContent]);

  if (!ready) {
    return (
      <div className="py-6 text-sm text-[#9E988D] animate-pulse">
        Loading editor...
      </div>
    );
  }

  return <EditorInner initialBlocks={initialBlocks} onChange={onChange} />;
}

function EditorInner({
  initialBlocks,
  onChange,
}: {
  initialBlocks?: PartialBlock[];
  onChange: (markdown: string) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: initialBlocks && initialBlocks.length > 0 ? initialBlocks : undefined,
  });

  return (
    <div className="w-full h-full min-h-[400px]">
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={async () => {
          const md = await editor.blocksToMarkdownLossy(editor.document);
          onChange(md);
        }}
      />
    </div>
  );
}
