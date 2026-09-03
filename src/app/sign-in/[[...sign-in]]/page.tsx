import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

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

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1E] flex flex-col font-sans selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      {/* Top Bar */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-[#E5E0D5] bg-[#FAF7F2]/80 backdrop-blur-xs flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group" title="Paperly Home">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E0D5] flex items-center justify-center shadow-2xs group-hover:border-[#1E3A2B] transition-colors">
            <PaperlyLogo className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#1C1C1E]">
            Paperly
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-bold">
            Auth
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#6E6E73] hover:text-[#007AFF] px-3 py-1.5 rounded-[10px] hover:bg-[#F2F2F7] transition-colors flex items-center gap-1.5"
        >
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E5E0D5] shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Left Hero Column */}
          <div className="md:w-5/12 bg-gradient-to-br from-[#1E3A2B] to-[#162C20] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-white/90 mb-6">
                <span>✦</span>
                <span>Welcome Back</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
                Pick up right where your thoughts left off.
              </h2>
              <p className="text-xs text-white/75 leading-relaxed mb-6">
                Access your documents, infinite whiteboard diagrams, agile kanban tasks, and study space in one tab.
              </p>

              {/* Workspace Badge Strip */}
              <div className="space-y-2 text-xs font-medium">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                  <span>Study Space & Native PDF Reader</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#5856D6]" />
                  <span>4-Column Agile Kanban Board</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                  <span>Excalidraw Visual Whiteboards</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#D75800]" />
                  <span>Rich Block Notes & Specs</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
              <span>Paperly v2.0</span>
              <span>Distraction-Free</span>
            </div>
          </div>

          {/* Right Form Column: Clerk SignIn */}
          <div className="md:w-7/12 p-6 sm:p-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-sm">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "shadow-none w-full",
                    card: "bg-transparent shadow-none border-none p-0",
                    headerTitle: "font-serif text-2xl font-bold text-[#1C1C1E]",
                    headerSubtitle: "text-xs text-[#6E6E73] font-sans mt-1",
                    socialButtonsBlockButton:
                      "rounded-xl border border-[#E5E0D5] hover:bg-[#F2F2F7] text-[#1C1C1E] text-xs font-semibold h-10 transition-colors shadow-2xs",
                    socialButtonsBlockButtonText: "font-sans font-medium text-xs text-[#1C1C1E]",
                    dividerLine: "bg-[#E5E0D5]",
                    dividerText: "text-[10px] uppercase tracking-wider text-[#8E8E93] font-mono",
                    formFieldLabel: "text-xs font-semibold text-[#1C1C1E] font-sans mb-1.5",
                    formFieldInput:
                      "h-10 rounded-[10px] bg-[#F2F2F7] border border-[#E5E0D5] text-[#1C1C1E] text-xs font-sans px-3.5 focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors",
                    formButtonPrimary:
                      "h-10 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 font-sans",
                    footerActionLink: "text-[#007AFF] hover:text-[#0066d6] font-semibold text-xs font-sans",
                    footerActionText: "text-xs text-[#6E6E73] font-sans",
                    identityPreview: "rounded-xl border border-[#E5E0D5] bg-[#FAF7F2]",
                    identityPreviewText: "text-xs text-[#1C1C1E] font-sans",
                    formFieldAction: "text-xs text-[#007AFF] hover:text-[#0066d6] font-semibold font-sans",
                  },
                  variables: {
                    colorPrimary: "#007AFF",
                    borderRadius: "10px",
                    fontFamily: "var(--font-inter), sans-serif",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
