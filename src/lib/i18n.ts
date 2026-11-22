import en from '../../messages/en.json'
import vi from '../../messages/vi.json'

export type Locale = 'en' | 'vi'
export type Messages = typeof en

export const locales: Locale[] = ['en', 'vi']
export const defaultLocale: Locale = 'vi'

export const messages: Record<Locale, Messages> = {
  en,
  vi,
}

export function getMessages(locale: Locale = defaultLocale): Messages {
  return messages[locale] || messages[defaultLocale]
}

export default messages
