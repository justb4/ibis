function __(string) {
	 if (typeof(i18n)!='undefined' && i18n[string]) {
		return i18n[string];
	}
	return string;
}
