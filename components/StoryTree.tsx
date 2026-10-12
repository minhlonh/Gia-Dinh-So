"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { readLS, useFamily, writeLS } from "@/context/FamilyContext";
import { useTheme } from "@/components/AdaptiveWrapper";
import { LIFE_STAGES, keywordsForYear, type Bi } from "@/lib/storyKeywords";
import type { Member } from "@/types";

type Entry = { id: string; authorId: string | null; text: string; at: number };
type Story = { id: string; familyId: string; year: number; keyword: string; entries: Entry[] };

const STORIES_KEY = "gds_stories";
const NOW = new Date().getFullYear();
const MIN_YEAR = 1930;
const COLORS = ["#16a34a", "#f97316", "#8b5cf6", "#ec4899", "#0ea5e9", "#eab308", "#ef4444", "#14b8a6"];
const YEARS = Array.from({ length: NOW - MIN_YEAR + 1 }, (_, i) => NOW - i);

const birthOf = (m: Member): number | null => (typeof m.birth_year === "number" ? m.birth_year : null);

export default function StoryTree() {
  const { lang, family, members, activeMember } = useFamily();
  const { theme } = useTheme();
  const L = (vi: string, en: string) => (lang === "vi" ? vi : en);
  const kwText = (b: Bi) => (lang === "vi" ? b[0] : b[1]);

  const [stories, setStories] = useState<Story[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [focusId, setFocusId] = useState("");
  const [year, setYear] = useState<number>(NOW - 30);
  const [keyword, setKeyword] = useState("");
  const [text, setText] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { setStories(readLS<Story[]>(STORIES_KEY, [])); setLoaded(true); }, []);
  useEffect(() => { if (loaded) writeLS(STORIES_KEY, stories); }, [loaded, stories]);

  if (!family) return null;

  const famStories = stories.filter((s) => s.familyId === family.id);
  const sorted = [...famStories].sort((a, b) => a.year - b.year);
  const n = sorted.length;
  const total = sorted.reduce((sum, s) => sum + s.entries.length, 0);

  const colorOf = (id: string | null) => {
    const i = members.findIndex((m) => m.id === id);
    return COLORS[(i < 0 ? 0 : i) % COLORS.length];
  };
  const memberOf = (id: string | null) => members.find((m) => m.id === id) ?? null;

  const focusMember = members.find((m) => m.id === focusId) ?? activeMember ?? members[0] ?? null;
  const focusBirth = focusMember ? birthOf(focusMember) : null;
  const stageChips =
    focusBirth !== null
      ? LIFE_STAGES.map((s) => ({ year: focusBirth + s.age, kw: s.kw })).filter((c) => c.year <= NOW)
      : [];

  const present = members
    .map((m) => ({ m, b: birthOf(m) }))
    .filter((x): x is { m: Member; b: number } => x.b !== null && x.b <= year)
    .map(({ m, b }) => ({ m, age: year - b }));
  const stageHints = present.flatMap(({ m, age }) =>
    LIFE_STAGES.filter((s) => s.age === age).map((s) => ({ m, kw: s.kw })),
  );

  const defaultAuthor = authorId || activeMember?.id || members[0]?.id || "";

  const stage =
    total === 0 ? { icon: "🌰", label: L("Hạt giống", "Seed"), next: 1 }
    : total < 3 ? { icon: "🌱", label: L("Mầm non", "Sprout"), next: 3 }
    : total < 7 ? { icon: "🌿", label: L("Cây non", "Sapling"), next: 7 }
    : total < 15 ? { icon: "🌳", label: L("Cây xanh", "Green tree"), next: 15 }
    : { icon: "🌳✨", label: L("Đại thụ", "Mighty tree"), next: 0 };

  const addStory = (e: FormEvent) => {
    e.preventDefault();
    const k = keyword.trim();
    const body = text.trim();
    if (!k || !body) return;
    const story: Story = {
      id: crypto.randomUUID(),
      familyId: family.id,
      year,
      keyword: k,
      entries: [{ id: crypto.randomUUID(), authorId: defaultAuthor || null, text: body, at: Date.now() }],
    };
    setStories((prev) => [...prev, story]);
    setSelected(story.id);
    setKeyword("");
    setText("");
  };

  const addReply = (storyId: string) => {
    const body = replyText.trim();
    if (!body) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      authorId: replyAuthor || activeMember?.id || members[0]?.id || null,
      text: body,
      at: Date.now(),
    };
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, entries: [...s.entries, entry] } : s)));
    setReplyText("");
    setReplyFor(null);
  };

  const removeStory = (id: string) => setStories((prev) => prev.filter((s) => s.id !== id));

  const pick = (id: string) => {
    setSelected(id);
    document.getElementById(`story-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ---- hình cái cây ----
  const trunkH = n === 0 ? 0 : 90 + Math.min(250, n * 26 + Math.max(0, total - n) * 4);
  const topY = 440 - trunkH;
  const crownRx = 50 + Math.min(130, n * 9);
  const crownRy = 35 + Math.min(95, n * 6);

  return (
    <section className="space-y-6">
      <header>
        <h2 className={`text-2xl ${theme.heading}`}>🌳 {L("Cây câu chuyện gia đình", "Family Story Tree")}</h2>
        <p className={theme.muted}>
          {L(
            "Chọn một năm, xem ai đã có mặt, rồi cùng kể chuyện. Mỗi câu chuyện là một cành, mỗi lời kể thêm là một chiếc lá.",
            "Pick a year, see who was around, then tell stories together. Each story is a branch and every added memory is a leaf.",
          )}
        </p>
      </header>

      {/* ---------- CÂY ---------- */}
      <div className={`${theme.card} p-4 text-center`}>
        <p className="text-lg font-bold">{stage.icon} {stage.label}</p>
        <p className={`text-sm ${theme.muted}`}>
          {L(`${n} câu chuyện · ${total} lời kể`, `${n} stories · ${total} memories`)}
          {stage.next > 0 && ` · ${L(`còn ${stage.next - total} lời kể nữa để cây lớn`, `${stage.next - total} more memories to grow`)}`}
        </p>
        <svg viewBox="0 0 400 470" className="mx-auto w-full max-w-md" role="img" aria-label={L("Cây câu chuyện của gia đình", "Family story tree")}>
          <ellipse cx="200" cy="448" rx="150" ry="14" fill="#16a34a" opacity="0.25" />
          {n === 0 ? (
            <text x="200" y="440" textAnchor="middle" fontSize="46">🌰</text>
          ) : (
            <>
              <ellipse cx="200" cy={topY - 5} rx={crownRx} ry={crownRy} fill="#22c55e" opacity="0.15" />
              <path d={`M184 444 L216 444 L207 ${topY} L193 ${topY} Z`} fill="#92400e" />
              {sorted.map((s, i) => {
                const ty = 430 - (trunkH - 40) * ((i + 1) / (n + 1));
                const side = i % 2 === 0 ? -1 : 1;
                const len = 70 + (i % 3) * 18;
                const ex = 200 + side * len;
                const ey = ty - 28;
                const isSel = selected === s.id;
                return (
                  <motion.g
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => pick(s.id)}
                    className="cursor-pointer"
                    role="button"
                    aria-label={`${s.year} ${s.keyword}`}
                  >
                    <path
                      d={`M200 ${ty} Q ${200 + side * len * 0.5} ${ty - 2} ${ex} ${ey}`}
                      stroke="#92400e" strokeWidth={isSel ? 7 : 5} fill="none" strokeLinecap="round"
                    />
                    {s.entries.slice(1, 7).map((en, k) => {
                      const a = ((k * 55) - 100) * (Math.PI / 180);
                      return (
                        <circle
                          key={en.id}
                          cx={ex + Math.cos(a) * 24} cy={ey + Math.sin(a) * 24}
                          r="7" fill={colorOf(en.authorId)} stroke="#fff" strokeWidth="1.5"
                        />
                      );
                    })}
                    <circle
                      cx={ex} cy={ey} r={isSel ? 18 : 15}
                      fill={colorOf(s.entries[0]?.authorId ?? null)} stroke="#fff" strokeWidth="2"
                    />
                    <text x={ex} y={ey + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
                      {String(s.year).slice(2)}
                    </text>
                  </motion.g>
                );
              })}
            </>
          )}
        </svg>
        {n > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm">
            {members.map((m) => (
              <span key={m.id} className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: colorOf(m.id) }} />
                {m.avatar_emoji} {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ---------- CHỌN NĂM ---------- */}
      <div className={`${theme.card} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-bold" htmlFor="story-year">{L("Năm", "Year")}</label>
          <select
            id="story-year" value={year} onChange={(e) => setYear(Number(e.target.value))}
            className={`${theme.input} ${theme.touch} w-32`}
          >
            {YEARS.map((y) => <option key={y} value={y} className="text-slate-900">{y}</option>)}
          </select>
        </div>

        {members.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-bold">{L("Mốc đời của", "Life milestones of")}</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => setFocusId(m.id)}
                  className={`${focusMember?.id === m.id ? theme.tabActive : theme.tabIdle} px-3 py-2 text-sm`}
                >
                  {m.avatar_emoji} {m.name}
                </button>
              ))}
            </div>
            {stageChips.length === 0 ? (
              <p className={`text-sm ${theme.muted}`}>
                {L("Thêm năm sinh cho thành viên này để có gợi ý mốc đời.", "Add this member's birth year to get milestone prompts.")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stageChips.map((c) => (
                  <button
                    key={`${c.year}-${c.kw[0]}`} type="button"
                    onClick={() => { setYear(c.year); setKeyword(kwText(c.kw)); }}
                    className={`${theme.secondary} px-3 py-2 text-sm`}
                  >
                    {c.year} · {kwText(c.kw)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-bold">{L(`Ai đã có mặt năm ${year}`, `Who was around in ${year}`)}</p>
          {present.length === 0 ? (
            <p className={`text-sm ${theme.muted}`}>
              {L("Chưa ai trong gia đình ra đời năm này, nhưng bạn vẫn có thể kể chuyện của ông bà, tổ tiên.", "Nobody in the family was born yet, but you can still tell stories about elders and ancestors.")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {present.map(({ m, age }) => (
                <span key={m.id} className="rounded-full bg-black/10 px-3 py-1 text-sm">
                  {m.avatar_emoji} {m.name} · {age === 0 ? L("chào đời", "born") : L(`${age} tuổi`, `age ${age}`)}
                </span>
              ))}
            </div>
          )}
          {stageHints.map(({ m, kw }) => (
            <button
              key={`${m.id}-${kw[0]}`} type="button" onClick={() => setKeyword(kwText(kw))}
              className="mt-2 mr-2 rounded-full bg-amber-400/30 px-3 py-1 text-sm font-semibold"
            >
              {m.avatar_emoji} {m.name}: {kwText(kw)}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">{L(`Từ khóa gợi nhớ năm ${year}`, `Memory keywords for ${year}`)}</p>
          <div className="flex flex-wrap gap-2">
            {keywordsForYear(year).map((b) => (
              <button
                key={b[0]} type="button" onClick={() => setKeyword(kwText(b))}
                className={`${theme.secondary} px-3 py-2 text-sm`}
              >
                {kwText(b)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- KỂ CHUYỆN ---------- */}
      <form onSubmit={addStory} className={`${theme.card} space-y-3 p-5`}>
        <h3 className={`text-lg ${theme.heading}`}>🌱 {L("Gieo một câu chuyện", "Plant a story")}</h3>
        <input
          value={keyword} onChange={(e) => setKeyword(e.target.value)}
          placeholder={L("Từ khóa (chọn ở trên hoặc tự gõ)", "Keyword (pick above or type your own)")}
          aria-label={L("Từ khóa", "Keyword")} className={`${theme.input} ${theme.touch} w-full`}
        />
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={4}
          placeholder={L("Năm đó bạn nhớ gì? Ai ở đó? Chuyện gì đã xảy ra?", "What do you remember? Who was there? What happened?")}
          aria-label={L("Câu chuyện", "Story")} className={`${theme.input} w-full p-3`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={defaultAuthor} onChange={(e) => setAuthorId(e.target.value)}
            aria-label={L("Người kể", "Storyteller")} className={`${theme.input} ${theme.touch}`}
          >
            {members.map((m) => <option key={m.id} value={m.id} className="text-slate-900">{m.avatar_emoji} {m.name}</option>)}
          </select>
          <button type="submit" className={`${theme.primary} ${theme.touch} flex items-center gap-2 px-6`}>
            <Plus className="h-5 w-5" aria-hidden /> {L("Thêm vào cây", "Add to the tree")}
          </button>
        </div>
      </form>

      {/* ---------- CÁC CÂU CHUYỆN ---------- */}
      {sorted.length === 0 ? (
        <p className={`${theme.card} p-6 text-center ${theme.muted}`}>
          {L("Cây còn là hạt giống. Hãy gieo câu chuyện đầu tiên!", "The tree is still a seed. Plant the first story!")}
        </p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((s) => (
            <li
              key={s.id} id={`story-${s.id}`}
              className={`${theme.card} space-y-3 p-5 ${selected === s.id ? "ring-4 ring-emerald-500" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className={`text-lg ${theme.heading}`}>🌿 {s.year} · {s.keyword}</h3>
                <button
                  type="button" onClick={() => removeStory(s.id)} aria-label={L("Xóa câu chuyện", "Delete story")}
                  className={`${theme.secondary} flex h-10 w-10 shrink-0 items-center justify-center`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <ul className="space-y-2">
                {s.entries.map((en) => {
                  const who = memberOf(en.authorId);
                  return (
                    <li key={en.id} className="flex gap-3">
                      <span
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg"
                        style={{ background: colorOf(en.authorId) + "33" }}
                      >
                        {who?.avatar_emoji ?? "🙂"}
                      </span>
                      <div>
                        <p className="text-sm font-bold">{who?.name ?? L("Ẩn danh", "Someone")}</p>
                        <p className="whitespace-pre-wrap">{en.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {replyFor === s.id ? (
                <div className="space-y-2">
                  <textarea
                    value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3}
                    placeholder={L("Bạn nhớ thêm điều gì về chuyện này?", "What else do you remember about this?")}
                    aria-label={L("Viết tiếp", "Continue the story")} className={`${theme.input} w-full p-3`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={replyAuthor || activeMember?.id || members[0]?.id || ""}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      aria-label={L("Người kể", "Storyteller")} className={`${theme.input} ${theme.touch}`}
                    >
                      {members.map((m) => <option key={m.id} value={m.id} className="text-slate-900">{m.avatar_emoji} {m.name}</option>)}
                    </select>
                    <button type="button" onClick={() => addReply(s.id)} className={`${theme.primary} ${theme.touch} px-5`}>
                      {L("Thêm lá", "Add a leaf")}
                    </button>
                    <button type="button" onClick={() => setReplyFor(null)} className={`${theme.secondary} ${theme.touch} px-4`}>
                      {L("Hủy", "Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button" onClick={() => { setReplyFor(s.id); setReplyText(""); }}
                  className={`${theme.secondary} ${theme.touch} px-5`}
                >
                  ✍️ {L("Viết tiếp câu chuyện", "Continue the story")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
