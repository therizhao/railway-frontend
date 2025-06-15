import React, { Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { LoginView } from "@/components/section/login-view";

type Props = {
    children: React.ReactNode
}

export default function AppGate({children}: Props) {
    const { isAuth } = useAuth();

    if (isAuth === null) {
        return <div className="p-6">Authenticating…</div>;
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
