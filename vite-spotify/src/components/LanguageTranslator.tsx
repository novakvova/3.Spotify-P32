import { useEffect } from 'react'
import i18n from '../i18n'
import { useAppSelector } from '../store/hooks'
import { selectLanguage } from '../store/slices/languageSlice'

export const LanguageTranslator = () => {
    const lang = useAppSelector(selectLanguage)

    useEffect(() => {
        document.documentElement.lang = lang
        if (i18n.language !== lang) {
            void i18n.changeLanguage(lang)
        }
    }, [lang])

    return null
}
