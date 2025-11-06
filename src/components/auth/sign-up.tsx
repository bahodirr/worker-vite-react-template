import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export function SignUp() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("signUp");
    try {
      const result = await signIn("password", { email, password, name, flow: "signUp" });
      if (result.signingIn) {
        toast.success("Signed up successfully!");
        navigate("/");
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      let friendly = "Sign up failed";
      if (raw.includes("already exists")) {
        friendly = "An account with this email already exists. Try Sign In.";
      } else if (raw.includes("Invalid password")) {
        friendly = "Password must be at least 8 characters.";
      } else if (raw.includes("Missing `password`")) {
        friendly = "Password is required.";
      } else if (raw.includes("Missing `flow`")) {
        friendly = "Internal error: missing sign-up flow.";
      }
      toast.error(friendly);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-0 shadow-none rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>It’s quick and easy. Start by entering your details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading === "signUp"}>
              {loading === "signUp" ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/sign-in')}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </div>
      </Card>
    </div>
  );
}

