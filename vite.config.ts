import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

interface VersionManifestPayload {
  buildId: string;
  configVersion: string;
  schemaVersion: number;
  publishedAt: string;
}

function computeCanonicalConfigHash(canonicalJson: string, schemaVersion = 3): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < canonicalJson.length; i++) {
    const ch = canonicalJson.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch ^ (i & 0xff);
    h2 = Math.imul(h2, 0x811c9dc5);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `cfg-v${schemaVersion}-${hex1}${hex2}`;
}

function readCurrentStoreConfigAndManifest(rootDir: string): {
  manifest: VersionManifestPayload;
  config: Record<string, unknown>;
} {
  const storeConfigPath = path.resolve(rootDir, 'src/config/storeConfig.ts');
  const rawContent = fs.readFileSync(storeConfigPath, 'utf-8');
  const stat = fs.statSync(storeConfigPath);

  const match = rawContent.match(
    /export\s+const\s+INITIAL_STORE_CONFIG\s*(?::\s*[A-Za-z0-9_<>]+\s*)?=\s*(\{[\s\S]*\})\s*;?\s*$/
  );

  let parsedConfig: Record<string, unknown> = {};
  if (match && match[1]) {
    const jsonCandidate = match[1].trim().replace(/;\s*$/, '');
    parsedConfig = JSON.parse(jsonCandidate) as Record<string, unknown>;
  }

  const schemaVersion =
    typeof parsedConfig.schemaVersion === 'number' ? parsedConfig.schemaVersion : 3;
  const canonicalJson = JSON.stringify(parsedConfig);
  const configVersion = computeCanonicalConfigHash(canonicalJson, schemaVersion);
  const publishedAt = stat.mtime.toISOString();
  const compactTime = publishedAt.replace(/[-:T.Z]/g, '').slice(0, 14);
  const buildId = `${compactTime}-${configVersion.slice(-8)}`;

  return {
    manifest: {
      buildId,
      configVersion,
      schemaVersion,
      publishedAt,
    },
    config: parsedConfig,
  };
}

function storeVersionManifestPlugin(): Plugin {
  const rootDir = __dirname;

  const writePublicManifestFiles = () => {
    try {
      const { manifest, config } = readCurrentStoreConfigAndManifest(rootDir);
      const publicDir = path.resolve(rootDir, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.resolve(publicDir, 'version.json'),
        JSON.stringify(manifest, null, 2) + '\n',
        'utf-8'
      );
      fs.writeFileSync(
        path.resolve(publicDir, 'published-config.json'),
        JSON.stringify(config, null, 2) + '\n',
        'utf-8'
      );
    } catch {
      // Ignore build-time manifest generation fallback errors
    }
  };

  return {
    name: 'shri-sai-store-version-manifest',
    buildStart() {
      writePublicManifestFiles();
    },
    transformIndexHtml(html) {
      try {
        const { manifest } = readCurrentStoreConfigAndManifest(rootDir);
        const metaTag = `<meta id="store-version-manifest" name="store-version" content="${manifest.configVersion}" data-build-id="${manifest.buildId}" data-published-at="${manifest.publishedAt}" data-schema-version="${manifest.schemaVersion}" />`;
        return html.replace('</head>', `    ${metaTag}\n  </head>`);
      } catch {
        return html;
      }
    },
    configureServer(server) {
      writePublicManifestFiles();
      const dynamicManifestMiddleware = (
        req: { url?: string },
        res: {
          statusCode: number;
          setHeader: (name: string, value: string) => void;
          end: (body: string) => void;
        },
        next: () => void
      ) => {
        const urlPath = (req.url || '').split('?')[0];
        if (urlPath === '/version.json' || urlPath === '/published-config.json') {
          try {
            const { manifest, config } = readCurrentStoreConfigAndManifest(rootDir);
            writePublicManifestFiles();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.end(
              JSON.stringify(urlPath === '/version.json' ? manifest : config, null, 2)
            );
            return;
          } catch {
            // Fall through to static handler if needed
          }
        }
        next();
      };
      // Register at the very beginning of the middleware stack so it precedes sirv public static serving
      server.middlewares.stack.unshift({
        route: '',
        handle: dynamicManifestMiddleware,
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '').split('?')[0];
        if (urlPath === '/version.json' || urlPath === '/published-config.json') {
          try {
            const { manifest, config } = readCurrentStoreConfigAndManifest(rootDir);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.end(
              JSON.stringify(urlPath === '/version.json' ? manifest : config, null, 2)
            );
            return;
          } catch {
            // Fall through
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), storeVersionManifestPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
