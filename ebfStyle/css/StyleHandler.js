export let Themes = [
	"ebf-dark",
	"ebf-light",
]

export default class StyleHandler {
	constructor(defaultTheme = Themes[0], loadThemes = [], prefix = "theme-") {
		this.prefix = prefix || "";
		this.themes = new Map();
		this.currentTheme = defaultTheme;
		this.registerTheme(loadThemes)
	}

	registerTheme(name) {
		if (name instanceof Array) {
			for (const themeName of name) {
				this.themes.set(themeName, `${this.prefix}${themeName}`);
			}
			return
		}
		this.themes.set(name, `${this.prefix}${themeName}`);
	}

	setTheme(name) {
		if (typeof name !== 'string') return;
		if (typeof document === 'undefined') return;

		if (!this.themes.has(name)) return;

		const className = this.themes.get(name);
		this.removeAllThemeClasses();
		document.documentElement.classList.add(className);
		this.currentTheme = name;

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', name);
		}
	}

	removeAllThemeClasses() {
		if (typeof document === 'undefined') return;

		for (const className of this.themes.values()) {
			document.documentElement.classList.remove(className);
		}
	}

	getCurrentTheme() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('theme');
			if (saved && this.themes.has(saved.replace('theme-', ''))) {
				return saved.replace('theme-', '');
			}
		}
		return this.currentTheme;
	}

	getAvailableThemes() {
		return Array.from(this.themes.keys());
	}
}

export let DefaultTheme = Themes[0];
export let GlobalStyleHandler = new StyleHandler(DefaultTheme, Themes);
