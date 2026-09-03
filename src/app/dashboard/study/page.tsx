"use client";

import React, { useState, useRef, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { savePdfBlob, getPdfBlob, deletePdfBlob } from "@/lib/pdfStorage";

interface UploadedPdf {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url: string;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudyPage() {
  const [, startTransition] = useTransition();
  const [files, setFiles] = useState<UploadedPdf[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showNativeBar, setShowNativeBar] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(330);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Rehydrate stored PDF files from IndexedDB and metadata from localStorage
  useEffect(() => {
    async function loadStoredFiles() {
      try {
        const raw = localStorage.getItem("paperly_study_files");
        if (raw) {
          const parsed: Array<{ id: string; name: string; size: string; uploadedAt: string }> = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const loaded: UploadedPdf[] = [];
            for (const item of parsed) {
              const blob = await getPdfBlob(item.id);
              if (blob) {
                loaded.push({
                  ...item,
                  url: URL.createObjectURL(blob),
                });
              }
            }

            if (loaded.length > 0) {
              const urlParams = new URLSearchParams(window.location.search);
              const targetId = urlParams.get("id");
              const match = targetId ? loaded.find((f) => f.id === targetId) : null;

              startTransition(() => {
                setFiles(loaded);
                setActiveFileId(match ? match.id : loaded[0].id);
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to load study files", e);
      }
    }
    loadStoredFiles();
  }, []);

  const startResizing = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX - 16, 240), 600);
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

  // Handle file uploads with IndexedDB persistence
  const handleUploadFiles = async (uploadedList: FileList | null) => {
    if (!uploadedList || uploadedList.length === 0) return;

    const newEntries: UploadedPdf[] = [];
    const now = new Date();
    const timeString = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    for (const file of Array.from(uploadedList)) {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const fileId = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await savePdfBlob(fileId, file);
        const objectUrl = URL.createObjectURL(file);
        newEntries.push({
          id: fileId,
          name: file.name,
          size: formatFileSize(file.size),
          uploadedAt: timeString,
          url: objectUrl,
        });
      }
    }

    if (newEntries.length > 0) {
      setFiles((prev) => {
        const combined = [...newEntries, ...prev];
        try {
          localStorage.setItem(
            "paperly_study_files",
            JSON.stringify(
              combined.map((f) => ({
                id: f.id,
                name: f.name,
                size: f.size,
                uploadedAt: f.uploadedAt,
              }))
            )
          );
        } catch {}
        return combined;
      });
      setActiveFileId(newEntries[0].id);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePdfBlob(id);
    const fileToDelete = files.find((f) => f.id === id);
    if (fileToDelete && fileToDelete.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToDelete.url);
    }

    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    try {
      localStorage.setItem(
        "paperly_study_files",
        JSON.stringify(
          remaining.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            uploadedAt: f.uploadedAt,
          }))
        )
      );
    } catch {}

    if (activeFileId === id) {
      setActiveFileId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div
      className={`h-screen w-screen bg-[#FAF7F2] text-[#1C1C1E] p-3 sm:p-4 md:p-5 flex gap-3.5 sm:gap-4 overflow-hidden font-sans ${
        isResizing ? "select-none cursor-col-resize" : "select-none"
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleUploadFiles(e.target.files)}
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
      />

      {/* Left Column: Resizable container with "Paperly" at top and "files uploaded" inner container */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="relative flex-shrink-0 bg-white rounded-2xl sm:rounded-3xl border border-[#E5E0D5] p-3.5 sm:p-4 flex flex-col h-full shadow-2xs transition-[width] duration-75"
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={() => setSidebarWidth(330)}
          title="Drag to resize sidebar (double-click to reset)"
          className="absolute right-0 top-0 bottom-0 w-3 -mr-1.5 cursor-col-resize group z-20 flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
        >
          <div className="w-[3px] h-8 bg-[#D4CEBF] group-hover:bg-[#007AFF] group-hover:h-12 transition-all rounded-full" />
        </div>
        {/* Top Header: Paperly Logo & Link */}
        <div className="flex items-center justify-between pb-3 px-1 border-b border-[#F0ECE3] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E5E0D5] flex items-center justify-center shadow-2xs group-hover:border-[#1E3A2B] transition-colors">
              <PaperlyLogo className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1C1C1E]">
                Paperly
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#1E3A2B]/10 text-[#1E3A2B]">
                Study
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs font-medium text-[#6E6E73] hover:text-[#007AFF] px-2 py-1 rounded-lg hover:bg-[#F2F2F7] transition-colors"
          >
            &larr; Dashboard
          </Link>
        </div>

        {/* Inner Container: files uploaded (as drawn in wireframe) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-1 mt-3 bg-[#FAF7F2] rounded-xl sm:rounded-2xl border ${
            isDragging ? "border-[#007AFF] bg-[#E5F1FF]/30" : "border-[#E5E0D5]"
          } p-3 flex flex-col min-h-0 transition-colors`}
        >
          {/* Header of Files Uploaded with Upload Action Button */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E0D5] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1E3A2B]" />
              <h2 className="font-serif text-xs font-semibold text-[#1C1C1E]">
                Files Uploaded
              </h2>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-[#1E3A2B]/10 text-[#1E3A2B]">
                {files.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-[11px] font-semibold shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Upload</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="mt-2.5 relative flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 text-[#8E8E93] absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full h-7.5 pl-7.5 pr-2.5 bg-white text-[#1C1C1E] placeholder-[#8E8E93] rounded-[8px] text-[11px] border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
          </div>

          {/* Drag & Drop Target / Upload trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 p-2 border border-dashed border-[#D2CCC0] hover:border-[#007AFF] rounded-lg flex items-center justify-center gap-1.5 text-[11px] text-[#6E6E73] hover:text-[#007AFF] bg-white hover:bg-[#F0EFFF] transition-all cursor-pointer flex-shrink-0 text-center"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="font-medium truncate">Drop or click to upload PDF</span>
          </div>

          {/* Uploaded Files Scroll List */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-0.5">
            {filteredFiles.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-[11px] text-[#8E8E93] p-2">
                <span>No PDF files match your search</span>
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isActive
                        ? "bg-white border-[#007AFF] shadow-2xs ring-1 ring-[#007AFF]/20"
                        : "bg-white/80 border-[#E5E0D5] hover:border-[#8E8E93]/60 hover:bg-white"
                    }`}
                  >
                    {/* PDF Icon Badge */}
                    <div
                      className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#D75800] text-white shadow-2xs"
                          : "bg-[#FFF2E8] text-[#D75800] border border-[#FCD8BE]"
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold tracking-tight">PDF</span>
                    </div>

                    {/* File Meta */}
                    <div className="flex-1 min-w-0 pr-5">
                      <h4
                        className={`text-xs font-semibold truncate leading-tight ${
                          isActive ? "text-[#007AFF]" : "text-[#1C1C1E]"
                        }`}
                        title={file.name}
                      >
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#8E8E93] font-mono">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="truncate">{file.uploadedAt}</span>
                      </div>
                    </div>

                    {/* Delete File Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      title="Delete file"
                      className="absolute right-2 top-2.5 w-4.5 h-4.5 rounded hover:bg-red-50 text-[#8E8E93] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Right Column: PDF reader */}
      <section className="flex-1 h-full bg-white rounded-2xl sm:rounded-3xl border border-[#E5E0D5] shadow-2xs overflow-hidden flex flex-col relative">
        {activeFile ? (
          <>
            {/* Half-size Slim Bar (28px - half the height of 56px native bar) */}
            <div className="h-7 px-3 bg-[#1C1C1E] text-white flex items-center justify-between flex-shrink-0 text-[11px] font-sans border-b border-[#2C2C2E] select-none">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                <span className="font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md text-[#E5E5EA]">
                  {activeFile.name}
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93] hidden md:inline">
                  ({activeFile.size})
                </span>
              </div>

              {/* Compact Controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowNativeBar((v) => !v)}
                  title={showNativeBar ? "Switch to Half-size Compact Bar" : "Switch to Full Browser Bar"}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#D1D1D6] hover:text-white transition-colors cursor-pointer"
                >
                  {showNativeBar ? "Half-size Bar" : "Full Bar"}
                </button>
                <a
                  href={activeFile.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in new window"
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#D1D1D6] hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  <span>Popout</span>
                </a>
                <a
                  href={activeFile.url}
                  download={activeFile.name}
                  title="Download PDF"
                  className="px-2.5 py-0.5 rounded bg-[#007AFF] hover:bg-[#0066d6] text-white font-medium transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* PDF Viewport */}
            <div className="flex-1 w-full h-full min-h-0 relative bg-[#525659]">
              <iframe
                src={`${activeFile.url}#toolbar=${showNativeBar ? "1" : "0"}&navpanes=0&view=FitH`}
                title={activeFile.name}
                className="w-full h-full border-none block"
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-center text-[#1E3A2B] shadow-2xs mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1C1E] mb-1">
              No PDF Document Selected
            </h3>
            <p className="text-xs text-[#736E65] max-w-sm mb-5 leading-relaxed">
              Upload your lecture notes, textbook chapters, or research papers on the left to begin studying.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Upload a PDF to Start</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
