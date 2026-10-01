import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { Users } from "lucide-react"
import { workspaceApi } from "@/api/workspace"
import { authErrorMessage } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"
import { Button, Notice, panelClass } from "@/components/workspace/Controls"

export default function Invite() {
  const [params, setParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const authenticated = useAuthStore((state) => state.isAuthenticated)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const token = params.get("token")
  const accepted = params.get("accepted") === "1"
  const returnTo = encodeURIComponent(
    `/invite?token=${encodeURIComponent(token ?? "")}`,
  )
  async function accept() {
    if (!token) return
    setBusy(true)
    setError("")
    try {
      await workspaceApi.accept(token)
      useAuthStore.getState().logout()
      setParams({ accepted: "1" }, { replace: true })
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6 text-[var(--text-1)]">
      <section className={`${panelClass} w-full max-w-md space-y-5 p-8`}>
        <Users size={28} className="text-[var(--accent)]" />
        <h1 className="text-xl font-semibold">
          {accepted
            ? "You have joined the team"
            : "Join your Sherlock workspace"}
        </h1>
        <Notice message={error} />
        {accepted ? (
          <>
            <p className="text-sm text-[var(--text-3)]">
              Your membership is updated. Sign in again to use the new
              workspace.
            </p>
            <Link
              className="inline-block text-sm text-[var(--accent)]"
              to="/login?returnTo=%2Fapp%2Fsettings%3Ftab%3Dteam"
            >
              Sign in to your workspace →
            </Link>
          </>
        ) : !token ? (
          <p className="text-sm text-[var(--text-3)]">
            This invitation link has no token. Ask your workspace admin for a
            new link.
          </p>
        ) : authenticated ? (
          <>
            <p className="text-sm text-[var(--text-3)]">
              Accept as {user?.email}. Your email must match the invitation.
              Existing workspace owners can only move if their workspace is
              empty.
            </p>
            <Button primary disabled={busy} onClick={() => void accept()}>
              {busy ? "Joining…" : "Accept invitation"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--text-3)]">
              Sign in or register using the email that received this invitation.
            </p>
            <div className="flex gap-5">
              <Link
                className="text-sm text-[var(--accent)]"
                to={`/login?returnTo=${returnTo}`}
              >
                Sign in →
              </Link>
              <Link
                className="text-sm text-[var(--accent)]"
                to={`/register?returnTo=${returnTo}`}
              >
                Create account →
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
