/**
 * Next.js設定ファイル
 *
 * このファイルはNext.jsアプリケーションの設定を管理します。
 * ビルド設定、画像最適化、トランスパイル対象パッケージ、
 * 実験的機能の有効化などを設定します。
 */

// 環境変数の取得
const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // 本番環境かどうか
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // SupabaseのURL
const ENABLE_REACT_COMPILER = process.env.ENABLE_REACT_COMPILER === 'true'; // React Compilerを有効にするかどうか

/**
 * 内部パッケージのリスト
 * これらのパッケージはトランスパイル対象となり、ホットリロードが有効になります
 */
const INTERNAL_PACKAGES = [
  '@kit/shared',
  '@kit/supabase',
  '@kit/i18n',
  '@kit/next',
  '@kit/types',
  // UIパッケージはビルドエラーを避けるため、プリビルドされたものを使用
  // '@kit/ui',
];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true, // Reactの厳格モードを有効化（開発時の問題検出に役立つ）

  /** 内部パッケージをビルドステップなしでホットリロードできるようにする */
  transpilePackages: INTERNAL_PACKAGES,

  // 画像最適化の設定
  images: {
    remotePatterns: getRemotePatterns(), // リモート画像のパターン設定（関数で動的に生成）
  },

  // ロギング設定
  logging: {
    fetches: {
      fullUrl: true, // フェッチリクエストの完全なURLをログに記録
    },
  },

  serverExternalPackages: [], // サーバーサイドでバンドルから除外するパッケージ

  // ローカルコンテンツの動的インポートをサポートするために必要
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'], // コンテンツディレクトリをトレース対象に含める
  },

  // 実験的機能の設定
  experimental: {
    mdxRs: true, // Rust製のMDXパーサーを使用（パフォーマンス向上）
    reactCompiler: ENABLE_REACT_COMPILER, // React Compilerの有効化（環境変数で制御）
    turbo: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'], // Turboパックで解決する拡張子
    },
    // パッケージインポートの最適化（ツリーシェイキングの改善）
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-select',
      'date-fns',
      ...INTERNAL_PACKAGES,
    ],
  },

  // モジュラーインポートの設定（バンドルサイズ削減のため）
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}', // lodashを個別モジュールとしてインポート
    },
  },

  /** CIでは別タスクとして実行するため、ビルド時のlintとtype checkを無効化 */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;

/**
 * リモート画像のパターンを取得する関数
 *
 * 本番環境ではSupabaseのURLのみを許可し、
 * 開発環境ではローカルホストも許可します
 *
 * @returns {import('next').NextConfig['remotePatterns']} リモートパターンの配列
 */
function getRemotePatterns() {
  /** @type {import('next').NextConfig['remotePatterns']} */
  const remotePatterns = [];

  // SupabaseのURLが設定されている場合、そのホスト名を許可リストに追加
  if (SUPABASE_URL) {
    const hostname = new URL(SUPABASE_URL).hostname;

    remotePatterns.push({
      protocol: 'https',
      hostname,
    });
  }

  // 本番環境では上記のパターンのみを返し、開発環境ではローカルホストも追加
  return IS_PRODUCTION
    ? remotePatterns
    : [
        {
          protocol: 'http',
          hostname: '127.0.0.1',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
        },
      ];
}
