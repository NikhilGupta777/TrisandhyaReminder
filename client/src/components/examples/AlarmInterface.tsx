import { useState } from "react";
import { AlarmInterface } from "../AlarmInterface";
import { Button } from "@/components/ui/button";

export default function AlarmInterfaceExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Show Alarm</Button>
      <AlarmInterface
        open={open}
        onOpenChange={setOpen}
        sandhyaName="Pratah Sandhya"
      />
    </div>
  );
}
