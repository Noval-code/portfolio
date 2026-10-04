import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./client";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Builder untuk generate URL gambar Sanity (resize, crop, format webp, dst). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
