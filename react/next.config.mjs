/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: false,
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx', 'md', 'glsl', 'vert', 'frag'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
            test: /\.glsl$/,
            use: 'raw-loader',
        });

        // Add Three.js file extensions to the list of watched files
        if (!isServer) {
            config.resolve.extensions.push('.glsl', '.vert', '.frag');
        }

        return config;
    },
    async headers() { //allow godot4 to be served in development
    return [
        {
        source: '/(.*)',
        headers: [
            {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
            },
            {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
            },
        ],
        },
    ];
    },
};

export default nextConfig;
