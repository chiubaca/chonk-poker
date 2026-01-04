import { QueryClient } from "@tanstack/react-query";

let clientQueryClientSingleton: QueryClient | undefined;

export function getQueryClient() {
	if (clientQueryClientSingleton) {
		return clientQueryClientSingleton;
	}

	clientQueryClientSingleton = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		},
	});
	return clientQueryClientSingleton;
}
