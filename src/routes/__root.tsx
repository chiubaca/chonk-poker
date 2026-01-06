import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { getQueryClient } from "@/infrastructure/query-client";
import { getThemeServerFn } from "@/shared/utils/theme";

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
				title: "😼 Chonk Poker",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async () => {
		const theme = await getThemeServerFn();
		return { theme };
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const theme = Route.useRouteContext()?.theme || "dracula";

	return (
		<html lang="en" data-theme={theme}>
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					{children}
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
