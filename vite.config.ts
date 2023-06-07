import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "/Users/chenxiaofang/wor/kf/denkuitop/denkui/manoco-editor"
	// 	rollupOptions: {
	// 	  plugins: [
	// 		copy({
	// 			targets: [
	// 				{ src: 'libs/denklib', dest: 'dist/denklib' },
	// 				{ src: 'libs/inject', dest: 'dist/inject' },
	// 			  ],
	// 		}),
	// 	  ],
	// 	},
	},
});
