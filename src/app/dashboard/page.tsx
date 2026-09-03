"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useTransition } from "react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  dateDisplay?: string;
}

interface SavedBoard {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  dateDisplay?: string;
}

interface SavedTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "on_hold";
  priority: "urgent" | "high" | "medium" | "low";
}

// Paperly Origami Flight Logo
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

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Write it down. Written goals have a way of transforming into reality.",
  "Simplicity is the soul of efficiency.",
  "Small daily improvements over time lead to stunning results.",
  "Focus on being productive instead of busy.",
  "Your mind is for having ideas, not holding them.",
  "Creativity is intelligence having fun.",
  "Action is the foundational key to all success.",
  "Order and simplification are the first steps toward mastery.",
  "The best way to predict the future is to create it.",
  "Done is better than perfect.",
  "Discipline is choosing between what you want now and what you want most.",
  "Clarity precedes mastery.",
  "Great things are done by a series of small things brought together.",
  "Turn ideas into action, one sentence at a time.",
];

export default function DashboardPage() {
  const [, startTransition] = useTransition();
  const [documents, setDocuments] = useState<SavedDoc[]>([]);
  const [whiteboards, setWhiteboards] = useState<SavedBoard[]>([]);
  const [tasks, setTasks] = useState<SavedTask[]>([]);

  const [currentQuote, setCurrentQuote] = useState(() => motivationalQuotes[0]);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Load saved documents, whiteboards, and tasks from localStorage
  useEffect(() => {
    try {
      const docsRaw = localStorage.getItem("paperly_documents");
      const boardsRaw = localStorage.getItem("paperly_whiteboards");
      const tasksRaw = localStorage.getItem("paperly_kanban_tasks");

      startTransition(() => {
        if (docsRaw) {
          const parsed = JSON.parse(docsRaw);
          if (Array.isArray(parsed)) setDocuments(parsed);
        }
        if (boardsRaw) {
          const parsed = JSON.parse(boardsRaw);
          if (Array.isArray(parsed)) setWhiteboards(parsed);
        }
        if (tasksRaw) {
          const parsed = JSON.parse(tasksRaw);
          if (Array.isArray(parsed)) setTasks(parsed);
        }
      });
    } catch (e) {
      console.error("Failed to load dashboard data from localStorage", e);
    }
  }, []);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;

  const recentItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      snippet: string;
      type: "DOC" | "CANVAS";
      href: string;
      updatedAt: string;
    }> = [];

    documents.forEach((d) => {
      const plain = d.content
        ? d.content.replace(/[#*`_~[\]()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140)
        : "Empty document notes...";
      list.push({
        id: d.id,
        title: d.title || "Untitled Document",
        snippet: plain || "Rich text notes and outline...",
        type: "DOC",
        href: `/dashboard/document?id=${d.id}`,
        updatedAt: d.updatedAt || d.dateDisplay || "Recently",
      });
    });

    whiteboards.forEach((b) => {
      let snippet = "Infinite visual sketch canvas";
      try {
        const parsed = JSON.parse(b.content);
        if (parsed?.elements?.length) {
          snippet = `${parsed.elements.length} visual drawing element${parsed.elements.length === 1 ? "" : "s"} on canvas`;
        }
      } catch {}
      list.push({
        id: b.id,
        title: b.title || "Untitled Whiteboard",
        snippet,
        type: "CANVAS",
        href: `/dashboard/whiteboard?id=${b.id}`,
        updatedAt: b.updatedAt || b.dateDisplay || "Recently",
      });
    });

    return list.slice(0, 4);
  }, [documents, whiteboards]);

  // Typewriter effect animation
  useEffect(() => {
    let charIndex = 0;

    const interval = setInterval(() => {
      charIndex++;
      if (charIndex <= currentQuote.length) {
        setDisplayedText(currentQuote.slice(0, charIndex));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 26);

    return () => clearInterval(interval);
  }, [currentQuote]);

  const handleNextQuote = () => {
    const candidates = motivationalQuotes.filter((q) => q !== currentQuote);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || motivationalQuotes[0];
    setDisplayedText("");
    setIsTyping(true);
    setCurrentQuote(chosen);
  };

  return (
    <div className="h-screen bg-[#FAF7F2] text-[#2C2823] flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 px-6 sm:px-10 flex-shrink-0 flex items-center justify-center border-b border-[#EBE6DC] bg-[#FAF7F2]/90 backdrop-blur-xs z-30">
        <div className="w-full max-w-3xl flex items-center justify-between px-2 sm:px-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E0D5] flex items-center justify-center shadow-2xs group-hover:border-[#1E3A2B] transition-colors">
              <PaperlyLogo className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1C1E]">
              Paperly
            </span>
          </Link>

          {/* Clerk Auth Controls */}
          <div className="flex items-center gap-2.5">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-[10px] bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-xs font-semibold border border-[#E5E0D5] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border border-[#E5E0D5] shadow-xs",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </header>

      {/* Main Content Layout - Full Width & Viewport Constrained */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Left Side: Strictly Fixed Container (Icons + Category Feed Card) */}
        <aside className="flex gap-3.5 flex-shrink-0 lg:w-[355px] xl:w-[375px] w-full h-full select-none">
          {/* First Bar: Vertical Icon Strip Centered on Screen */}
          <div className="flex flex-col justify-center items-center gap-3 select-none flex-shrink-0 h-full">
            {/* Whiteboard Icon */}
            <Link
              href="/dashboard/whiteboard"
              title="Whiteboard"
              className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#007AFF] text-[#007AFF] flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </Link>

            {/* Document Icon */}
            <Link
              href="/dashboard/document"
              title="Document"
              className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#007AFF] text-[#007AFF] flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </Link>

            {/* Kanban Icon */}
            <Link
              href="/dashboard/kanban"
              title="Kanban Board"
              className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5856D6] text-[#5856D6] flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z" />
              </svg>
            </Link>

            {/* Study Space (4th Icon) */}
            <Link
              href="/dashboard/study"
              title="Study Space & PDF Reader"
              className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#1E3A2B] text-[#1E3A2B] flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </Link>
          </div>

          {/* Second Bar: Category Feed Card (height reduced by 3% with internal scroll) */}
          <div className="flex-1 bg-white border border-[#E5E0D5] rounded-2xl p-5 shadow-xs flex flex-col gap-6 h-[97%] max-h-[97%] overflow-y-auto">
            {/* Document Section */}
            <div className="space-y-2">
              <h2 className="font-serif text-base font-semibold text-[#1C1C1E] border-b border-[#F0ECE3] pb-1.5 flex items-center justify-between">
                <span>Document</span>
                <span className="text-[11px] font-sans font-normal text-[#918B80]">
                  {documents.length} {documents.length === 1 ? "file" : "files"}
                </span>
              </h2>
              {documents.length > 0 ? (
                <>
                  <ul className="space-y-1 text-xs text-[#555047]">
                    {documents.slice(0, 3).map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/dashboard/document?id=${doc.id}`}
                          className="hover:text-[#007AFF] hover:underline py-0.5 truncate group flex items-center justify-between gap-1"
                        >
                          <span className="truncate">{doc.title || "Untitled Document"}</span>
                          <span className="text-[10px] text-[#A09A8F] flex-shrink-0 group-hover:text-[#007AFF]">
                            {doc.updatedAt || doc.dateDisplay || ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/dashboard/document"
                      className="text-[11px] font-medium text-[#007AFF] hover:underline"
                    >
                      + New
                    </Link>
                    {documents.length > 3 && (
                      <Link
                        href="/dashboard/document"
                        className="text-[11px] font-medium text-[#007AFF] hover:underline"
                      >
                        more &rarr;
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-1 text-xs text-[#8E8E93]">
                  <span>No documents yet</span>
                  <div className="mt-1">
                    <Link href="/dashboard/document" className="text-[#007AFF] font-medium hover:underline text-[11px]">
                      + New Document
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Whiteboard Section */}
            <div className="space-y-2">
              <h2 className="font-serif text-base font-semibold text-[#1C1C1E] border-b border-[#F0ECE3] pb-1.5 flex items-center justify-between">
                <span>White board</span>
                <span className="text-[11px] font-sans font-normal text-[#918B80]">
                  {whiteboards.length} {whiteboards.length === 1 ? "board" : "boards"}
                </span>
              </h2>
              {whiteboards.length > 0 ? (
                <>
                  <ul className="space-y-1 text-xs text-[#555047]">
                    {whiteboards.slice(0, 3).map((board) => (
                      <li key={board.id}>
                        <Link
                          href={`/dashboard/whiteboard?id=${board.id}`}
                          className="hover:text-[#007AFF] hover:underline py-0.5 truncate group flex items-center justify-between gap-1"
                        >
                          <span className="truncate">{board.title || "Untitled Whiteboard"}</span>
                          <span className="text-[10px] text-[#A09A8F] flex-shrink-0 group-hover:text-[#007AFF]">
                            {board.updatedAt || board.dateDisplay || ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/dashboard/whiteboard"
                      className="text-[11px] font-medium text-[#007AFF] hover:underline"
                    >
                      + New
                    </Link>
                    {whiteboards.length > 3 && (
                      <Link
                        href="/dashboard/whiteboard"
                        className="text-[11px] font-medium text-[#007AFF] hover:underline"
                      >
                        more &rarr;
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-1 text-xs text-[#8E8E93]">
                  <span>No boards yet</span>
                  <div className="mt-1">
                    <Link href="/dashboard/whiteboard" className="text-[#007AFF] font-medium hover:underline text-[11px]">
                      + New Whiteboard
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Kanban Board Section */}
            <div className="space-y-2">
              <h2 className="font-serif text-base font-semibold text-[#1C1C1E] border-b border-[#F0ECE3] pb-1.5 flex items-center justify-between">
                <span>Kanban board</span>
                <span className="text-[11px] font-sans font-normal text-[#918B80]">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </h2>
              {tasks.length > 0 ? (
                <>
                  <ul className="space-y-1 text-xs text-[#555047]">
                    <li className="flex justify-between items-center py-0.5">
                      <span>Todo:</span>
                      <span className="font-mono font-medium text-[#736E65] bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[11px]">
                        {todoCount}
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span>In-Progress:</span>
                      <span className="font-mono font-medium text-[#1E3A2B] bg-[#E9EFE9] px-1.5 py-0.5 rounded text-[11px]">
                        {inProgressCount}
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span>Completed:</span>
                      <span className="font-mono font-medium text-[#736E65] bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[11px]">
                        {completedCount}
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span>Urgent:</span>
                      <span className="font-mono font-medium text-[#D75800] bg-[#FFF2E8] px-1.5 py-0.5 rounded text-[11px]">
                        {urgentCount}
                      </span>
                    </li>
                  </ul>
                  <div className="text-right pt-1">
                    <Link href="/dashboard/kanban" className="text-[11px] font-medium text-[#5856D6] hover:underline">
                      view board &rarr;
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-1 text-xs text-[#8E8E93]">
                  <span>No tasks yet</span>
                  <div className="mt-1">
                    <Link href="/dashboard/kanban" className="text-[#5856D6] font-medium hover:underline text-[11px]">
                      + Add Task
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Section */}
            <div className="space-y-2">
              <h2 className="font-serif text-base font-semibold text-[#1C1C1E] border-b border-[#F0ECE3] pb-1.5 flex items-center justify-between">
                <span>Calendar</span>
                <span className="text-[11px] font-sans font-normal text-[#918B80]">Today</span>
              </h2>
              <div className="py-1 text-xs text-[#8E8E93]">
                <span>No scheduled events</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Scrollable Workspace Content (Only this scrolls) */}
        <main className="flex-1 h-full overflow-y-auto flex flex-col gap-6 pr-1 pb-4">
          {/* Motivational Quote Header with Typewriter Effect */}
          <div
            onClick={handleNextQuote}
            title="Click to generate a new motivational quote"
            className="cursor-pointer group bg-white border border-[#E5E0D5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#1E3A2B]/40 transition-colors"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#9C968B] block mb-1">
              Daily Motivation
            </span>
            <p className="font-serif text-lg sm:text-xl text-[#1C1C1E] italic leading-relaxed min-h-[1.75rem]">
              &ldquo;{displayedText}&rdquo;
              {isTyping && (
                <span className="inline-block w-[2px] h-4 ml-1 bg-[#1E3A2B] animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* 4 Action Buttons Grid (2x2 Sleek Tiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create WhiteBoard */}
            <Link
              href="/dashboard/whiteboard"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-[#E5E0D5] bg-white hover:border-[#007AFF] hover:shadow-xs transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#E5F1FF] text-[#007AFF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors">
                    Create WhiteBoard
                  </h4>
                  <p className="text-[11px] text-[#8E877B] mt-0.5 font-sans">
                    Infinite visual canvas & sketches
                  </p>
                </div>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] text-[#8E877B] group-hover:text-[#007AFF] group-hover:border-[#007AFF] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </Link>

            {/* Create Document */}
            <Link
              href="/dashboard/document"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-[#E5E0D5] bg-white hover:border-[#007AFF] hover:shadow-xs transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E5E0D5] text-[#007AFF] flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors">
                    Create Document
                  </h4>
                  <p className="text-[11px] text-[#8E877B] mt-0.5 font-sans">
                    BlockNote rich text document
                  </p>
                </div>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] text-[#8E877B] group-hover:text-[#007AFF] group-hover:border-[#007AFF] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </Link>

            {/* Add Task */}
            <Link
              href="/dashboard/kanban"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-[#E5E0D5] bg-white hover:border-[#5856D6] hover:shadow-xs transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#F0EFFF] text-[#5856D6] flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold text-[#1C1C1E] group-hover:text-[#5856D6] transition-colors">
                    Add Task
                  </h4>
                  <p className="text-[11px] text-[#8E877B] mt-0.5 font-sans">
                    Kanban to-do & priorities
                  </p>
                </div>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] text-[#8E877B] group-hover:text-[#5856D6] group-hover:border-[#5856D6] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </Link>

            {/* Add Calendar */}
            <Link
              href="/dashboard/study"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-[#E5E0D5] bg-white hover:border-[#1E3A2B] hover:shadow-xs transition-all group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#E9EFE9] text-[#1E3A2B] flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold text-[#1C1C1E] group-hover:text-[#1E3A2B] transition-colors">
                    Study Space
                  </h4>
                  <p className="text-[11px] text-[#8E877B] mt-0.5 font-sans">
                    Read and study uploaded PDFs
                  </p>
                </div>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] text-[#8E877B] group-hover:text-[#1E3A2B] group-hover:border-[#1E3A2B] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Recent Workspace Items Grid or Empty Fresh State */}
          {recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E0D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-[#1E3A2B]/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-lg font-semibold text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                          item.type === "DOC"
                            ? "bg-[#E5F1FF] text-[#007AFF]"
                            : "bg-[#F0EFFF] text-[#5856D6]"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#736E65] leading-relaxed line-clamp-3 mb-6 font-sans">
                      {item.snippet}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#F5F2EC]">
                    <span className="text-[11px] font-mono text-[#8E877B]">
                      {item.updatedAt}
                    </span>
                    <Link
                      href={item.href}
                      className="px-4 py-1.5 rounded-xl border border-[#DFD9CE] hover:border-[#007AFF] hover:bg-[#007AFF] hover:text-white text-xs font-medium text-[#2C2823] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>open</span>
                      <span className="text-[11px]">&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D5] rounded-2xl p-8 sm:p-10 shadow-xs flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5E0D5] flex items-center justify-center text-[#1E3A2B] shadow-2xs mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1C1C1E] mb-1.5">
                Your Workspace is Fresh & Ready
              </h3>
              <p className="text-xs text-[#736E65] max-w-md mb-6 leading-relaxed">
                No documents, whiteboards, or tasks created yet. Choose a workspace above or click below to start building your second brain.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard/document"
                  className="px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
                >
                  + Create Document
                </Link>
                <Link
                  href="/dashboard/whiteboard"
                  className="px-4 py-2 rounded-[10px] bg-white border border-[#E5E0D5] hover:bg-[#F2F2F7] text-[#1C1C1E] text-xs font-semibold shadow-2xs transition-colors"
                >
                  + New Whiteboard
                </Link>
                <Link
                  href="/dashboard/kanban"
                  className="px-4 py-2 rounded-[10px] bg-[#F0EFFF] hover:bg-[#E2DEFF] text-[#5856D6] text-xs font-semibold transition-colors"
                >
                  + New Task
                </Link>
                <Link
                  href="/dashboard/study"
                  className="px-4 py-2 rounded-[10px] bg-[#E9EFE9] hover:bg-[#D5E3D5] text-[#1E3A2B] text-xs font-semibold transition-colors"
                >
                  Open Study Space
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
