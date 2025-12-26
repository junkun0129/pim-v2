import React from "react";

const renderAttributeSets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => {
        const set = item as AttributeSet;
        return (
          <Card key={set.id} className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-lg text-slate-800 dark:text-white">
                  {set.name}
                </span>
                {canDelete && (
                  <Button
                    onClick={() => onDelete(set.id)}
                    variant="danger"
                    size="sm"
                  >
                    {ICONS.trash}
                  </Button>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  属性:
                </h4>
                {set.attributeIds.length > 0 ? (
                  <div className="flex flex-wrap items-start gap-1">
                    {set.attributeIds.map((attrId) => {
                      const isShared = set.sharedAttributeIds?.includes(attrId);
                      const attr = dataMap?.attributes.find(
                        (a) => a.id === attrId
                      );
                      return (
                        <Badge
                          key={attrId}
                          color={isShared ? "purple" : "gray"}
                          title={isShared ? "シリーズ共通属性" : "SKU独自属性"}
                        >
                          {attr?.name}
                          {attr?.unit ? ` (${attr.unit})` : ""}
                          {isShared && " ★"}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    属性がありません
                  </p>
                )}
              </div>
            </div>
            {canEdit && (
              <Button
                onClick={() => openAttributeModal(set)}
                variant="secondary"
                size="sm"
                className="w-full mt-4"
              >
                属性を編集
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );

export default AttrSetPage;
