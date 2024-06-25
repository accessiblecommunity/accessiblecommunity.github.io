
/**
 * Taken and adapted from
 * https://github.com/withastro/astro/blob/7c59f043b235464e7427467f538b3ec9b05f08e5/packages/astro/src/virtual-modules/container.ts#L17
 */
// export async function loadRenderers(renderers: AstroRenderer[]) {
import { isNil } from 'lodash-es';

export async function loadRenderers(renderers) {
	const loadedRenderers = await Promise.all(
		renderers.map(async (renderer) => {
			const mod = await import(renderer.serverEntrypoint);
			if (typeof mod.default !== 'undefined') {
				return {
					...renderer,
					ssr: mod.default,
				// } as SSRLoadedRenderer;
				};
			}
			return undefined;
		})
	);

	return loadedRenderers.filter((r) => !isNil(r));
}