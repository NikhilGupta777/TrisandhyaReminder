import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { webAlarmStorage, type WebAlarm } from "@/lib/webAlarmStorage";
import { useToast } from "@/hooks/use-toast";

const WEEK_DAYS = [
  { id: 0, label: 'S', fullLabel: 'Sunday' },
  { id: 1, label: 'M', fullLabel: 'Monday' },
  { id: 2, label: 'T', fullLabel: 'Tuesday' },
  { id: 3, label: 'W', fullLabel: 'Wednesday' },
  { id: 4, label: 'T', fullLabel: 'Thursday' },
  { id: 5, label: 'F', fullLabel: 'Friday' },
  { id: 6, label: 'S', fullLabel: 'Saturday' },
];

export default function TempAlarms() {
  const { toast } = useToast();
  const [alarms, setAlarms] = useState<WebAlarm[]>([]);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<WebAlarm | null>(null);

  // Form state
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('06:00');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = () => {
    const allAlarms = webAlarmStorage.getAllAlarms();
    setAlarms(allAlarms);
  };

  const toggleAlarm = (id: string, enabled: boolean) => {
    webAlarmStorage.updateAlarm(id, { enabled });
    loadAlarms();
    toast({ title: enabled ? "Alarm enabled" : "Alarm disabled" });
  };

  const deleteAlarm = (id: string) => {
    webAlarmStorage.deleteAlarm(id);
    loadAlarms();
    toast({ title: "Alarm deleted" });
  };

  const openAddDialog = () => {
    setEditingAlarm(null);
    setLabel('');
    setTime('06:00');
    setRepeatDays([]);
    setVolume(80);
    setShowAddEdit(true);
  };

  const openEditDialog = (alarm: WebAlarm) => {
    setEditingAlarm(alarm);
    setLabel(alarm.label);
    setTime(alarm.time);
    setRepeatDays(alarm.repeatDays);
    setVolume(alarm.volume);
    setShowAddEdit(true);
  };

  const saveAlarm = () => {
    if (editingAlarm) {
      webAlarmStorage.updateAlarm(editingAlarm.id, {
        label,
        time,
        repeatDays,
        volume,
      });
      toast({ title: "Alarm updated" });
    } else {
      webAlarmStorage.createAlarm({
        label: label || 'Alarm',
        time,
        enabled: true,
        repeatDays,
        toneName: 'Default',
        volume,
        snoozeMinutes: 5,
      });
      toast({ title: "Alarm created" });
    }
    setShowAddEdit(false);
    loadAlarms();
  };

  const toggleRepeatDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const formatRepeatDays = (days: number[]) => {
    if (days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    return days.map(d => WEEK_DAYS[d].label).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Alarms</h1>
          <Button
            onClick={openAddDialog}
            size="icon"
            className="rounded-full h-12 w-12"
            data-testid="button-add-alarm"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Alarm List */}
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No alarms set</p>
            <p className="text-sm mt-2">Tap + to add your first alarm</p>
          </div>
        ) : (
          alarms.map(alarm => (
            <div
              key={alarm.id}
              className="bg-card border rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              data-testid={`alarm-item-${alarm.id}`}
            >
              <div className="flex-1" onClick={() => openEditDialog(alarm)} style={{ cursor: 'pointer' }}>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`text-5xl font-light tabular-nums ${!alarm.enabled ? 'text-muted-foreground' : ''}`}>
                    {alarm.time}
                  </span>
                </div>
                <div className={`text-sm ${!alarm.enabled ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {alarm.label || 'Alarm'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatRepeatDays(alarm.repeatDays)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAlarm(alarm.id);
                  }}
                  data-testid={`button-delete-${alarm.id}`}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
                <Switch
                  checked={alarm.enabled}
                  onCheckedChange={(checked) => toggleAlarm(alarm.id, checked)}
                  data-testid={`switch-${alarm.id}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAlarm ? 'Edit Alarm' : 'Add Alarm'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Time Picker */}
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-4xl font-light text-center h-20"
                data-testid="input-time"
              />
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Alarm name"
                data-testid="input-label"
              />
            </div>

            {/* Repeat Days */}
            <div className="space-y-2">
              <Label>Repeat</Label>
              <div className="flex gap-2 justify-between">
                {WEEK_DAYS.map(day => (
                  <Button
                    key={day.id}
                    variant={repeatDays.includes(day.id) ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                    onClick={() => toggleRepeatDay(day.id)}
                    data-testid={`button-day-${day.id}`}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              {repeatDays.length === 0 && (
                <p className="text-xs text-muted-foreground">No repeat - alarm will ring once</p>
              )}
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label>Volume: {volume}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full"
                data-testid="slider-volume"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={saveAlarm}
              className="w-full"
              data-testid="button-save"
            >
              {editingAlarm ? 'Update Alarm' : 'Add Alarm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}