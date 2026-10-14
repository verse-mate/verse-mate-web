import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, type ReactNode, Suspense, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

export type Variant = { theme?: string; locale?: string };

export type ProductUi = {
  Providers: (props: { children: ReactNode }) => ReactNode;
  applyVariant?: (variant: Variant) => void;
  onStateChange?: () => void;
};

const AppProvider = lazy(() => import("@/contexts/AppContext").then((m) => ({ default: m.AppProvider })));

function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Suspense fallback={null}>
          <AppProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>{children}</BrowserRouter>
          </AppProvider>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export const productUi: ProductUi = { Providers };
