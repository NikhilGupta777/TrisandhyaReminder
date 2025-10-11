import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export function SadhanaChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "pratah", label: "Pratah Sandhya", completed: false },
    { id: "madhyahna", label: "Madhyahna Sandhya", completed: false },
    { id: "sayam", label: "Sayam Sandhya", completed: false },
    { id: "mahapuran", label: "Shrimad Bhagwat Mahapuran", completed: false },
    { id: "jap", label: "Madhav Naam Jap", completed: false },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Card className="p-6 space-y-4" data-testid="sadhana-checklist">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today's Sadhana</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{completedCount}/{items.length}</span>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2 cursor-pointer transition-colors"
            onClick={() => toggleItem(item.id)}
            data-testid={`checklist-item-${item.id}`}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
              className="h-5 w-5"
            />
            <label className={`flex-1 cursor-pointer ${item.completed ? "line-through text-muted-foreground" : ""}`}>
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
