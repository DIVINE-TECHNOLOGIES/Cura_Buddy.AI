import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'hi', 'ta', 'te', 'es'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;
  
  // If no locale is provided, default to 'en'
  if (!locale) {
    locale = 'en';
  }
  
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
