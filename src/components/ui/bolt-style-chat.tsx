import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Brain,
  Check,
  ChevronDown,
  FileCode,
  GitBranch,
  Image,
  Lightbulb,
  Paperclip,
  Plus,
  SearchCode,
  SendHorizontal,
  Sparkles,
  Zap,
} from "lucide-react"
import { FaGithub as GitHubIcon } from "react-icons/fa"
import { cn } from "@/lib/utils"

interface Model {
  id: string
  name: string
  description: string
  icon: ReactNode
  badge?: string
}

const models: Model[] = [
  {
    id: "sherlock-auto",
    name: "Sherlock Auto",
    description: "Balanced evidence correlation",
    icon: <Zap className="size-4 text-info" />,
    badge: "Default",
  },
  {
    id: "deep-analysis",
    name: "Deep Analysis",
    description: "Thorough causal reasoning",
    icon: <Sparkles className="size-4 text-violet-400" />,
    badge: "Pro",
  },
  {
    id: "fast-triage",
    name: "Fast Triage",
    description: "Quick signal summary",
    icon: <Brain className="size-4 text-success" />,
  },
]

function ModelSelector({
  selectedModel = "sherlock-auto",
  onModelChange,
}: {
  selectedModel?: string
  onModelChange?: (model: Model) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(
    models.find((model) => model.id === selectedModel) ?? models[0],
  )

  const handleSelect = (model: Model) => {
    setSelected(model)
    setIsOpen(false)
    onModelChange?.(model)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-white/55 transition hover:bg-white/5 hover:text-white"
      >
        {selected.icon}
        <span>{selected.name}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close model selector"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            className="absolute bottom-full left-0 z-50 mb-2 min-w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Analysis mode
            </div>
            {models.map((model) => (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={selected.id === model.id}
                onClick={() => handleSelect(model)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition",
                  selected.id === model.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="shrink-0">{model.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{model.name}</span>
                    {model.badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          model.badge === "Pro"
                            ? "bg-violet-500/20 text-violet-200"
                            : "bg-blue-500/20 text-blue-200",
                        )}
                      >
                        {model.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-white/35">
                    {model.description}
                  </span>
                </span>
                {selected.id === model.id && (
                  <Check className="size-4 shrink-0 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChatInput({
  onSend,
  placeholder = "What do you want to investigate?",
}: {
  onSend?: (message: string) => void
  placeholder?: string
}) {
  const [message, setMessage] = useState("")
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [message])

  const handleSubmit = () => {
    const value = message.trim()
    if (!value) return
    onSend?.(value)
    setMessage("")
  }

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
      <div className="relative rounded-2xl bg-[#1e1e22] shadow-2xl ring-1 ring-white/10">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-h-20 max-h-48 w-full resize-none bg-transparent px-5 pb-3 pt-5 text-[15px] text-white outline-none placeholder:text-white/30"
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                aria-label="Add investigation context"
                aria-expanded={showAttachMenu}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/55 transition hover:bg-white/15 hover:text-white"
              >
                <Plus
                  className={cn(
                    "size-4 transition-transform",
                    showAttachMenu && "rotate-45",
                  )}
                />
              </button>
              {showAttachMenu && (
                <>
                  <button
                    type="button"
                    aria-label="Close attachment menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowAttachMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 z-50 mb-2 min-w-48 rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl">
                    {[
                      {
                        icon: <Paperclip className="size-4" />,
                        label: "Attach telemetry",
                      },
                      {
                        icon: <Image className="size-4" />,
                        label: "Add screenshot",
                      },
                      {
                        icon: <FileCode className="size-4" />,
                        label: "Import stack trace",
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <ModelSelector />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              <Lightbulb className="size-4" />
              <span className="hidden sm:inline">Plan</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Investigate</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RayBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      <div className="absolute left-1/2 top-[-45%] h-[1100px] w-[1600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,136,252,0.6)_0%,rgba(20,136,252,0.18)_30%,transparent_68%)] blur-2xl" />
      <div className="absolute left-1/2 top-[58%] h-[900px] w-[1500px] -translate-x-1/2 rounded-[50%] border-[18px] border-blue-500/60 bg-[#0f0f0f] shadow-[0_-16px_40px_rgba(20,136,252,0.35)]" />
    </div>
  )
}

function AnnouncementBadge({
  text,
  href = "#",
}: {
  text: string
  href?: string
}) {
  const classes =
    "relative inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.07] px-5 py-2 text-sm text-white shadow-xl backdrop-blur-xl transition hover:scale-[1.02]"
  const content = (
    <>
      <SearchCode className="size-4" />
      <span className="font-medium">{text}</span>
    </>
  )
  return href !== "#" ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {content}
    </a>
  ) : (
    <span className={classes}>{content}</span>
  )
}

function ImportButtons({ onImport }: { onImport?: (source: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="text-sm text-white/35">or start from</span>
      <div className="flex gap-2">
        {[
          {
            id: "trace",
            name: "Trace ID",
            icon: <GitBranch className="size-4" />,
          },
          {
            id: "github",
            name: "GitHub",
            icon: <GitHubIcon className="size-4" />,
          },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onImport?.(option.id)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/55 transition hover:bg-white/5 hover:text-white"
          >
            {option.icon}
            {option.name}
          </button>
        ))}
      </div>
    </div>
  )
}

interface BoltChatProps {
  title?: string
  subtitle?: string
  announcementText?: string
  announcementHref?: string
  placeholder?: string
  onSend?: (message: string) => void
  onImport?: (source: string) => void
}

export function BoltStyleChat({
  title = "What will you",
  subtitle = "Correlate traces, logs, metrics, and deployments with AI.",
  announcementText = "AI-assisted investigation",
  announcementHref = "#",
  placeholder = "Describe an incident, symptom, or hypothesis...",
  onSend,
  onImport,
}: BoltChatProps) {
  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0f0f0f]">
      <RayBackground />
      <div className="absolute top-8 z-10">
        <AnnouncementBadge
          text={announcementText}
          href={announcementHref}
        />
      </div>
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-28">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {title}{" "}
            <span className="bg-gradient-to-b from-blue-400 to-white bg-clip-text italic text-transparent">
              investigate
            </span>{" "}
            today?
          </h1>
          <p className="text-base font-semibold text-white/50 sm:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="mb-6 mt-2 w-full max-w-[700px]">
          <ChatInput placeholder={placeholder} onSend={onSend} />
        </div>
        <ImportButtons onImport={onImport} />
        <p className="mt-8 max-w-xl text-center text-xs leading-relaxed text-white/30">
          AI output is an unverified hypothesis. Validate against linked
          telemetry before taking production action.
        </p>
      </div>
    </div>
  )
}
