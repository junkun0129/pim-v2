  {isSimpleManager && (
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={`新規${singularTitle}を追加`}
        >
          <div className="space-y-4">
            <Input
              label="名前"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`${singularTitle}名を入力`}
            />
            {title === "属性" && (
              <Input
                label="単位 (Unit)"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="例: cm, kg, GB (任意)"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsItemModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveItem}>保存</Button>
            </div>
          </div>
        </Modal>
      )}
  
  const renderSimpleList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => {
        // Determine display info based on type
        const attr = title === "属性" ? (item as Attribute) : null;
        return (
          <Card key={item.id} className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-white">
                {item.name}
              </span>
              {attr && attr.unit && (
                <span className="text-xs text-slate-400">
                  単位: {attr.unit}
                </span>
              )}
            </div>
            {canDelete && (
              <Button
                onClick={() => onDelete(item.id)}
                variant="danger"
                size="sm"
              >
                {ICONS.trash}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
