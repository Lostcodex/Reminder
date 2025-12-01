import { useState } from 'react';
import { useUserStore } from '@/lib/userContext';
import { userApi } from '@/lib/userApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { setToken, setUserData } = useUserStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await userApi.register(username, password, name);
      setToken(result.token);
      setUserData(result.user);
      toast.success(`Welcome, ${result.user.name}!`);
      setLocation('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
          <h1 className="text-3xl font-display font-bold mb-2 text-center">Create Account</h1>
          <p className="text-muted-foreground text-center mb-8">Join Daily Reminders today</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white"
                disabled={loading}
                data-testid="input-name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Username</label>
              <Input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white"
                disabled={loading}
                data-testid="input-reg-username"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white"
                disabled={loading}
                data-testid="input-reg-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold mt-6"
              data-testid="button-register"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => setLocation('/login')}
                className="text-primary font-semibold hover:underline"
                data-testid="link-login"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
