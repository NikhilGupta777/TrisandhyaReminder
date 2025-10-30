import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Settings, Bell, BellOff } from 'lucide-react';
import { useWebAlarmSystem } from '@/hooks/use-web-alarm-system';
import { AddEditAlarmDialog } from '@/components/alarms/AddEditAlarmDialog';
import { AlarmRingScreen } from '@/components/alarms/AlarmRingScreen';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { IndexedDBAlarm } from '@/lib/indexedDBAlarmStorage';
import { useToast } from '@/hooks/use-toast';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AlarmsNew() {
  const { toast } = useToast();
  const {
    alarms,
    activeAlarm,
    hasPermission,
    isInitialized,
    toggleAlarm,
    deleteAlarm,
    dismissAlarm,
    snoozeAlarm,
    requestPermission,
  } = useWebAlarmSystem();

  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<IndexedDBAlarm | null>(null);

  const handleToggleAlarm = async (id: string, enabled: boolean) => {
    try {
      await toggleAlarm(id, enabled);
      toast({
        title: enabled ? 'Alarm enabled' : 'Alarm disabled',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle alarm',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlarm = async (id: string, label: string) => {
    if (confirm(`Delete alarm "${label}"?`)) {
      try {
        await deleteAlarm(id);
        toast({
          title: 'Alarm deleted',
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete alarm',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditAlarm = (alarm: IndexedDBAlarm) => {
    setEditingAlarm(alarm);
    setShowAddEdit(true);
  };

  const handleAddNew = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: 'Permission Required',
          description: 'Please enable notifications to use alarms',
          variant: 'destructive',
        });
        return;
      }
    }
    setEditingAlarm(null);
    setShowAddEdit(true);
  };

  const handleDialogClose = () => {
    setShowAddEdit(false);
    setEditingAlarm(null);
  };

  const formatRepeatDays = (days: number[]) => {
    if (days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => WEEK_DAYS[d]).join(', ');
  };

  const getNextOccurrence = (alarm: IndexedDBAlarm): string => {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    if (alarm.repeatDays.length === 0) {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (next.toDateString() === now.toDateString()) {
        return 'Today';
      } else if (next.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return formatRepeatDays(alarm.repeatDays);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black dark:bg-black text-white">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" text="Initializing alarm system..." />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black dark:bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight">Alarm</h1>
              {!hasPermission && (
                <p className="text-xs text-red-400 mt-1">Notifications disabled</p>
              )}
            </div>
            <Button
              onClick={handleAddNew}
              size="icon"
              variant="ghost"
              className="rounded-full h-12 w-12 text-orange-500 hover:bg-white/10"
              data-testid="button-add-alarm"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        </div>

        {/* Permission Warning */}
        {!hasPermission && (
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <BellOff className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-400">Notifications Disabled</h3>
                <p className="text-sm text-red-300/70 mt-1">
                  Enable notifications to receive alarm alerts
                </p>
                <Button
                  onClick={requestPermission}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  data-testid="button-enable-notifications"
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Alarm List */}
        <div className="max-w-4xl mx-auto px-4 py-2 space-y-1">
          {alarms.length === 0 ? (
            <div className="text-center py-24">
              <Clock className="h-24 w-24 mx-auto mb-6 text-white/10" />
              <h2 className="text-xl font-light text-white/50 mb-2">No alarms</h2>
              <p className="text-sm text-white/30 mb-6">Tap + to create your first alarm</p>
            </div>
          ) : (
            alarms
              .sort((a, b) => {
                const [aH, aM] = a.time.split(':').map(Number);
                const [bH, bM] = b.time.split(':').map(Number);
                return aH * 60 + aM - (bH * 60 + bM);
              })
              .map((alarm) => (
                <div
                  key={alarm.id}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl p-5 transition-all hover:bg-white/8 border ${
                    alarm.enabled ? 'border-white/10' : 'border-white/5'
                  }`}
                  data-testid={`alarm-card-${alarm.id}`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Time and details */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleEditAlarm(alarm)}
                      data-testid={`alarm-time-${alarm.id}`}
                    >
                      <div className="flex items-baseline gap-3 mb-1">
                        <span
                          className={`text-6xl font-extralight tabular-nums tracking-tight ${
                            alarm.enabled ? 'text-white' : 'text-white/30'
                          }`}
                        >
                          {alarm.time}
                        </span>
                      </div>
                      <div
                        className={`text-sm mt-2 ${
                          alarm.enabled ? 'text-white/70' : 'text-white/30'
                        }`}
                      >
                        {alarm.label || 'Alarm'}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {getNextOccurrence(alarm)}
                      </div>
                    </div>

                    {/* Right side - Toggle */}
                    <div className="flex flex-col items-end gap-3">
                      <Switch
                        checked={alarm.enabled}
                        onCheckedChange={(checked) => handleToggleAlarm(alarm.id, checked)}
                        className="data-[state=checked]:bg-orange-500"
                        data-testid={`switch-alarm-${alarm.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>

      {/* Add/Edit Dialog */}
      <AddEditAlarmDialog
        open={showAddEdit}
        onOpenChange={setShowAddEdit}
        editingAlarm={editingAlarm}
        onClose={handleDialogClose}
        onDelete={handleDeleteAlarm}
      />

      {/* Alarm Ring Screen */}
      {activeAlarm && (
        <AlarmRingScreen
          alarm={activeAlarm}
          onDismiss={dismissAlarm}
          onSnooze={(customMinutes) => snoozeAlarm(customMinutes)}
        />
      )}
    </>
  );
}
