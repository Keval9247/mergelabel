"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ACCESS_STORAGE_KEY,
  APP_PASSWORD,
  createAccessRecord,
  isAccessValid,
} from "@/lib/app-access";

const inputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]";

type PasswordGateProps = {
  children: ReactNode;
};

export default function PasswordGate({ children }: PasswordGateProps) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const valid = isAccessValid(localStorage.getItem(ACCESS_STORAGE_KEY));
    if (!valid) {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
    }
    setUnlocked(valid);
    setReady(true);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== APP_PASSWORD) {
      setError("Incorrect password. Try again.");
      return;
    }
    localStorage.setItem(
      ACCESS_STORAGE_KEY,
      JSON.stringify(createAccessRecord()),
    );
    setError(null);
    setPassword("");
    setUnlocked(true);
  }

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--page-bg)]">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--page-bg)] px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--hero-wash)_0%,_transparent_70%)]"
        />
        <div className="relative w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              MergeLabel
            </p>
            <p className="text-sm text-[var(--muted)]">
              Enter the access password to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--foreground)]">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={inputClass}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "access-password-error" : undefined}
              />
            </label>

            {error ? (
              <p
                id="access-password-error"
                role="alert"
                className="text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="h-10 w-full rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
