'use client';

import { useI18n } from "../i18n/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="leafy-divider pb-3 mb-6">
          <h1 className="text-4xl font-bold">{t('contact.title')}</h1>
        </div>

        <form className="grid grid-cols-1 gap-6 bg-white border border-[#cfc9c0] p-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.name')}</label>
            <input
              type="text"
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderName')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.email')}</label>
            <input
              type="email"
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderEmail')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.message')}</label>
            <textarea
              rows={6}
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderMessage')}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-black/70">{t('contact.direct')} <a href="mailto:benitopepitoartiste@gmail.com" className="underline">benitopepitoartiste@gmail.com</a></p>
            <button
              type="submit"
              className="inline-flex items-center bg-[var(--gold)] text-black font-semibold px-6 py-3 hover:bg-[var(--gold-dark)]"
            >
              {t('actions.sendMessage')}
            </button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#cfc9c0] p-6">
            <h2 className="text-xl font-semibold mb-2">{t('contact.gallery')}</h2>
            <p className="text-black/80">Lun-Ven, 09:00–17:00</p>
            <p className="text-black/80">4 rue Dufresne, Saint-Jean-sur-Richelieu, J2W 1K9</p>
          </div>
          <div className="bg-white border border-[#cfc9c0] p-6">
            <h2 className="text-xl font-semibold mb-2">{t('contact.form.email')}</h2>
            <p className="text-black/80">benitopepitoartiste@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
