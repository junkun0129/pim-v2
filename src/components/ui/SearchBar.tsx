const renderSearchBar = () => (
  <div className="relative flex-grow max-w-md">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
      {ICONS.search}
    </span>
    <input
      type="text"
      placeholder={`${title}を検索...`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-1 focus:ring-zinc-500 outline-none"
    />
  </div>
);
