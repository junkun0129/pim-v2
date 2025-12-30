import { ICONS } from "@/src/constants";
import { useEffect, useMemo, useRef, useState } from "react";

type SortMode =
  | "name_asc"
  | "name_desc"
  | "len_asc"
  | "len_desc"
  | "created_at_asc"
  | "created_at_desc";

const sortLabels: Record<SortMode, string> = {
  name_asc: "A-Z",
  name_desc: "Z-A",
  len_asc: "長さ↑",
  len_desc: "長さ↓",
  created_at_asc: "作成日時↑",
  created_at_desc: "作成日時↓",
};
type Item = {
  id: string;
  name: string;
  createdAt: string;
};

type Props<T> = {
  items: T & Item[];
  selectedIds: string[];
  onToggle: (item: T & Item) => void;
  label: string;
  placeholder?: string;
  multi?: boolean;
};
function SearchablePicker<T>({
  items,
  selectedIds,
  onToggle,
  label,
  placeholder = "検索して選択...",
  multi = true,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [displayLimit, setDisplayLimit] = useState(40);
  const [sortMode, setSortMode] = useState<SortMode>("name_asc");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayLimit(40);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [search, sortMode]);

  const filteredAndSorted = useMemo(() => {
    const query = search.toLowerCase();
    let result = items;
    if (query) {
      result = items.filter((i) => i.name.toLowerCase().includes(query));
    }

    return [...result].sort((a, b) => {
      switch (sortMode) {
        case "name_desc":
          return a.name.localeCompare(b.name, "ja");
        case "len_asc":
          return (
            a.name.length - b.name.length || a.name.localeCompare(b.name, "ja")
          );
        case "len_desc":
          return (
            b.name.length - a.name.length || a.name.localeCompare(b.name, "ja")
          );

        case "created_at_asc":
          return a.createdAt.localeCompare(b.createdAt);
        case "created_at_desc":
          return b.createdAt.localeCompare(a.createdAt);
        case "name_asc":
        default:
          return a.name.localeCompare(b.name, "ja");
      }
    });
  }, [items, search, sortMode, selectedIds]);

  const displayItems = filteredAndSorted.slice(0, displayLimit);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30) {
      if (displayLimit < filteredAndSorted.length)
        setDisplayLimit((prev) => prev + 40);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {label}
        </label>
        <span className="text-[9px] text-zinc-400">
          {filteredAndSorted.length}件
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 max-h-24 overflow-y-auto custom-scrollbar">
          {items
            .filter((i) => selectedIds.includes(i.id))
            .map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-900/50 shadow-sm"
              >
                {item.name}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggle(item);
                  }}
                  className="hover:text-red-500 transition-colors ml-0.5"
                  type="button"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
            {ICONS.search}
          </span>
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>

        {/* Recognizable Sorting Button Overlay */}
        <div className="relative flex items-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-sm shrink-0 group hover:border-zinc-400 transition-colors cursor-pointer overflow-hidden min-w-[90px]">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer appearance-none"
          >
            <option value="name_asc">A-Z</option>
            <option value="name_desc">Z-A</option>
            <option value="id_asc">ID↑</option>
            <option value="id_desc">ID↓</option>
            <option value="len_asc">長さ↑</option>
            <option value="len_desc">長さ↓</option>
            <option value="selected_top">優先 ★</option>
          </select>

          <div className="flex items-center justify-between w-full pointer-events-none z-10 gap-1.5">
            <div className="flex items-center gap-1 overflow-hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-400 shrink-0"
              >
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="15" y1="12" x2="3" y2="12"></line>
                <line x1="9" y1="18" x2="3" y2="18"></line>
              </svg>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 truncate">
                {sortLabels[sortMode]}
              </span>
            </div>
            <svg
              className="h-3 w-3 text-zinc-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 bg-slate-50/30 dark:bg-zinc-800/20 custom-scrollbar"
      >
        {displayItems.length > 0 ? (
          displayItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2.5 p-2 cursor-pointer rounded-lg transition-all ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-white dark:hover:bg-zinc-700"
                }`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  checked={isSelected}
                  onChange={() => onToggle(item)}
                  className={`h-4 w-4 text-blue-600 border-zinc-300 ${
                    multi ? "rounded-sm" : "rounded-full"
                  }`}
                />
                <div className="flex flex-col overflow-hidden">
                  <span
                    className={`text-[11px] leading-tight truncate font-medium ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.name}
                  </span>
                  {/* {item.subtext && (
                    <span className="text-[9px] text-slate-400 truncate font-mono">
                      {item.subtext}
                    </span>
                  )} */}
                </div>
              </label>
            );
          })
        ) : (
          <div className="p-6 text-center text-[10px] text-slate-400 italic">
            見つかりません
          </div>
        )}
        {displayLimit < filteredAndSorted.length && (
          <div className="py-2 text-center text-[9px] text-zinc-400 font-bold uppercase animate-pulse">
            さらに読み込み中...
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchablePicker;
