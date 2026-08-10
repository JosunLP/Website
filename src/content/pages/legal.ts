import type { Localized } from '@/domain/models/locale';

/**
 * Legal page content (imprint, privacy policy, accessibility statement).
 *
 * IMPORTANT: These are DRAFT TEMPLATES. Placeholders in the form
 * `[[OWNER: …]]` mark information only the site owner can provide and are
 * intentionally visible. Nothing here may be treated as verified legal
 * content before owner/legal review — see docs/OWNER_ACTION_REQUIRED.md.
 */

export interface LegalSection {
	readonly heading: Localized<string>;
	readonly paragraphs: Localized<readonly string[]>;
}

export interface LegalPageContent {
	readonly title: Localized<string>;
	readonly metaDescription: Localized<string>;
	readonly heading: Localized<string>;
	readonly sections: readonly LegalSection[];
	/** Review date shown on the page (ISO date). */
	readonly reviewedAt: string;
}

/* -------------------------------------------------- imprint */

export const IMPRINT: LegalPageContent = {
	title: {
		de: 'Impressum — Jonas Pfalzgraf',
		en: 'Imprint — Jonas Pfalzgraf',
	},
	metaDescription: {
		de: 'Impressum und Anbieterkennzeichnung von josunlp.de — verantwortlich für Inhalt und Betrieb dieser Website ist Jonas Pfalzgraf (JosunLP).',
		en: 'Legal notice (Impressum) and provider identification for josunlp.de — the person responsible for the content and operation of this website.',
	},
	heading: { de: 'Impressum', en: 'Imprint' },
	reviewedAt: '2026-07-10',
	sections: [
		{
			heading: {
				de: 'Angaben gemäß § 5 DDG',
				en: 'Information pursuant to § 5 DDG (German Digital Services Act)',
			},
			paragraphs: {
				de: ['Jonas Pfalzgraf\nPostfach 7222\n22831 Norderstedt\nDeutschland'],
				en: ['Jonas Pfalzgraf\nPostfach 7222\n22831 Norderstedt\nGermany'],
			},
		},
		{
			heading: { de: 'Kontakt', en: 'Contact' },
			paragraphs: {
				de: ['E-Mail: info@josunlp.de'],
				en: ['E-mail: info@josunlp.de'],
			},
		},
		{
			heading: {
				de: 'Verantwortlich für den Inhalt',
				en: 'Responsible for editorial content',
			},
			paragraphs: {
				de: ['Jonas Pfalzgraf (Anschrift wie oben).'],
				en: ['Jonas Pfalzgraf (address as above).'],
			},
		},
		{
			heading: {
				de: 'Umsatzsteuer / Registereinträge',
				en: 'VAT / register entries',
			},
			paragraphs: {
				de: [''],
				en: [''],
			},
		},
		{
			heading: { de: 'Haftung für Inhalte', en: 'Liability for content' },
			paragraphs: {
				de: [
					'Als Diensteanbieter bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Ich bin jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
					'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.',
				],
				en: [
					'As a service provider, I am responsible for my own content on these pages in accordance with general law. However, I am not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.',
					'Obligations to remove or block the use of information under general law remain unaffected. Liability in this respect is only possible from the time of knowledge of a specific infringement. Upon becoming aware of such infringements, I will remove the content in question immediately.',
				],
			},
		},
		{
			heading: { de: 'Haftung für Links', en: 'Liability for links' },
			paragraphs: {
				de: [
					'Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte übernehme ich keine Gewähr; verantwortlich ist stets der jeweilige Anbieter oder Betreiber. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße geprüft; rechtswidrige Inhalte waren nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.',
				],
				en: [
					'This website contains links to external third-party websites over whose content I have no influence. I therefore accept no liability for this third-party content; the respective provider or operator is always responsible. Linked pages were checked for possible legal violations at the time of linking; no unlawful content was identifiable. Upon becoming aware of legal violations, I will remove such links immediately.',
				],
			},
		},
		{
			heading: { de: 'Urheberrecht', en: 'Copyright' },
			paragraphs: {
				de: [
					'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Soweit Inhalte nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und Inhalte Dritter als solche gekennzeichnet. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.',
				],
				en: [
					'The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, editing, distribution, and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator. Where content was not created by the operator, third-party copyrights are respected and third-party content is marked as such. Upon becoming aware of infringements, I will remove such content immediately.',
				],
			},
		},
	],
};

