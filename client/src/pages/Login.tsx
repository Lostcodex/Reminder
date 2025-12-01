import { useState } from 'react';
import { useUserStore } from '@/lib/userContext';
import { userApi } from '@/lib/userApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { setToken, setUserData } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await userApi.login(username, password);
      setToken(result.token);
      setUserData(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      setLocation('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
          <h1 className="text-3xl font-display font-bold mb-2 text-center">Daily Reminders</h1>
          <p className="text-muted-foreground text-center mb-8">Login to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-white text-black border border-gray-300 focus:border-primary placeholder:text-gray-400"
                disabled={loading}
                data-testid="input-username"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-white text-black border border-gray-300 focus:border-primary placeholder:text-gray-400"
                disabled={loading}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold mt-6"
              data-testid="button-login"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => setLocation('/register')}
                className="text-primary font-semibold hover:underline"
                data-testid="link-register"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
