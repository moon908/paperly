"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BlockNoteEditor = dynamic(
  () => import("@/components/BlockNoteEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-[#8E8E93] animate-pulse">
        Loading document editor...
      </div>
    ),
  }
);

interface DocumentNote {
  id: string;
  title: string;
  dateDisplay: string;
  updatedAt: string;
  content: string;
}

function PaperlyLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="17,18 19,25 13,23" fill="#B2ABA0" />
      <polygon
        points="28,4 4,14 17,18"
        fill="#1E3A2B"
        stroke="#162C20"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <polygon
        points="28,4 17,18 20,28"
        fill="#2E553F"
        stroke="#162C20"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <line x1="28" y1="4" x2="17" y2="18" stroke="#3E6B52" strokeWidth="0.5" />
    </svg>
  );
}

const initialDocs: DocumentNote[] = [];

export default function DocumentPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [docs, setDocs] = useState<DocumentNote[]>(initialDocs);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const activeDoc = docs.find((d) => d.id === selectedId) || docs[0];

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

  const wordCount = activeDoc?.content
    ? activeDoc.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  useGSAP(
    () => {
      if (editorRef.current) {
        gsap.fromTo(
          editorRef.current,
          { opacity: 0.85, y: 4 },
          { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
        );
      }
    },
    { dependencies: [selectedId] }
  );

  const startResizing = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 220), 520);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleTitleChange = (newTitle: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === selectedId ? { ...d, title: newTitle } : d))
    );
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      setDocs((prev) =>
        prev.map((d) => {
          if (d.id === selectedId) {
            if (d.content === newContent) return d;
            return { ...d, content: newContent };
          }
          return d;
        })
      );
    },
    [selectedId]
  );

  const handleCreateDoc = () => {
    const newId = `doc-${Date.now()}`;
    const newDoc: DocumentNote = {
      id: newId,
      title: "Untitled Document",
      dateDisplay: "TODAY",
      updatedAt: "Just now",
      content: "",
    };
    setDocs([newDoc, ...docs]);
    setSelectedId(newId);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = docs.filter((d) => d.id !== id);
    setDocs(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id || "");
    }
  };

  return (
    <div
      className={`flex h-screen w-full bg-[#FAF7F2] text-[#1C1C1E] selection:bg-[#E2DDD3] overflow-hidden font-sans ${
        isResizing ? "select-none cursor-col-resize" : ""
      }`}
    >
      {/* Left Sidebar */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="relative flex-shrink-0 flex flex-col justify-between border-r border-[#E5E0D5] bg-[#FAF7F2] px-5 py-5 select-none transition-[width] duration-75"
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={() => setSidebarWidth(300)}
          title="Drag to resize sidebar (double-click to reset)"
          className="absolute right-0 top-0 bottom-0 w-2 -mr-1 cursor-col-resize group z-20 flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
        >
          <div className="w-[2px] h-8 bg-[#D4CEBF] group-hover:bg-[#007AFF] group-hover:h-12 transition-all rounded-full" />
        </div>

        {/* Top Header & List */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Back to Dashboard & Paperly Branding */}
          <div className="flex items-center justify-between pb-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-[#1C1C1E] hover:opacity-80 transition-opacity"
              title="Return to Dashboard"
            >
              <PaperlyLogo className="w-6 h-6 flex-shrink-0" />
              <span className="font-serif text-xl font-bold tracking-tight">Paperly</span>
              <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
                Docs
              </span>
            </Link>

            {/* Create Document Button */}
            <button
              onClick={handleCreateDoc}
              aria-label="New Document"
              title="New Document"
              className="w-7 h-7 rounded-[8px] bg-[#007AFF] hover:bg-[#0066d6] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>

          {/* Mode Switcher Capsule */}
          <div className="flex items-center bg-[#F2F2F7] p-1 rounded-xl mb-4 border border-[#E5E0D5]">
            <span className="flex-1 py-1 text-center text-xs font-semibold rounded-lg bg-[#007AFF] text-white shadow-xs flex items-center justify-center gap-1.5 cursor-default">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Document
            </span>
            <Link
              href="/dashboard/whiteboard"
              className="flex-1 py-1 text-center text-xs font-medium rounded-lg text-[#6E6E73] hover:text-[#1C1C1E] transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Whiteboard
            </Link>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full h-9 pl-3 pr-3 bg-[#F2F2F7] text-[#1C1C1E] placeholder-[#8E8E93] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
          </div>

          {/* Docs List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
            {filteredDocs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8E8E93] border-2 border-dashed border-[#E5E0D5] rounded-xl p-4">
                <span>No documents found</span>
                <button
                  type="button"
                  onClick={handleCreateDoc}
                  className="mt-2 text-[#007AFF] font-medium hover:underline block mx-auto cursor-pointer"
                >
                  + Create a document
                </button>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = doc.id === selectedId;
                const excerpt =
                  doc.content.replace(/^#+\s+/gm, "").trim() || "Empty document...";

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedId(doc.id)}
                    className={`group rounded-xl p-2.5 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#E5F1FF] text-[#1C1C1E] border border-[#B3D7FF]"
                        : "hover:bg-[#F2EFE8] text-[#4A453E] border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`mt-0.5 flex-shrink-0 ${
                          isSelected ? "text-[#007AFF]" : "text-[#736E65]"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                      </span>

                      <div className="flex-1 min-w-0">
                        <h2
                          className={`text-xs font-semibold leading-tight truncate ${
                            isSelected ? "text-[#007AFF]" : "text-[#2E2A24]"
                          }`}
                        >
                          {doc.title}
                        </h2>
                        <div className="text-[10px] text-[#8E8E93] mt-0.5">
                          {doc.updatedAt}
                        </div>
                        <p className="text-[10px] text-[#8E8E93] truncate mt-0.5">
                          {excerpt}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      title="Delete Document"
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 text-[#8E8E93] p-1 rounded transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between font-mono text-[11px] text-[#8E8E93]">
          <span>{docs.length} {docs.length === 1 ? "document" : "documents"}</span>
          <Link
            href="/dashboard"
            className="text-[11px] text-[#007AFF] hover:underline flex items-center gap-1 font-sans"
          >
            &larr; Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Document Editor Area */}
      <main className="flex-1 flex flex-col bg-[#FAF7F2] overflow-hidden">
        <div ref={editorRef} className="flex-1 flex flex-col w-full h-full p-4 sm:p-5 overflow-hidden">
          {activeDoc ? (
            <>
              {/* Title & Word Count Bar */}
              <div className="flex items-center justify-between pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  <input
                    type="text"
                    value={activeDoc.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full font-serif text-2xl sm:text-3xl text-[#1C1C1E] bg-transparent border-0 focus:outline-none placeholder-[#8E8E93] tracking-tight font-semibold"
                    placeholder="Document title..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#8E8E93] select-none">
                    {activeDoc.dateDisplay}&nbsp;&nbsp;&bull;&nbsp;&nbsp;{wordCount} words
                  </span>
                </div>
              </div>

              {/* Maximized Document Editor Card */}
              <div className="flex-1 w-full h-full min-h-0 overflow-y-auto rounded-2xl border border-[#E5E0D5] bg-white py-4 shadow-xs">
                <BlockNoteEditor
                  key={activeDoc.id}
                  initialContent={activeDoc.content}
                  onChange={handleContentChange}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-center text-[#007AFF] shadow-2xs mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1C1E] mb-1">
                No Document Selected
              </h3>
              <p className="text-xs text-[#736E65] max-w-sm mb-5 leading-relaxed">
                Create a new document to start drafting notes, architecture specs, or summaries.
              </p>
              <button
                type="button"
                onClick={handleCreateDoc}
                className="px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create New Document</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
