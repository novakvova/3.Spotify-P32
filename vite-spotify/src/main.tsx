import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {store} from './store'
import {Provider} from "react-redux";
import i18n from './i18n'

// Мова з languageSlice є джерелом істини; синхронізуємо з i18next при кожній зміні.
store.subscribe(() => {
    const lang = store.getState().language.lang
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </StrictMode>,
)
