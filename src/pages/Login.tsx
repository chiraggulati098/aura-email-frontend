import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AURA Email</h1>
          <p className="mt-2 text-gray-600">Sign in to access your inbox</p>
        </div>
        <Button
          className="w-full py-6 bg-email-primary hover:bg-email-secondary flex items-center justify-center gap-2"
          onClick={login}
        >
          <img src="/google.svg" alt="Google" className="w-6 h-6" />
          Login with Google
        </Button>
      </div>
    </div>
  );
}
