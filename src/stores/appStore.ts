import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, Environment, User } from "@/types"

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void

  // Project / environment
  projects: Project[]
  activeProjectId: string
  activeEnvironment: Environment
  setProjects: (projects: Project[]) => void
  setActiveProject: (id: string) => void
  setActiveEnvironment: (env: Environment) => void

  // UI
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  theme: "dark" | "light"
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  setTheme: (theme: "dark" | "light") => void

  // Time range
  timeRange: "1h" | "6h" | "24h" | "7d" | "30d"
  setTimeRange: (range: "1h" | "6h" | "24h" | "7d" | "30d") => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      projects: [],
      activeProjectId: "",
      activeEnvironment: "production",
      setProjects: (projects) =>
        set((state) => {
          const active =
            projects.find((project) => project.id === state.activeProjectId) ??
            projects[0]
          return {
            projects,
            activeProjectId: active?.id ?? "",
            activeEnvironment: active?.environments.includes(
              state.activeEnvironment,
            )
              ? state.activeEnvironment
              : (active?.environments[0] ?? "production"),
          }
        }),
      setActiveProject: (id) =>
        set((state) => {
          const project = state.projects.find((item) => item.id === id)
          return {
            activeProjectId: id,
            activeEnvironment: project?.environments.includes(
              state.activeEnvironment,
            )
              ? state.activeEnvironment
              : (project?.environments[0] ?? "production"),
          }
        }),
      setActiveEnvironment: (env) => set({ activeEnvironment: env }),

      sidebarCollapsed: false,
      commandPaletteOpen: false,
      theme: "dark",
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      setTheme: (theme) => set({ theme }),

      timeRange: "1h",
      setTimeRange: (timeRange) => set({ timeRange }),
    }),
    {
      name: "elora-app-store",
      partialize: (s) => ({
        activeProjectId: s.activeProjectId,
        activeEnvironment: s.activeEnvironment,
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        timeRange: s.timeRange,
      }),
    },
  ),
)

// Convenience selectors
export const useActiveProject = () => {
  const { projects, activeProjectId } = useAppStore()
  return projects.find((p) => p.id === activeProjectId) ?? projects[0]
}
