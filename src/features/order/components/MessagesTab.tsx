import { useDataContext } from "@/src/components/providers/dataProvider";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import React, { useEffect, useState } from "react";

const MessagesTab = () => {
  const [replyText, setReplyText] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );

  const { complaintList, fetchComplaintList, currentBranchId } =
    useDataContext();

  useEffect(() => {
    fetchComplaintList();
  }, [currentBranchId]);

  const handleSendReply = () => {
    if (selectedComplaintId && replyText) {
      //   onReplyComplaint(selectedComplaintId, replyText);
      setReplyText("");
      setSelectedComplaintId(null);
    }
  };
  const displayList = complaintList[currentBranchId] ?? [];
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
        本部への連絡・報告
      </h3>
      {displayList.length === 0 ? (
        <p className="text-slate-500">メッセージはありません。</p>
      ) : (
        displayList.map((comp) => (
          <Card key={comp.id} className="border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white">
                {comp.title}
              </h4>
              <span className="text-xs text-slate-400">{comp.createdAt}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {comp.content}
            </p>

            {comp.response ? (
              <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                <p className="text-xs font-bold text-slate-500 mb-1">
                  本部からの回答:
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {comp.response}
                </p>
              </div>
            ) : (
              <div className="mt-4 border-t pt-4 dark:border-zinc-700">
                {selectedComplaintId === comp.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 border rounded px-3 py-1 text-sm dark:bg-zinc-900 dark:border-zinc-700"
                      placeholder="返信を入力..."
                    />
                    <Button size="sm" onClick={handleSendReply}>
                      送信
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedComplaintId(null)}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedComplaintId(comp.id)}
                  >
                    返信する
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default MessagesTab;
