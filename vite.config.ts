import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import less from 'less'

const themesWithClass = [{
	theme: 'dark',
	class: 'darkTheme',
	replaceText: '@isDarkMode: true;',
	targetText: '@isDarkMode: true;'
},{
	theme: 'light',
	class: 'lightTheme',
	replaceText: '@isDarkMode: true;',
	targetText: '@isDarkMode: false;'
}]

const lessThemesAdditonalData = async (source:string, fileName) => {
	if (fileName.endsWith('.theme.additional.less')) {
		var resultsItems:string[] = []
		resultsItems = await Promise.all(themesWithClass.map(async (item) => {
			const preload = await less.render(source.replace(item.replaceText, item.targetText));
			console.info('kfdebug', preload.css)
			return `
				.${item.class} {
					${preload.css}
				}
			`
		}))
		const result = resultsItems.join('\n\n')
		return result;
	}
	return source
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "../../denkui/manoco-editor"
	},
	css: {

		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
				additionalData: lessThemesAdditonalData
			},

		},
	},
});
