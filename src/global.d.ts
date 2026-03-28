import type { AstroIntegration } from "@swup/astro";

declare global {
	interface Window {
		swup: AstroIntegration;
		fetchUmamiStats: (
			baseUrl: string,
			shareId: string,
			queryParams: { timezone: string; path: string }
		) => Promise<{ pageviews?: { value: number } | number }>;
	}
}
