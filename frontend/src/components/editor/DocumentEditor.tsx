import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { editorExtensions } from "./editor-extensions";

export function DocumentEditor({
  content,
  onChange,
}: {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: editorExtensions,
    content,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        "aria-label": "Document content",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor)
    return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  return (
    <>
      <EditorToolbar editor={editor} />
      <div className="editor-content mx-auto my-8 min-h-[70vh] w-full max-w-[850px] border border-line bg-white shadow-[0_8px_35px_rgba(32,48,38,0.08)]">
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
