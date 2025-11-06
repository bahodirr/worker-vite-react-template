import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SignIn() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      formData.set("flow", "signIn");
      const result = await signIn("password", formData);
      if (result.signingIn) {
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      let friendly = "Sign in failed";
      if (raw.includes("InvalidAccountId")) {
        friendly = "No account found for this email. Try Sign Up.";
      } else if (raw.includes("InvalidSecret") || raw.includes("Invalid credentials")) {
        friendly = "Incorrect password.";
      } else if (raw.includes("TooManyFailedAttempts")) {
        friendly = "Too many failed attempts. Try again later.";
      } else if (raw.includes("Provider") && raw.includes("not configured")) {
        friendly = "Auth provider not configured on the server.";
      }
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signIn("anonymous");
      toast.success("Signed in anonymously!");
      navigate("/");
    } catch (error) {
      toast.error("Anonymous sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleAnonymousSignIn}
          disabled={loading}
        >
          Sign in anonymously
        </Button>
      </CardContent>
    </Card>
  );
}

