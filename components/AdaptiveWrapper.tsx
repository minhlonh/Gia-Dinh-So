"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useFamily } from "@/context/FamilyContext";
import type { Role } from "@/types";

export interface Theme {
  page: string;
  card: string;
  muted: string;
  input: string;
  primary: string;
  secondary: string;
  tabActive: string;
  tabIdle: string;
  heading: string;
  touch: string;
  /** Root font-size in %, so every rem-based Tailwind size scales with the role. */
  rootFontPercent: number;
}

const THEMES: Record<Role, Theme> = {
  grandparent: {
    page: "bg-amber-50 text-stone-900",
    card: "bg-white border-2 border-stone-800 rounded-3xl shadow-md",
    muted: "text-stone-700",
    input: "bg-white border-2 border-stone-800 text-stone-900 placeholder:text-stone-500 rounded-2xl px-4",
    primary: "bg-orange-700 text-white hover:bg-orange-800 font-bold rounded-2xl",
    secondary: "bg-white text-stone-900 border-2 border-stone-800 hover:bg-amber-100 font-semibold rounded-2xl",
    tabActive: "bg-stone-900 text-amber-50 rounded-2xl font-bold",
    tabIdle: "bg-white text-stone-900 border-2 border-stone-800 rounded-2xl font-semibold",
    heading: "font-extrabold tracking-tight",
    touch: "min-h-[56px]",
    rootFontPercent: 125,
  },
  parent: {
    page: "bg-slate-50 text-slate-900",
    card: "bg-white border border-slate-200 rounded-2xl shadow-sm",
    muted: "text-slate-600",
    input: "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-3",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-xl",
    secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 font-medium rounded-xl",
    tabActive: "bg-indigo-600 text-white rounded-xl font-semibold",
    tabIdle: "bg-white text-slate-700 border border-slate-200 rounded-xl font-medium",
    heading: "font-bold tracking-tight",
    touch: "min-h-[44px]",
    rootFontPercent: 100,
  },
  youth: {
    page: "bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 text-white",
    card: "bg-white/10 backdrop-blur border border-white/25 rounded-3xl shadow-lg",
    muted: "text-white/75",
    input: "bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-2xl px-4",
    primary: "bg-gradient-to-r from-pink-500 to-yellow-400 text-slate-900 hover:brightness-110 font-extrabold rounded-2xl",
    secondary: "bg-white/10 text-white border border-white/30 hover:bg-white/20 font-semibold rounded-2xl",
    tabActive: "bg-white text-purple-800 rounded-2xl font-extrabold",
    tabIdle: "bg-white/10 text-white border border-white/25 rounded-2xl font-semibold",
    heading: "font-black tracking-tight",
    touch: "min-h-[44px]",
    rootFontPercent: 100,
  },
  child: {
    page: "bg-gradient-to-b from-sky-200 to-emerald-100 text-slate-900",
    card: "bg-white border-4 border-yellow-300 rounded-[2rem] shadow-lg",
    muted: "text-slate-600",
    input: "bg-white border-4 border-sky-300 text-slate-900 placeholder:text-slate-400 rounded-2xl px-4",
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 font-extrabold rounded-full",
    secondary: "bg-white text-slate-800 border-4 border-sky-300 hover:bg-sky-50 font-bold rounded-full",
    tabActive: "bg-emerald-500 text-white rounded-full font-extrabold",
    tabIdle: "bg-white text-slate-700 border-4 border-yellow-300 rounded-full font-bold",
    heading: "font-black tracking-tight",
    touch: "min-h-[52px]",
    rootFontPercent: 112.5,
  },
};

interface ThemeContextValue { role: Role; theme: Theme }
const ThemeContext = createContext<ThemeContextValue>({ role: "parent", theme: THEMES.parent });

