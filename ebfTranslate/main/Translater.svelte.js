import { writable, get } from 'svelte/store';

export class Translator {
	constructor(defaultLocale = 'en') {
		this.defaultLocale = defaultLocale;
		this.supportedLocales = new Set([defaultLocale]);
		this.translations = {};
		this.localeStore = writable(defaultLocale);
	}

	registerLocale(localeCode, translationJson) {
		if (typeof translationJson === 'object' && translationJson !== null) {
			this.translations[localeCode] = translationJson;
			this.supportedLocales.add(localeCode);
		}
	}

	t(key, params = {}) {
		let currentLang = this.defaultLocale;
		try {
			const storeValue = get(this.localeStore);
			if (storeValue) currentLang = storeValue;
		} catch (e) {}

		let translation = key;
		const langTranslations = this.translations[currentLang];
		if (langTranslations && langTranslations.hasOwnProperty(key)) {
			translation = langTranslations[key];
		} else {
			const fallback = this.translations[this.defaultLocale];
			if (fallback && fallback.hasOwnProperty(key)) {
				translation = fallback[key];
			}
		}

		Object.keys(params).forEach(param => {
			translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
		});

		return translation;
	}

	setLocale(newLocale) {
		if (!this.supportedLocales.has(newLocale)) return;
		this.localeStore.set(newLocale);
		if (typeof document !== 'undefined') document.documentElement.lang = newLocale;
		if (typeof localStorage !== 'undefined') localStorage.setItem('selectedLocale', newLocale);
	}

	get locale() {
		return this.localeStore;
	}

	initTranslator() {
		if (typeof window === 'undefined') return;
		const saved = localStorage.getItem('selectedLocale');
		if (saved && this.supportedLocales.has(saved)) {
			this.setLocale(saved);
		} else {
			const browser = navigator.language.split('-')[0];
			this.setLocale(this.supportedLocales.has(browser) ? browser : this.defaultLocale);
		}
	}
}
