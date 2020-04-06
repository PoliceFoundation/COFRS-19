import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import css from 'rollup-plugin-css-only'

const production = process.env.DEV !== "true";
const watch = process.env.ROLLUP_WATCH;

console.log("Performing a " + (production ? "production" : "dev") + " build");
if (!production) console.log("Note: dev builds do not include babel transpilation");

export default {

  input: './src/index.js',

  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },

  plugins: [

    json(),
    css(),
    svelte(),
    builtins(),
    resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
    commonjs(),

    // don't transpile in dev mode, as Chrome (our dev browser) handles es6 javascript just fine, and transpiling doubles the rollup bundling time
    production && babel({
      extensions: ['.js', '.svelte', '.mjs'],
      include: [
        'src/**', 'node_modules/svelte/**'
      ],
      runtimeHelpers: true,
      presets: [
        [
          "@babel/env",
          {
            targets: {
              ie: '11',
            },
            corejs: 3,
            useBuiltIns: "entry"
          },
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: false
          }
        ]
      ]
    }),

    // Watch the `public` directory and refresh the browser on changes when not in production
    watch && livereload('public'),

    // If we're building for production (npm run build instead of npm run dev), minify
    production && terser(),

  ],
  watch: {
		clearScreen: false
	}

};