export function AdaptiveWrapper({ children }: { children: ReactNode }) {
  const { activeMember } = useFamily();
  const role: Role = activeMember?.role ?? "parent";
  const theme = THEMES[role];

  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = `${theme.rootFontPercent}%`;
    el.dataset.role = role;
    return () => { el.style.fontSize = ""; };
  }, [theme.rootFontPercent, role]);

  return (
    <ThemeContext.Provider value={{ role, theme }}>
      <div data-role={role} className={`min-h-screen transition-colors duration-500 ${theme.page}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

components/FamilySetup.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, LogOut, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { useTheme } from "@/components/AdaptiveWrapper";
import { ROLE_KEY } from "@/lib/i18n";
import type { UiKey } from "@/dictionaries/vi";
import type { Member, MemberInput, Role } from "@/types";

/* ---------- Create / Join ---------- */
export function FamilySetup() {
  const { t, createFamily, joinFamily } = useFamily();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UiKey | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = mode === "create" ? await createFamily(value) : await joinFamily(value);
    if (!res.ok) setError(res.error);
    setBusy(false);
  };

  return (
    <section className={`${theme.card} mx-auto max-w-lg space-y-5 p-6`}>
      <div className="text-center">
        <Users className="mx-auto mb-2 h-12 w-12" aria-hidden />
        <h2 className={`text-2xl ${theme.heading}`}>{t("setupTitle")}</h2>
        <p className={theme.muted}>{t("setupSubtitle")}</p>
      </div>

      <div role="tablist" className="grid grid-cols-2 gap-2">
        {(["create", "join"] as const).map((m) => (
          <button
            key={m} role="tab" aria-selected={mode === m}
            onClick={() => { setMode(m); setValue(""); setError(null); }}
            className={`${mode === m ? theme.tabActive : theme.tabIdle} ${theme.touch} px-3`}
          >
            {m === "create" ? t("createFamily") : t("joinFamily")}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "create" ? (
          <input
            value={value} onChange={(e) => setValue(e.target.value)} required maxLength={60}
            placeholder={t("familyNamePlaceholder")} aria-label={t("familyName")}
            className={`${theme.input} ${theme.touch} w-full text-lg`}
          />
        ) : (
          <input
            value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} required maxLength={6}
            placeholder="ABC123" aria-label={t("enterCode")} autoCapitalize="characters"
            className={`${theme.input} ${theme.touch} w-full text-center text-2xl font-bold tracking-[0.4em]`}
          />
        )}
        {error && <p role="alert" className="font-semibold text-red-600">{t(error)}</p>}
        <button type="submit" disabled={busy} className={`${theme.primary} ${theme.touch} w-full text-lg disabled:opacity-60`}>
          {mode === "create" ? t("create") : t("join")}
        </button>
      </form>
    </section>
  );
}

/* ---------- Member management ---------- */
interface FormState {
  name: string;
  nickname: string;
  birth_year: string;
  role: Role;
  avatar_emoji: string;
}
const EMPTY_FORM: FormState = { name: "", nickname: "", birth_year: "", role: "parent", avatar_emoji: "🙂" };
const EMOJIS = ["👵", "👴", "👨", "👩", "🧑", "👦", "👧", "🧒", "🧑‍🎤", "🐶"];
const ROLES: Role[] = ["grandparent", "parent", "youth", "child"];

export function MemberManager() {
  const { t, family, members, activeMember, setActiveMember, addMember, updateMember, removeMember, leaveFamily } = useFamily();
  const { theme } = useTheme();
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);

  const open = (m?: Member) => {
    setForm(
      m
        ? { name: m.name, nickname: m.nickname ?? "", birth_year: m.birth_year ? String(m.birth_year) : "", role: m.role, avatar_emoji: m.avatar_emoji }
        : EMPTY_FORM,
    );
    setEditing({ id: m?.id ?? null });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const year = parseInt(form.birth_year, 10);
    const input: MemberInput = {
      name: form.name.trim(),
      role: form.role,
      avatar_emoji: form.avatar_emoji,
      nickname: form.nickname.trim() || null,
      birth_year: Number.isFinite(year) && year >= 1900 && year <= new Date().getFullYear() ? year : null,
    };
    if (editing?.id) await updateMember(editing.id, input);
    else await addMember(input);
    setEditing(null);
  };

  const copyCode = async () => {
    if (!family) return;
    try {
      await navigator.clipboard.writeText(family.family_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const confirmRemove = (m: Member) => { if (window.confirm(`${t("removeConfirm")} (${m.name})`)) void removeMember(m.id); };
  const confirmLeave = () => { if (window.confirm(t("leaveConfirm"))) void leaveFamily(); };

  return (
    <section className={`${theme.card} space-y-5 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl ${theme.heading}`}>{family?.name}</h2>
          <p className={`text-sm ${theme.muted}`}>{t("familyCode")}:</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-black/10 px-4 py-2 font-mono text-2xl font-bold tracking-[0.3em]">{family?.family_code}</span>
          <button onClick={copyCode} aria-label={t("copy")} className={`${theme.secondary} flex h-11 w-11 items-center justify-center`}>
            {copied ? <Check className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
          </button>
          <button onClick={confirmLeave} aria-label={t("leaveFamily")} className={`${theme.secondary} flex h-11 w-11 items-center justify-center`}>
            <LogOut className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((m) => {
          const isActive = activeMember?.id === m.id;
          return (
            <li key={m.id} className={`flex items-center gap-2 rounded-2xl border-2 p-2 ${isActive ? "border-emerald-500 bg-emerald-500/10" : "border-transparent bg-black/5"}`}>
              <button
                onClick={() => setActiveMember(m.id)}
                aria-label={t("switchTo", { name: m.name })}
                aria-pressed={isActive}
                className="flex min-h-[48px] flex-1 items-center gap-3 text-left"
              >
                <span className="text-3xl" aria-hidden>{m.avatar_emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{m.name}</span>
                  <span className={`block text-xs ${theme.muted}`}>{isActive ? t("activeNow") : t(ROLE_KEY[m.role])}</span>
                </span>
              </button>
              <button onClick={() => open(m)} aria-label={`${t("editMember")}: ${m.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/10">
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button onClick={() => confirmRemove(m)} aria-label={`${t("remove")}: ${m.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/10">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {editing ? (
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-black/5 p-4">
          <h3 className="text-lg font-bold">{editing.id ? t("editMember") : t("addMember")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">{t("name")}
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={40} className={`${theme.input} ${theme.touch} w-full`} />
            </label>
            <label className="space-y-1 text-sm font-semibold">{t("nickname")}
              <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} maxLength={40} className={`${theme.input} ${theme.touch} w-full`} />
            </label>
            <label className="space-y-1 text-sm font-semibold">{t("birthYear")}
              <input type="number" inputMode="numeric" min={1900} max={new Date().getFullYear()} value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} className={`${theme.input} ${theme.touch} w-full`} />
            </label>
            <label className="space-y-1 text-sm font-semibold">{t("role")}
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={`${theme.input} ${theme.touch} w-full`}>
                {ROLES.map((r) => <option key={r} value={r} className="text-slate-900">{t(ROLE_KEY[r])}</option>)}
              </select>
            </label>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">{t("avatar")}</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  type="button" key={e} onClick={() => setForm({ ...form, avatar_emoji: e })} aria-pressed={form.avatar_emoji === e}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${form.avatar_emoji === e ? "bg-emerald-500/30 ring-2 ring-emerald-500" : "bg-black/10"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className={`${theme.primary} ${theme.touch} px-6`}>{t("save")}</button>
            <button type="button" onClick={() => setEditing(null)} className={`${theme.secondary} ${theme.touch} px-6`}>{t("cancel")}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => open()} className={`${theme.secondary} ${theme.touch} inline-flex items-center gap-2 px-5`}>
          <Plus className="h-5 w-5" aria-hidden /> {t("addMember")}
        </button>
      )}
    </section>
  );
}
