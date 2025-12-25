const CategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { name: string; parentId?: string }) => void;
  categories: Category[];
  categoryToEdit?: Category;
}> = ({ isOpen, onClose, onSave, categories, categoryToEdit }) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setParentId(categoryToEdit.parentId || "");
    } else {
      setName("");
      setParentId("");
    }
  }, [categoryToEdit, isOpen]);

  const handleSave = () => {
    if (name) {
      onSave({ name, parentId: parentId || undefined });
      setName("");
      setParentId("");
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    setParentId("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={categoryToEdit ? "カテゴリ名を編集" : "新規カテゴリを追加"}
    >
      <div className="space-y-4">
        <Input
          label="カテゴリ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {!categoryToEdit && (
          <Select
            label="親カテゴリ (任意)"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">(なし)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getCategoryPath(c.id, categories)}
              </option>
            ))}
          </Select>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </Modal>
  );
};
