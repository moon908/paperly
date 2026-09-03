"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

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

type WorkspaceTab = "notes" | "whiteboard" | "kanban" | "study";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("study");

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1E] flex flex-col font-sans selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E0D5] flex items-center justify-center shadow-2xs group-hover:border-[#1E3A2B] transition-colors">
              <PaperlyLogo className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1C1E]">
              Paperly
            </span>
          </Link>

          {/* Center Navigation Capsule */}
          <nav className="hidden md:flex items-center bg-[#F2F2F7] p-1 rounded-full border border-[#E5E0D5] shadow-2xs text-xs font-medium text-[#6E6E73]">
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full hover:text-[#1C1C1E] transition-colors"
            >
              Features
            </a>
            <a
              href="#preview"
              className="px-3.5 py-1.5 rounded-full hover:text-[#1C1C1E] transition-colors"
            >
              Workspaces
            </a>
            <a
              href="#study"
              className="px-3.5 py-1.5 rounded-full hover:text-[#1C1C1E] transition-colors"
            >
              Study Space
            </a>
            <a
              href="#why-paperly"
              className="px-3.5 py-1.5 rounded-full hover:text-[#1C1C1E] transition-colors"
            >
              Why Paperly
            </a>
          </nav>

          {/* Right Header: Clerk Auth Controls & Dashboard Entry */}
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
                  className="px-4 py-1.5 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  Get Started
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <span>&rarr;</span>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-[#E5E0D5] shadow-xs",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F2F7] border border-[#E5E0D5] mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
            <span className="text-xs font-medium text-[#1C1C1E]">
              Next-Gen Thinking & Study Workspace
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF] font-bold">
              v2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1C1E] leading-[1.15] mb-6">
            Where Notes, Whiteboards, Tasks & Study Meet.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto leading-relaxed mb-8">
            Paperly brings block-based rich notes, infinite visual canvases, agile 4-stage kanban boards, and a dedicated PDF study space into one distraction-free, elegant workspace.
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-[12px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-sm font-semibold shadow-xs transition-all hover:shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <span>Launch Paperly Free</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <a
              href="#preview"
              className="px-6 py-3 rounded-[12px] bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] text-sm font-semibold border border-[#E5E0D5] shadow-2xs transition-colors inline-flex items-center gap-2"
            >
              <span>Explore Workspaces</span>
              <span className="text-[#8E8E93]">&darr;</span>
            </a>
          </div>

          {/* Key Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8E8E93] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="text-[#34C759]">✓</span> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#34C759]">✓</span> Native PDF Reader
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#34C759]">✓</span> Infinite Excalidraw Canvas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#34C759]">✓</span> Fast Local & Cloud Sync
            </span>
          </div>
        </div>

        {/* 3. Interactive Tabbed Workspace Showcase */}
        <div id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white rounded-3xl border border-[#E5E0D5] shadow-xs p-3 sm:p-5">
            {/* Tab Selector Capsule */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE3] flex-wrap gap-3">
              <div className="inline-flex items-center bg-[#F2F2F7] p-1 rounded-xl border border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => setActiveTab("study")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === "study"
                      ? "bg-[#007AFF] text-white shadow-xs"
                      : "text-[#6E6E73] hover:text-[#1C1C1E]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span>Study Space</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("kanban")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === "kanban"
                      ? "bg-[#007AFF] text-white shadow-xs"
                      : "text-[#6E6E73] hover:text-[#1C1C1E]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z" />
                  </svg>
                  <span>Kanban Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("whiteboard")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === "whiteboard"
                      ? "bg-[#007AFF] text-white shadow-xs"
                      : "text-[#6E6E73] hover:text-[#1C1C1E]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  <span>Whiteboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === "notes"
                      ? "bg-[#007AFF] text-white shadow-xs"
                      : "text-[#6E6E73] hover:text-[#1C1C1E]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>Documents</span>
                </button>
              </div>

              {/* Direct Open Button */}
              <Link
                href={
                  activeTab === "study"
                    ? "/dashboard/study"
                    : activeTab === "kanban"
                    ? "/dashboard/kanban"
                    : activeTab === "whiteboard"
                    ? "/dashboard/whiteboard"
                    : "/dashboard/document"
                }
                className="text-xs font-semibold text-[#007AFF] hover:text-[#0066d6] inline-flex items-center gap-1"
              >
                <span>Open Live Workspace</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Showcase Stage Frame */}
            <div className="mt-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E0D5] p-4 sm:p-6 min-h-[380px] flex flex-col justify-center">
              {activeTab === "study" && (
                <div className="flex flex-col md:flex-row gap-4 h-full items-stretch">
                  {/* Mock Sidebar */}
                  <div className="w-full md:w-64 bg-white rounded-xl border border-[#E5E0D5] p-3 shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1C1E]">Files Uploaded</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF]">
                        Resizable
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-dashed border-[#007AFF]/40 bg-[#007AFF]/5 text-[11px] text-center text-[#007AFF] font-medium">
                      + Drop or upload PDF
                    </div>
                    <div className="p-2 rounded-lg bg-[#007AFF]/10 border border-[#007AFF] flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#D75800] text-white text-[9px] font-bold flex items-center justify-center">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate text-[#007AFF]">
                          Paperly_Study_Guide.pdf
                        </p>
                        <p className="text-[10px] text-[#8E8E93]">24.5 KB • Welcome</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock Reader Canvas */}
                  <div className="flex-1 bg-[#2C2C2E] rounded-xl overflow-hidden flex flex-col min-h-[260px] shadow-sm">
                    {/* Mock Half-size Toolbar */}
                    <div className="h-7 px-3 bg-[#1C1C1E] text-white flex items-center justify-between text-[10px] border-b border-[#3A3A3C]">
                      <span className="flex items-center gap-1.5 font-mono text-[#D1D1D6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                        Paperly_Study_Guide.pdf
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                          Half-size Bar
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#007AFF] text-white font-medium">
                          Download
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col justify-center max-w-lg mx-auto w-full text-[#1C1C1E]">
                      <h3 className="font-serif text-xl font-bold mb-2">Paperly Study Space</h3>
                      <p className="text-xs text-[#6E6E73] leading-relaxed mb-3">
                        Read textbooks, lecture notes, and research papers with zero distraction. Resize sidebars fluidly to maximize your focus viewport.
                      </p>
                      <div className="h-1.5 w-3/4 bg-[#E5E0D5] rounded-full mb-2" />
                      <div className="h-1.5 w-1/2 bg-[#E5E0D5] rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "kanban" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {/* To Do */}
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-3 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#007AFF]">To Do</span>
                      <span className="text-[10px] font-mono px-1.5 rounded bg-[#007AFF]/10 text-[#007AFF]">1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5]">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#5856D6]/10 text-[#5856D6] font-bold">RESEARCH</span>
                      <p className="text-xs font-semibold text-[#1C1C1E] mt-1">Review lecture slides</p>
                      <p className="text-[10px] text-[#8E8E93] mt-2">Sep 3 • Edit ✎</p>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-3 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#5856D6]">In Progress</span>
                      <span className="text-[10px] font-mono px-1.5 rounded bg-[#5856D6]/10 text-[#5856D6]">1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5]">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF] font-bold">PROJECT</span>
                      <p className="text-xs font-semibold text-[#1C1C1E] mt-1">Wireframe prototype</p>
                      <p className="text-[10px] text-[#8E8E93] mt-2">Sep 3 • Edit ✎</p>
                    </div>
                  </div>

                  {/* Done */}
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-3 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#34C759]">Done</span>
                      <span className="text-[10px] font-mono px-1.5 rounded bg-[#34C759]/10 text-[#34C759]">1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] opacity-75">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#34C759]/10 text-[#34C759] font-bold">COMPLETED</span>
                      <p className="text-xs font-semibold text-[#1C1C1E] mt-1 line-through">Setup workspace</p>
                      <p className="text-[10px] text-[#8E8E93] mt-2">Sep 3</p>
                    </div>
                  </div>

                  {/* On Hold */}
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-3 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#D75800]">On Hold</span>
                      <span className="text-[10px] font-mono px-1.5 rounded bg-[#D75800]/10 text-[#D75800]">1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5]">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D75800]/10 text-[#D75800] font-bold">WAITING</span>
                      <p className="text-xs font-semibold text-[#1C1C1E] mt-1">Chapter 4 review</p>
                      <p className="text-[10px] text-[#8E8E93] mt-2">Sep 3 • Edit ✎</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "whiteboard" && (
                <div className="h-full min-h-[260px] bg-white rounded-xl border border-[#E5E0D5] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1C1C1E_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                    <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#1C1C1E] mb-1">Infinite Excalidraw Canvas</h4>
                    <p className="text-xs text-[#6E6E73] mb-4">
                      Sketch system architectures, draw mind maps, link thoughts, and collaborate on visual ideas with persistent cloud saving.
                    </p>
                    <Link
                      href="/dashboard/whiteboard"
                      className="px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs"
                    >
                      Open Whiteboard Canvas
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="h-full min-h-[260px] bg-white rounded-xl border border-[#E5E0D5] p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F0ECE3]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                    <span className="text-xs font-bold text-[#1C1C1E]">Product Requirement Document</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#1C1C1E] mb-2">Block-Based Document Editor</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                    Type slash commands (<code className="bg-[#F2F2F7] px-1.5 py-0.5 rounded text-[#007AFF] font-mono">/</code>) to create headings, code snippets, checklists, and quotes with real-time formatting.
                  </p>
                  <Link
                    href="/dashboard/document"
                    className="self-start px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs"
                  >
                    Open Document Editor
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Bento Grid */}
      <section id="features" className="py-16 sm:py-20 border-t border-[#E5E0D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#007AFF]">
              Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1C1E] mt-2 mb-4">
              Designed for Deep Focus & Flow
            </h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed">
              Every tool in Paperly is crafted with clean lines, responsive shortcuts, and intentional minimalism so you spend less time configuring and more time doing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Study Space */}
            <div id="study" className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs hover:border-[#007AFF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1C1E] mb-2">Study Space & PDF Reader</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                  Drag and drop PDFs, organize course readings, toggle between half-size compact or full native toolbars, and resize sidebars on the fly.
                </p>
              </div>
              <Link
                href="/dashboard/study"
                className="text-xs font-semibold text-[#007AFF] hover:text-[#0066d6] inline-flex items-center gap-1"
              >
                <span>Try Study Space</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Feature 2: Kanban Board */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs hover:border-[#5856D6] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1C1E] mb-2">Agile Kanban Boards</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                  Structured 4-column task management (<span className="text-[#007AFF] font-medium">To Do</span>, <span className="text-[#5856D6] font-medium">In Progress</span>, <span className="text-[#34C759] font-medium">Done</span>, <span className="text-[#D75800] font-medium">On Hold</span>) with calendar date pickers and card editing.
                </p>
              </div>
              <Link
                href="/dashboard/kanban"
                className="text-xs font-semibold text-[#5856D6] hover:opacity-80 inline-flex items-center gap-1"
              >
                <span>Manage Tasks</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Feature 3: Whiteboard */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs hover:border-[#007AFF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1C1E] mb-2">Excalidraw Whiteboards</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                  Infinite digital canvas to brainstorm architectures, draw freehand diagrams, and connect complex ideas visually.
                </p>
              </div>
              <Link
                href="/dashboard/whiteboard"
                className="text-xs font-semibold text-[#007AFF] hover:text-[#0066d6] inline-flex items-center gap-1"
              >
                <span>Draw on Canvas</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Feature 4: Documents */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs hover:border-[#1E3A2B] transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1E3A2B]/10 text-[#1E3A2B] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1C1E] mb-2">Block-Based Notes</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                  Rich formatting, slash commands, callouts, and clean markdown exports for engineering specs and study summaries.
                </p>
              </div>
              <Link
                href="/dashboard/document"
                className="text-xs font-semibold text-[#1E3A2B] hover:opacity-80 inline-flex items-center gap-1"
              >
                <span>Write Documents</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Paperly Section */}
      <section id="why-paperly" className="py-16 sm:py-20 border-t border-[#E5E0D5] bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D75800]">
              The Difference
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1C1E] mt-2 mb-3">
              One Workspace Instead of Four Separate Apps
            </h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed">
              Stop switching between Notion, Miro, Trello, and a PDF viewer. Paperly consolidates your entire thinking cycle in one tab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs">
              <span className="font-mono text-xl font-bold text-[#007AFF]">01</span>
              <h4 className="font-serif text-base font-bold text-[#1C1C1E] mt-2 mb-1">Fast & Distraction-Free</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Lightweight Next.js 16 architecture with instant page transitions, top progress bar, and zero bloat.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs">
              <span className="font-mono text-xl font-bold text-[#5856D6]">02</span>
              <h4 className="font-serif text-base font-bold text-[#1C1C1E] mt-2 mb-1">Secure Clerk Authentication</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Enterprise-grade security, instant sign-in, user profiles, and organization management baked right in.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-2xs">
              <span className="font-mono text-xl font-bold text-[#D75800]">03</span>
              <h4 className="font-serif text-base font-bold text-[#1C1C1E] mt-2 mb-1">Unified Study & Task Loop</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Read lecture notes in Study Space, outline ideas on Whiteboard, and track progress on Kanban seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-16 sm:py-20 border-t border-[#E5E0D5] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#1E3A2B] to-[#162C20] text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-xs border border-white/15">
                <PaperlyLogo className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Ready to transform how you think and study?
              </h2>
              <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed mb-6">
                Join thousands of students, researchers, and creators building their second brain in Paperly today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-[12px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-sm font-semibold shadow-xs transition-transform active:scale-95"
                >
                  Enter Dashboard Now &rarr;
                </Link>
                <Link
                  href="/dashboard/study"
                  className="px-6 py-3 rounded-[12px] bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors"
                >
                  Try Study Space
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#E5E0D5] bg-[#FAF7F2] py-10 text-xs text-[#8E8E93]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PaperlyLogo className="w-4 h-4" />
            <span className="font-serif font-bold text-[#1C1C1E]">Paperly</span>
            <span>•</span>
            <span>Simple, elegant workspace for thinkers & learners.</span>
          </div>

          <div className="flex items-center gap-4 text-[#6E6E73]">
            <Link href="/dashboard" className="hover:text-[#007AFF] transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/study" className="hover:text-[#007AFF] transition-colors">
              Study Space
            </Link>
            <Link href="/dashboard/kanban" className="hover:text-[#007AFF] transition-colors">
              Kanban
            </Link>
            <Link href="/dashboard/whiteboard" className="hover:text-[#007AFF] transition-colors">
              Whiteboard
            </Link>
            <Link href="/dashboard/document" className="hover:text-[#007AFF] transition-colors">
              Documents
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
