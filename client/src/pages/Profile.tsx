import { Layout } from '@/components/layout/Layout';
import { useUserStore } from '@/lib/userContext';
import { userApi } from '@/lib/userApi';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, LogOut, Calendar, CheckCircle2, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function Profile() {
  const { name, username, id, logout } = useUserStore();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch reminders for stats
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.reminders.getAll(),
  });

  const totalReminders = reminders.length;
  const completedReminders = reminders.filter(r => r.completed).length;

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      await userApi.updateProfile(newName);
      useUserStore.getState().setUserData({
        id: id!,
        username: username!,
        name: newName,
      });
      setIsEditing(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      toast.error('Failed to update name');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setLocation('/login');
  };

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Your Profile</h1>

        {/* Profile Card */}
        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</p>
              <p className="text-2xl font-bold">{name}</p>
            </div>
          </div>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90"
              data-testid="button-edit-name"
            >
              Edit Name
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                data-testid="input-name"
                className="h-12 rounded-2xl bg-muted/30 border-transparent focus:bg-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90"
                  data-testid="button-save-name"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(name);
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="font-semibold text-foreground" data-testid="text-username">{username}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="font-mono text-xs text-foreground" data-testid="text-userid">{id?.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ListTodo size={20} className="text-blue-500" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
            <p className="text-3xl font-bold" data-testid="stat-total-reminders">{totalReminders}</p>
            <p className="text-xs text-muted-foreground mt-1">Reminders</p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-500" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
            </div>
            <p className="text-3xl font-bold" data-testid="stat-completed-reminders">{completedReminders}</p>
            <p className="text-xs text-muted-foreground mt-1">Done</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </Layout>
  );
}
