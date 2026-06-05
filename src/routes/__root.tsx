import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { getQueryClient } from "@/infrastructure/query-client";
import "@fontsource/coming-soon";
import "@fontsource/comic-mono";

// import { getThemeFromCookies, getThemeServerFn } from "@/shared/utils/theme";

import appCss from "../shared/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Chonk Poker",
      },
      {
        name: "google-site-verification",
        content: "Nkxel-AnDIJp4RkauYqn15oRaNUHxmuMYPZocCYCE3E",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  // beforeLoad: async () => {
  // 	const theme = await getThemeServerFn();
  // 	return { theme };
  // },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const theme = "dracula";

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>😸</text></svg>"
        />

        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <footer className="bg-base-200 border-t border-base-300 py-4">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4 text-sm opacity-60">
              <span>© Chonk Poker</span>
              <Link to="/home" className="link link-primary">
                About
              </Link>
              <Link to="/terms" className="link link-primary">
                Terms
              </Link>
              <Link to="/privacy" className="link link-primary">
                Privacy
              </Link>
            </div>
          </footer>
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: "React Query",
                render: <ReactQueryDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}