/* -------------------------------------------------- privacy */

export const PRIVACY: LegalPageContent = {
	title: {
		de: 'Datenschutzerklärung — Jonas Pfalzgraf',
		en: 'Privacy Policy — Jonas Pfalzgraf',
	},
	metaDescription: {
		de: 'Datenschutzerklärung von josunlp.de: keine Analyse-Tools, kein Tracking, keine Drittanbieter-Einbindungen.',
		en: 'Privacy policy for josunlp.de: no analytics, no tracking, no third-party embeds.',
	},
	heading: { de: 'Datenschutzerklärung', en: 'Privacy Policy' },
	reviewedAt: '2026-07-10',
	sections: [
		{
			heading: { de: 'Überblick', en: 'Overview' },
			paragraphs: {
				de: [
					'Diese Website ist bewusst datensparsam gebaut: Sie verwendet keine Analyse-Tools, keine Werbenetzwerke, keine Social-Media-Einbindungen, keine externen Schriftarten und keine Cookies. Alle Ressourcen werden vom eigenen Server geladen.',
				],
				en: [
					'This website is deliberately built to be data-minimal: it uses no analytics, no advertising networks, no social media embeds, no remote fonts, and no cookies. All resources are served from its own server.',
				],
			},
		},
		{
			heading: { de: 'Verantwortlicher', en: 'Controller' },
			paragraphs: {
				de: [
					'Jonas Pfalzgraf, Postfach 7222, 22831 Norderstedt, E-Mail: info@josunlp.de.',
				],
				en: [
					'Jonas Pfalzgraf, Postfach 7222, 22831 Norderstedt, Germany, e-mail: info@josunlp.de.',
				],
			},
		},
		{
			heading: {
				de: 'Hosting und Server-Logdateien',
				en: 'Hosting and server log files',
			},
			paragraphs: {
				de: [
					'Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Datei, User-Agent), soweit dies für Auslieferung und Sicherheit des Dienstes erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO).',
					'',
				],
				en: [
					'When this website is accessed, the hosting provider processes technically necessary data (e.g. IP address, date and time of access, requested file, user agent) to the extent required for delivering and securing the service (Art. 6(1)(f) GDPR).',
					'',
				],
			},
		},
		{
			heading: { de: 'Lokale Einstellungen', en: 'Local preferences' },
			paragraphs: {
				de: [
					'Wenn Sie aktiv eine Sprache oder ein Farbschema wählen, speichert Ihr Browser diese Auswahl lokal (localStorage, Schlüssel „jp:locale“ und „jp:theme“). Diese Daten verlassen Ihr Gerät nicht, werden nicht ausgelesen übertragen und können jederzeit über die Browser-Einstellungen gelöscht werden. Ohne aktive Auswahl wird nichts gespeichert.',
				],
				en: [
					'If you actively choose a language or color scheme, your browser stores that choice locally (localStorage keys "jp:locale" and "jp:theme"). This data never leaves your device, is not transmitted anywhere, and can be deleted at any time via your browser settings. Nothing is stored without an active choice.',
				],
			},
		},
		{
			heading: { de: 'Kontakt per E-Mail', en: 'Contact by e-mail' },
			paragraphs: {
				de: [
					'Wenn Sie mir per E-Mail schreiben, werden Ihre Angaben zur Bearbeitung der Anfrage und für Anschlussfragen gespeichert (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Diese Daten gebe ich nicht ohne Ihre Einwilligung weiter.',
				],
				en: [
					'If you contact me by e-mail, your details are stored to process the inquiry and handle follow-up questions (Art. 6(1)(b) or (f) GDPR). I do not pass this data on without your consent.',
				],
			},
		},
		{
			heading: { de: 'Externe Links', en: 'External links' },
			paragraphs: {
				de: [
					'Links zu externen Plattformen (z. B. GitHub) sind reine Verweise. Erst beim Anklicken verlassen Sie diese Website; es gelten dann die Datenschutzbestimmungen der jeweiligen Anbieter. Es werden keine Inhalte dieser Plattformen eingebettet.',
				],
				en: [
					'Links to external platforms (e.g. GitHub) are plain references. Only when you click them do you leave this website; the privacy policies of the respective providers then apply. No content from these platforms is embedded.',
				],
			},
		},
		{
			heading: { de: 'Ihre Rechte', en: 'Your rights' },
			paragraphs: {
				de: [
					'Sie haben im Rahmen der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.',
				],
				en: [
					'Under the GDPR you have the right to access, rectification, erasure, restriction of processing, data portability, and objection, as well as the right to lodge a complaint with a data protection supervisory authority.',
				],
			},
		},
	],
};

