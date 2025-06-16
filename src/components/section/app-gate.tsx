import React, { Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { LoginView } from "@/components/section/login-view";
import { Loader } from "lucide-react";

type Props = {
    children: React.ReactNode
}

export default function AppGate({ children }: Props) {
    const { isAuth } = useAuth();

    if (isAuth === null) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }; // checking

    if (!isAuth) {
        return <LoginView />;
    }; // not logged in

    return (
        <Suspense fallback="Loading…">
            {children}
        </Suspense>
    );
}
