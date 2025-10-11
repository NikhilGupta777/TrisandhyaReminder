import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import deityImage from "@assets/stock_images/lord_jagannath_deity_12203068.jpg";

type AlarmInterfaceProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sandhyaName: string;
};

export function AlarmInterface({ open, onOpenChange, sandhyaName }: AlarmInterfaceProps) {
  const handleBeginSadhana = () => {
    console.log("Begin Sadhana clicked");
    onOpenChange(false);
  };

  const handleDismiss = () => {
    console.log("Alarm dismissed");
    onOpenChange(false);
  };

  const handleSnooze = () => {
    console.log("Snoozed for 5 minutes");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen p-0 border-0">
        <div className="relative h-full w-full flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${deityImage})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          
          <div className="relative z-10 text-center space-y-8 px-6">
            <h1 className="text-5xl font-bold font-serif text-white drop-shadow-lg" data-testid="text-sandhya-name">
              {sandhyaName}
            </h1>
            
            <div className="flex flex-col gap-4 items-center mt-12">
              <Button
                size="lg"
                className="px-12 py-6 text-lg rounded-full"
                onClick={handleBeginSadhana}
                data-testid="button-begin-sadhana"
              >
                Begin Sadhana
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-lg rounded-full backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleDismiss}
                data-testid="button-dismiss-alarm"
              >
                Dismiss
              </Button>
            </div>

            <div className="mt-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white"
                onClick={handleSnooze}
                data-testid="button-snooze"
              >
                Snooze for 5 minutes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
