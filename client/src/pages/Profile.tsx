import { Layout } from '@/components/layout/Layout';
import { useUserStore } from '@/lib/userContext';
import { userApi } from '@/lib/userApi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { name, setUserName } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      await userApi.updateProfile(newName);
      setUserName(newName);
      setIsEditing(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      toast.error('Failed to update name');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Your Profile</h1>

        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div>
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

          <div className="mt-8 p-4 bg-muted/50 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">How it works</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your name is saved to your session. Each user who opens this app gets their own unique session and reminders. Your data is completely separate from other users.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
