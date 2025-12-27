import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";
import { Attribute } from "@/src/entities/attr/type";
import { useState } from "react";
type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (attr: Omit<Attribute, "id" | "value">) => void;
};
const AttrCreateModal = ({ open, onClose, onSave }: Props) => {
  const [name, setname] = useState("");
  const [unit, setunit] = useState("");
  function handleClick() {
    if (!name) return;
    onSave({
      name,
      unit,
    });
    setunit("");
    setname("");
  }
  return (
    <Modal isOpen={open} onClose={onClose} title={`新規属性を追加`}>
      <div className="space-y-4">
        <Input
          label="名前"
          value={name}
          onChange={(e) => setname(e.target.value)}
          placeholder={`属性名を入力`}
        />

        <Input
          label="単位 (Unit)"
          value={unit}
          onChange={(e) => setunit(e.target.value)}
          placeholder="例: cm, kg, GB (任意)"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleClick}>保存</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AttrCreateModal;
