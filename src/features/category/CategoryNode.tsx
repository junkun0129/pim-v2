const CategoryNode: React.FC<{
  category: Category;
  allCategories: Category[];
  onDelete: (id: string) => void;
  onEdit: (cat: Category) => void;
  onAddChild: (data: { name: string; parentId: string }) => void; // New prop for inline create
  canDelete: boolean;
  canEdit: boolean;
}> = ({
  category,
  allCategories,
  onDelete,
  onEdit,
  onAddChild,
  canDelete,
  canEdit,
}) => {
  const children = allCategories.filter((c) => c.parentId === category.id);
  const [isHovered, setIsHovered] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingChild && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingChild]);

  const handleCreateSubmit = () => {
    if (newChildName.trim()) {
      onAddChild({ name: newChildName, parentId: category.id });
      setNewChildName("");
      setIsCreatingChild(false);
    } else {
      setIsCreatingChild(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateSubmit();
    if (e.key === "Escape") {
      setIsCreatingChild(false);
      setNewChildName("");
    }
  };

  return (
    <div className="mb-2">
      <div
        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <span className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          )}
          <span className="font-medium text-slate-800 dark:text-white">
            {category.name}
          </span>

          {/* Inline Create Button */}
          {isHovered && canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingChild(true);
              }}
              className="ml-2 w-6 h-6 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 shadow-sm"
              title="子カテゴリを追加"
            >
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
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => onEdit(category)}
              variant="secondary"
              size="sm"
              className="px-2 py-1 h-7"
            >
              編集
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={() => onDelete(category.id)}
              variant="danger"
              size="sm"
              className="px-2 py-1 h-7"
            >
              {ICONS.trash}
            </Button>
          )}
        </div>
      </div>

      {/* Inline Input for New Child */}
      {isCreatingChild && (
        <div className="ml-6 mt-2 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-zinc-800 rounded border border-blue-200 animate-fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              className="text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreateSubmit}
              className="bg-transparent border-none focus:ring-0 text-sm w-full p-0"
              placeholder="カテゴリ名を入力..."
            />
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div className="ml-6 mt-2 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddChild={onAddChild}
              canDelete={canDelete}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};