/* -------------------------------------------------- accessibility statement */

export const ACCESSIBILITY: LegalPageContent = {
	title: {
		de: 'Erklärung zur Barrierefreiheit — Jonas Pfalzgraf',
		en: 'Accessibility Statement — Jonas Pfalzgraf',
	},
	metaDescription: {
		de: 'Erklärung zur Barrierefreiheit von josunlp.de: Konformitätsziel WCAG 2.2 AA, bekannte Einschränkungen und Kontaktmöglichkeit.',
		en: 'Accessibility statement for josunlp.de: WCAG 2.2 AA conformance target, known limitations, and how to report barriers.',
	},
	heading: {
		de: 'Erklärung zur Barrierefreiheit',
		en: 'Accessibility Statement',
	},
	reviewedAt: '2026-07-10',
	sections: [
		{
			heading: { de: 'Anspruch', en: 'Our target' },
			paragraphs: {
				de: [
					'Diese Website soll für möglichst viele Menschen nutzbar sein. Qualitätsziel ist die Konformität mit den Web Content Accessibility Guidelines (WCAG) 2.2, Stufe AA — unabhängig davon, ob eine gesetzliche Pflicht besteht.',
					'Diese Erklärung beschreibt den angestrebten Stand und wird bei Änderungen der Website überprüft. Sie ist keine rechtlich geprüfte Konformitätserklärung.',
				],
				en: [
					'This website is meant to be usable by as many people as possible. The quality target is conformance with the Web Content Accessibility Guidelines (WCAG) 2.2, level AA — regardless of whether a legal obligation applies.',
					'This statement describes the intended state and is reviewed whenever the website changes. It is not a legally audited declaration of conformity.',
				],
			},
		},
		{
			heading: { de: 'Umgesetzte Maßnahmen', en: 'Measures in place' },
			paragraphs: {
				de: [
					'Vollständige Tastaturbedienbarkeit, sichtbare Fokus-Indikatoren, ein Link zum Überspringen der Navigation, semantische Landmarken und Überschriftenhierarchie, ausreichende Farbkontraste in hellem und dunklem Farbschema, Respektieren von reduzierter Bewegung (prefers-reduced-motion) sowie automatisierte Accessibility-Tests im Entwicklungsprozess.',
				],
				en: [
					'Full keyboard operability, visible focus indicators, a skip-to-content link, semantic landmarks and heading hierarchy, sufficient color contrast in both light and dark schemes, respect for reduced motion (prefers-reduced-motion), and automated accessibility checks in the development process.',
				],
			},
		},
		{
			heading: { de: 'Bekannte Einschränkungen', en: 'Known limitations' },
			paragraphs: {
				de: [
					'Blogartikel, die nach der Veröffentlichung der Website manuell hochgeladen werden, werden clientseitig gerendert; ohne JavaScript ist für diese Artikel nur die Artikelübersicht verfügbar. Ältere Inhalte Dritter, auf die verlinkt wird, liegen außerhalb meiner Kontrolle.',
					'Ein vollständiger Test mit allen Screenreader-/Browser-Kombinationen steht noch aus.',
				],
				en: [
					'Blog articles uploaded manually after the site was published are rendered client-side; without JavaScript, only the article overview is available for those posts. Third-party content that is linked to is outside my control.',
					'A complete test with all screen reader/browser combinations is still pending.',
				],
			},
		},
		{
			heading: { de: 'Barrieren melden', en: 'Report a barrier' },
			paragraphs: {
				de: [
					'Wenn Sie auf eine Barriere stoßen, freue ich mich über eine Nachricht an info@josunlp.de. Bitte beschreiben Sie das Problem und die verwendete Technik (Browser, Hilfstechnologie).',
				],
				en: [
					'If you encounter a barrier, please write to info@josunlp.de. Describe the problem and the technology you use (browser, assistive technology).',
				],
			},
		},
	],
};
