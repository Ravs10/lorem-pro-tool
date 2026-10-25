/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // .node files ko ignore karo - Yehi error fix hai
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });

    // Sharp aur onnx ko client pe mat bundle karo
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      sharp: false,
      "onnxruntime-node": false,
    };

    // Server pe transformers ko external rakho
    if (isServer) {
      config.externals = [...(config.externals || []), 
        "@xenova/transformers",
        "sharp",
        "onnxruntime-node"
      ];
    }

    // .node files ko ignore
    config.externals.push({
      "sharp": "commonjs sharp",
      "onnxruntime-node": "commonjs onnxruntime-node"
    });

    return config;
  },
  // Experimental
  experimental: {
    esmExternals: true,
  }
};

module.exports = nextConfig;
