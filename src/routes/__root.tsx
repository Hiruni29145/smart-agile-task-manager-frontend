import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/lib/theme";
import { RoleProvider } from "@/lib/role";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">This route doesn't exist.</p>
        <a href="/" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          Back home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RoleProvider>
          <TooltipProvider>
            <Outlet />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
