export let Themes = [
	"ebf-dark",
	"ebf-light",
]

export default class StyleHandler {
	constructor(defaultTheme = Themes[0], loadThemes = []) {
		this.themes = new Map();
		this.currentTheme = defaultTheme;
		this.registerTheme(loadThemes)
	}

	registerTheme(name) {
		if (name instanceof Array) {
			for (const themeName of name) {
				this.themes.set(themeName, `theme-${themeName}`);
			}
			return
		}
		this.themes.set(name, `theme-${themeName}`);
	}

	setTheme(name) {
		if (!this.themes.has(name)) return;
		if (typeof document === 'undefined') return;

		const className = this.themes.get(name);
		this.removeAllThemeClasses();
		document.documentElement.classList.add(className);
		this.currentTheme = name;
	}

	removeAllThemeClasses() {
		if (typeof document === 'undefined') return;

		for (const className of this.themes.values()) {
			document.documentElement.classList.remove(className);
		}
	}

	getCurrentTheme() {
		return this.currentTheme;
	}

	getAvailableThemes() {
		return Array.from(this.themes.keys());
	}
}

export let DefaultTheme = Themes[0];
export let GlobalStyleHandler = new StyleHandler(DefaultTheme, Themes);
