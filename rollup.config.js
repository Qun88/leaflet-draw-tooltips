import { readFileSync } from 'fs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * @license ${pkg.license}
 * @copyright (c) 2025
 * @author ${pkg.author}
 */`;

const minBanner = `/* ${pkg.name} v${pkg.version} | ${pkg.license} */`;

const commonConfig = {
  input: 'src/index.js',
  external: ['leaflet'],
  plugins: [
    // 只在第一个构建中复制 CSS 文件一次
    copy({
      targets: [
        { src: 'src/leaflet-draw-hint.css', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ]
};

export default [
  // ES Module - 未压缩
  {
    ...commonConfig,
    output: {
      file: 'dist/leaflet-draw-tooltip.js',
      format: 'es',
      banner
    }
  },
  
  // ES Module - 压缩
  {
    ...commonConfig,
    output: {
      file: 'dist/leaflet-draw-tooltip.min.js',
      format: 'es',
      banner: minBanner
    },
    plugins: [
      ...commonConfig.plugins,
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2,
          ecma: 2015
        },
        mangle: {
          toplevel: true
        },
        format: {
          comments: false,
          ecma: 2015
        }
      })
    ]
  },
  
  // UMD - 未压缩
  {
    ...commonConfig,
    output: {
      file: 'dist/leaflet-draw-tooltip.umd.cjs',
      format: 'umd',
      name: 'LeafletDrawTooltip',
      banner,
      globals: {
        leaflet: 'L'
      }
    }
  },
  
  // UMD - 压缩
  {
    ...commonConfig,
    output: {
      file: 'dist/leaflet-draw-tooltip.min.umd.cjs',
      format: 'umd',
      name: 'LeafletDrawTooltip',
      banner: minBanner,
      globals: {
        leaflet: 'L'
      }
    },
    plugins: [
      ...commonConfig.plugins,
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2,
          ecma: 2015
        },
        mangle: {
          toplevel: false  // UMD 不压缩顶层，避免破坏导出
        },
        format: {
          comments: false,
          ecma: 2015
        }
      })
    ]
  }
];
