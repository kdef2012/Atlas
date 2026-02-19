
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ATLAS: Nebula',
    short_name: 'ATLAS',
    description: 'A revolutionary environment for human evolution.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://picsum.photos/seed/atlaslogo/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/atlaslogo/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
