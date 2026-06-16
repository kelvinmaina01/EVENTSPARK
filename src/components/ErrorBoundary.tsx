import React from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled application error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <Logo size="lg" />
          <div className="mt-8 rounded-lg border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold text-primary">Something went wrong</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Hostquill could not load this view.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Refresh the page. If it happens again, capture the page URL and the action that triggered it.
            </p>
            <Button className="mt-6 rounded-full bg-[#19192E] text-white hover:bg-[#19192E]/90" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          </div>
        </main>
      </div>
    );
  }
}
