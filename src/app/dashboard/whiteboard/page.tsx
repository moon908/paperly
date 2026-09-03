"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useMemo, useEffect, useCallback, useTransition } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const WhiteboardEditor = dynamic(
  () => import("@/components/WhiteboardEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-[#8E8E93] animate-pulse">
        Loading whiteboard canvas...
      </div>
    ),
  }
);

interface Whiteboard {
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

const initialBoards: Whiteboard[] = [];

export default function WhiteboardPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [, startTransition] = useTransition();
  const [boards, setBoards] = useState<Whiteboard[]>(initialBoards);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // 1. Load boards from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("paperly_whiteboards");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const targetId = urlParams.get("id");
          const found = targetId ? parsed.find((b: Whiteboard) => b.id === targetId) : null;

          startTransition(() => {
            setBoards(parsed);
            setSelectedId(found ? found.id : parsed[0].id);
          });
        }
      }
    } catch (e) {
      console.error("Failed to load whiteboards from localStorage", e);
    }
  }, []);

  // 2. Automatic debounced persistence to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("paperly_whiteboards", JSON.stringify(boards));
        setSaveStatus("saved");
      } catch (e) {
        console.error("Failed to autosave whiteboards", e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [boards]);

  // 3. Ctrl+S / Cmd+S manual save shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        try {
          localStorage.setItem("paperly_whiteboards", JSON.stringify(boards));
          setSaveStatus("saved");
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [boards]);

  const activeBoard = boards.find((b) => b.id === selectedId) || boards[0];

  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase();
    return boards.filter((b) => b.title.toLowerCase().includes(q));
  }, [boards, searchQuery]);

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
    setBoards((prev) =>
      prev.map((b) =>
        b.id === selectedId
          ? { ...b, title: newTitle, updatedAt: "Just now" }
          : b
      )
    );
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      setBoards((prev) =>
        prev.map((b) => {
          if (b.id === selectedId) {
            if (b.content === newContent) return b;
            return { ...b, content: newContent, updatedAt: "Just now" };
          }
          return b;
        })
      );
    },
    [selectedId]
  );

  const handleCreateBoard = () => {
    const newId = `board-${Date.now()}`;
    const newBoard: Whiteboard = {
      id: newId,
      title: "Untitled Whiteboard",
      dateDisplay: "TODAY",
      updatedAt: "Just now",
      content: `{"elements":[]}`,
    };
    const updated = [newBoard, ...boards];
    setBoards(updated);
    setSelectedId(newId);
    try {
      localStorage.setItem("paperly_whiteboards", JSON.stringify(updated));
      setSaveStatus("saved");
    } catch {}
  };

  const handleDeleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = boards.filter((b) => b.id !== id);
    setBoards(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id || "");
    }
    try {
      localStorage.setItem("paperly_whiteboards", JSON.stringify(remaining));
      setSaveStatus("saved");
    } catch {}
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

        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D5]">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E0D5] flex items-center justify-center shadow-2xs group-hover:border-[#1E3A2B] transition-colors">
                <PaperlyLogo className="w-4.5 h-4.5" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#1C1C1E]">
                Paperly
              </span>
            </Link>

            <button
              onClick={handleCreateBoard}
              title="New Whiteboard"
              className="px-2.5 py-1.5 rounded-[8px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>New</span>
            </button>
          </div>

          {/* Mode Switcher Pill */}
          <div className="py-3 flex items-center justify-center">
            <div className="inline-flex p-1 bg-[#EBE7DF] rounded-full text-xs font-medium text-[#736E65]">
              <Link
                href="/dashboard/document"
                className="px-3 py-1 rounded-full hover:text-[#1C1C1E] transition-colors"
              >
                Document
              </Link>
              <span className="px-3 py-1 rounded-full bg-[#007AFF] text-white shadow-xs font-semibold">
                Whiteboard
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search whiteboards..."
              className="w-full h-9 pl-3 pr-3 bg-[#F2F2F7] text-[#1C1C1E] placeholder-[#8E8E93] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
          </div>

          {/* Boards List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
            {filteredBoards.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8E8E93] border-2 border-dashed border-[#E5E0D5] rounded-xl p-4">
                <span>No whiteboards found</span>
                <button
                  type="button"
                  onClick={handleCreateBoard}
                  className="mt-2 text-[#007AFF] font-medium hover:underline block mx-auto cursor-pointer"
                >
                  + Create a whiteboard
                </button>
              </div>
            ) : (
              filteredBoards.map((board) => {
                const isSelected = board.id === selectedId;

                return (
                  <div
                    key={board.id}
                    onClick={() => setSelectedId(board.id)}
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
                            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                          />
                        </svg>
                      </span>

                      <div className="flex-1 min-w-0">
                        <h2
                          className={`text-xs font-semibold leading-tight truncate ${
                            isSelected ? "text-[#007AFF]" : "text-[#2E2A24]"
                          }`}
                        >
                          {board.title}
                        </h2>
                        <div className="text-[10px] text-[#8E8E93] mt-0.5">
                          {board.updatedAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      title="Delete Board"
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
          <span>{boards.length} {boards.length === 1 ? "board" : "boards"}</span>
          <Link
            href="/dashboard"
            className="text-[11px] text-[#007AFF] hover:underline flex items-center gap-1 font-sans"
          >
            &larr; Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col bg-[#FAF7F2] overflow-hidden">
        <div ref={editorRef} className="flex-1 flex flex-col w-full h-full p-4 sm:p-5 overflow-hidden">
          {activeBoard ? (
            <>
              {/* Title & Date Bar */}
              <div className="flex items-center justify-between pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  <input
                    type="text"
                    value={activeBoard.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full font-serif text-2xl sm:text-3xl text-[#1C1C1E] bg-transparent border-0 focus:outline-none placeholder-[#8E8E93] tracking-tight font-semibold"
                    placeholder="Whiteboard title..."
                  />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Autosave Status Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E5E0D5] text-[11px] font-mono shadow-2xs select-none">
                    {saveStatus === "saving" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D75800] animate-pulse" />
                        <span className="text-[#D75800] font-medium">Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                        <span className="text-[#6E6E73]">Saved</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#8E8E93] select-none hidden sm:inline">
                    {activeBoard.dateDisplay}
                  </span>
                </div>
              </div>

              {/* Maximized Whiteboard Canvas */}
              <div className="flex-1 w-full h-full min-h-0">
                <WhiteboardEditor
                  key={activeBoard.id}
                  initialData={activeBoard.content}
                  onChange={handleContentChange}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-center text-[#5856D6] shadow-2xs mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1C1E] mb-1">
                No Whiteboard Selected
              </h3>
              <p className="text-xs text-[#736E65] max-w-sm mb-5 leading-relaxed">
                Create a new infinite canvas to start brainstorming diagrams and wireframes.
              </p>
              <button
                type="button"
                onClick={handleCreateBoard}
                className="px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create New Whiteboard</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
