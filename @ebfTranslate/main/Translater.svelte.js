import { writable } from 'svelte/store';

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
		} else {
			console.warn(`Translation for locale '${localeCode}' is not a valid object, skipping registration.`);
		}
	}

	t(key, params = {}) {
		let currentLang = this.defaultLocale;
		let translation = key;

		const unsubscribe = this.localeStore.subscribe(value => {
			currentLang = value;
		})();
		unsubscribe();

		const langTranslations = this.translations[currentLang];
		if (langTranslations && langTranslations.hasOwnProperty(key)) {
			translation = langTranslations[key];
		} else {
			const fallbackTranslations = this.translations[this.defaultLocale];
			if (fallbackTranslations && fallbackTranslations.hasOwnProperty(key)) {
				translation = fallbackTranslations[key];
			}
		}

		Object.keys(params).forEach(param => {
			translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
		});

		return translation;
	}

	setLocale(newLocale) {
		if (this.supportedLocales.has(newLocale)) {
			this.localeStore.set(newLocale);
			document.documentElement.lang = newLocale;
			localStorage.setItem('selectedLocale', newLocale);
		} else {
			console.warn(`Locale '${newLocale}' is not registered.`);
		}
	}

	get locale() {
		return this.localeStore;
	}

	initTranslator() {
		const savedLocale = localStorage.getItem('selectedLocale');
		if (savedLocale && this.supportedLocales.has(savedLocale)) {
			this.setLocale(savedLocale);
		} else {
			const browserLocale = navigator.language.split('-')[0];
			if (this.supportedLocales.has(browserLocale)) {
				this.setLocale(browserLocale);
			} else {
				this.setLocale(this.defaultLocale);
			}
		}
	}
}

