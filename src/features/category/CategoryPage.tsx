 const renderCategoryTree = () => {
    const categories = filteredItems as Category[]; // Note: Search on Tree is tricky, here we just filter nodes but keep tree structure if possible or just list.

    if (searchTerm) {
      return (
        <div className="space-y-2">
          {categories.map((cat) => (
            <CategoryNode
              key={cat.id}
              category={cat}
              allCategories={items as Category[]}
              onDelete={onDelete}
              onEdit={openCategoryEdit}
              onAddChild={handleAddChildCategory}
              canDelete={canDelete}
              canEdit={canEdit}
            />
          ))}
        </div>
      );
    }

    const rootCategories = (items as Category[]).filter((c) => !c.parentId);

    return (
      <div className="space-y-2">
        {rootCategories.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            allCategories={items as Category[]}
            onDelete={onDelete}
            onEdit={openCategoryEdit}
            onAddChild={handleAddChildCategory}
            canDelete={canDelete}
            canEdit={canEdit}
          />
        ))}
      </div>
    );
  };