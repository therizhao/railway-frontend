import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { RailwayLogo } from "../ui/logo";
import { Eye, EyeOff } from "lucide-react";

export function LoginView() {
    const { login } = useAuth();
    const pwdRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const ok = await login(pwdRef.current?.value ?? "");
            if (!ok) {
                setError("Wrong password")
            }
        } catch (err) {
            setError("Unexpected error")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-muted">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-lg bg-background p-8 shadow"
            >
                <div className="mb-6 flex gap-4">
                    <RailwayLogo />
                    <h1 className="text-l font-mono">zestful-magic</h1>
                </div>

                {/* Password field with show / hide toggle */}
                <div className="relative">
                    <Input
                        ref={pwdRef}
                        type={showPwd ? "text" : "password"}
                        placeholder="Password"
                        required
                        autoFocus
                        className="pr-10" /* space for the eye icon */
                    />

                    <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                        {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>

                {error && (
                    <p className="text-center text-sm font-medium text-red-500">
                        {error}
                    </p>
                )}

                <Button className="w-full" type="submit" loading={loading}>
                    Enter
                </Button>
            </form>
        </div>
    );
}
