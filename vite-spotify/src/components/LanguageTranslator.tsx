import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { selectLanguage } from '../store/slices/languageSlice'

const EXACT_TRANSLATIONS: Record<string, string> = {
    'Маєте запитання?': 'Got questions?',
    'Детальну інформацію про умови використання та параметри підписки ви можете знайти у розділі підтримки.':
        'Detailed information about terms of use and subscription options can be found in the Support section.',
    '0 USD за 1 місяць': '0 USD for 1 month',
    'Слухайте без обмежень. Спробуйте 1 місяць Premium Individual за 0 USD':
        'Listen without limits. Try 1 month of Premium Individual for 0 USD',
    'Потім усього 4,99 USD\\ на місяць. Можна скасувати будь-коли':
        'Only 4.99 USD/month after. Cancel anytime',
    'Спробувати 1 місяць за 0 USD': 'Try 1 month for 0 USD',
    'Переглянути всі підписки': 'View all plans',
    '0 USD за 1 місяць, потім 4,99 USD на місяць. Пропозиція доступна, лише якщо ви раніше не користувалися Premium-підпискою':
        '0 USD for 1 month, then 4.99 USD per month. Offer available only if you haven’t tried Premium before',
    'Відчуйте різницю': 'Feel the difference',
    'Перейдіть на': 'Go',
    'і насолоджуйтеся повним контролем над': 'and enjoy full control over',
    'музикою. Можна скасувати будь-коли': 'your music. Cancel anytime',
    'Ви отримаєте:': 'What you get:',
    'Підписка': 'Plan',
    'Прослуховування': 'Ad-free music',
    'музики без реклами': 'listening',
    'Завантажуйте, щоб': 'Download to',
    'слухати офлайн': 'listen offline',
    'Слухайте треки в': 'Play songs in',
    'будь-якому порядку': 'any order',
    'Висока якість звуку': 'High audio quality',
    'разом із друзями': 'with friends',
    'в реальному часі': 'in real time',
    'Доступні підписки на будь-який випадок': 'Affordable plans for any situation',
    'Виберіть': 'Choose a',
    '-підписку й слухайте музику без реклами й обмежень на телефоні, колонці чи інших пристроях. Оплачуйте зручним для вас способом. Можна скасувати будь-коли':
        ' plan and listen to ad-free music without limits on your phone, speaker, and other devices. Pay in various ways. Cancel anytime',
    'Потім 4,99 USD на місяць': '4.99 USD/month after',
    '1 акаунт Premium': '1 Premium account',
    'Можна скасувати будь-коли': 'Cancel anytime',
    '6,49 USD на місяць': '6.49 USD/month',
    'Для двох користувачів, які проживають за однією адресою': 'For two people who live at the same address',
    '2 акаунти Premium': '2 Premium accounts',
    'Отримати Premium Duo': 'Get Premium Duo',
    '7,99 USD на місяць': '7.99 USD/month',
    'Для 6 членів сім’ї, які проживають за однією адресою.': 'For up to 6 family members residing at the same address.',
    'До 6 акаунтів Premium': 'Up to 6 Premium accounts',
    'Отримати Premium Family': 'Get Premium Family',
    'Потім 2,49 USD на місяць': '2.49 USD/month after',
    '1 підтверджений акаунт Premium': '1 verified Premium account',
    'Потім 0,99 USD на місяць': '0.99 USD/month after',
    'Доступ до українських казок': 'Access to Ukrainian fairy tales',
    'Безпечний контент': 'Kid-safe content',
    'Батьківський контроль': 'Parental controls',
    'Як працює пробна версія Sonora Premium?': 'How does the Sonora Premium trial work?',
    'Як скасувати мою підписку Premium?': 'How do I cancel my Premium plan?',
    'Як працює підписка Premium Duo?': 'How does the Premium Duo plan work?',
    'Як працює підписка Premium Family?': 'How does the Premium Family plan work?',
    'Як працює підписка Premium Student?': 'How does the Premium Student plan work?',
    'Яка вартість Sonora Premium у вашому регіоні?': 'How much does Sonora Premium cost in your region?',

    'Студенти отримують Premium': 'Students get Premium',
    'безкоштовно на 1 місяць': 'free for 1 month',
    'Потім лише 2,49 $ на місяць. Скасувати можна будь-коли.': 'Then just $2.49/month. Cancel anytime.',
    'Отримати Premium': 'Get Premium',
    'З музикою': 'Studying is more fun',
    'навчатися веселіше': 'with music',
    'Забудьте про перерви на рекламу під час підготовки до пар. Насолоджуйтеся плейлистами без жодних відволікань':
        'Forget ad breaks while studying for classes. Enjoy playlists with zero distractions',
    'Спеціальна ціна для студентів': 'Special price for students',
    'Всі переваги Premium зі знижкою 50% протягом навчання. Лише 2,49 $ на місяць':
        'All Premium benefits at 50% off while you study. Only $2.49/month',
    'Музика без реклами': 'Ad-free music',
    'Навчайтеся вдень.': 'Study by day.',
    'Танцюйте вночі': 'Dance by night',
    'Музика офлайн': 'Offline music',
    'Не бійтеся вичерпати трафік, де б ви не були': 'Never worry about running out of data wherever you are',
    'Музика під настрій': 'Music for every mood',
    'Мільйони пісень, чудові плейлісти': 'Millions of songs, great playlists',
    'Насолода від музики': 'Pure music enjoyment',
    'Відчуйте ще кращу якість музики в кожній пісні': 'Experience even better sound quality in every song',
    'Отримати підписку Premium Student просто': 'Getting Premium Student is easy',
    'Зареєструйтесь або ввійдіть у наявний акаунт': 'Sign up or log in to your existing account',
    'Підтвердьте свій статус студента акредитованого вищого навчального закладу':
        'Verify your student status at an accredited higher education institution',
    'Додайте спосіб оплати й насолоджуйтеся всіма перевагами Premium':
        'Add a payment method and enjoy all Premium benefits',
    'Чи я відповідаю вимогам для цієї підписки?': 'Am I eligible for this plan?',
    'Як ви перевірите мій статус студента?': 'How do you verify my student status?',
    'Що станеться з моїм акаунтом, коли я закінчу навчальний заклад?':
        'What happens to my account when I graduate?',
    'Яка сума стягуватиметься та коли?': 'How much will I be charged and when?',

    "6 акаунтів Premium для членів сім'ї, що мешкають разом. 7,99 $ на місяць. Можна скасувати будь-коли.":
        '6 Premium accounts for family members living under one roof. $7.99/month. Cancel anytime.',
    'Почати': 'Get started',
    'Слухайте разом.': 'Listen together.',
    'Слухайте окремо.': 'Listen apart.',
    'Не потрібно користуватись акаунтом по черзі.': 'No need to take turns using one account.',
    'Можна насолоджуватися своєю музикою без реклами завдяки окремим акаунтам':
        'Everyone can enjoy their own ad-free music with separate accounts',
    "Найвигідніше для сім'ї": 'Best value for the family',
    "Члени сім'ї, що мешкають разом, отримують до 6 акаунтів Premium. Плата складає всього 7.99 $ на місяць.":
        'Family members living together get up to 6 Premium accounts for just $7.99/month.',
    'Навіщо переходити на': 'Why upgrade to',
    'Слухайте офлайн будь-де': 'Listen offline anywhere',
    'Музика без реклами. Слухайте музику нон-стоп': 'Ad-free music. Listen non-stop',
    'Обирайте будь-які треки. Слухайте те, що вам до вподоби': 'Play any track. Listen to what you love',
    'Пропускайте треки без обмежень. Просто натисніть "Далі"': 'Unlimited skips. Just press Next',
    'Уже маєте підписку': 'Already have',
    "Якщо хтось в вашої сім'ї вже має акаунт Sonora, цей користувач може перейти на підписку Family й зберегти всі свої:":
        'If someone in your family already has a Sonora account, they can switch to Family and keep all their:',
    'Музика': 'Music',
    'Плейлисти': 'Playlists',
    'Рекомендації': 'Recommendations',
    'Отримати підписку Premium Family просто': 'Getting Premium Family is easy',
    'Зареєструйтесь або увійдіть у власний акаунт': 'Sign up or log in to your account',
    "Запросіть членів сім'ї, з якими проживаєте, стати учасниками Premium-підписки":
        'Invite family members you live with to join your Premium plan',
    "Члени сім'ї приймають запрошення вдома, підтверджують адресу — так отримують підписку Family":
        'Family members accept the invite at home, confirm the address, and get Family',
    'Ми отримаємо спільний акаунт чи окремий для кожного?':
        'Do we get a shared account or a separate one for each member?',
    'У мене вже є Premium-підписка. Що станеться з моєю збереженою музикою?':
        'I already have Premium. What happens to my saved music?',
    'Як виставляється рахунок? Потрібно розділити вартість?':
        'How does billing work? Do we need to split the cost?',
    'Можна слухати музику якщо одночасно?': 'Can we listen to music at the same time?',
    'Які умови доступу до часу для прослуховування аудіокниг дається для менеджера і учасників підписки Premium Family?':
        'What are the audiobook listening time terms for the plan manager and members of Premium Family?',

    'Premium Duo. Музика для двох': 'Premium Duo. Music for two',
    '2 акаунти Premium для двох осіб, що мешкають разом. 6.49 USD на місяць. Можна скасувати будь-коли.':
        '2 Premium accounts for two people living together. 6.49 USD/month. Cancel anytime.',
    'Уже немає потреби користуватись акаунтом по черзі.': 'No more taking turns sharing one account.',
    'Можна насолоджуватися своєю музикою завдяки двом окремим акаунтам.':
        'Enjoy your own music with two separate accounts.',
    'Найвигідніше для двох': 'Best value for two',
    'Два окремих акаунти Premium для пари, що живе разом, лише за 6.49 $ на місяць':
        'Two separate Premium accounts for a couple living together, only $6.49/month',
    'Завантажуйте музику. Слухайте її будь-де': 'Download music. Listen anywhere',
    'Слухайте будь-які треки. Навіть на мобільному пристрої': 'Play any track. Even on mobile',
    'Якщо ви перейдете на Duo, буде збережено весь ваш контент, наведений нижче.':
        'When you switch to Duo, all your content below will be kept.',
    'Що таке Premium Duo?': 'What is Premium Duo?',
    'Premium Duo — підписка зі знижкою для двох людей, які живуть разом.':
        'Premium Duo is a discounted plan for two people who live together.',
    'Місячну підписку можна скасувати онлайн будь-коли': 'You can cancel your monthly subscription online anytime',
    'Отримати підписку Premium Duo просто': 'Getting Premium Duo is easy',
    'Приєднайтеся до підписки Duo, зареєструвавшись або увійшовши в наявний акаунт':
        'Join Duo by signing up or logging in to your existing account',
    'Запросіть співмешканця приєднатися до Duo за допомогою електронного листа, повідомлення у WhatsApp або іншого способу':
        'Invite your partner to join Duo via email, WhatsApp, or another messaging app',
    'Співмешканець прийме запрошення вдома, підтверджує адресу — і ви обоє отримаєте підписку Duo':
        'They accept the invite at home, confirm the address, and you both enjoy Duo',
    'Учасник із Premium-підпискою Premium — як зміниться збережена музика?':
        'For a member who already has Premium — what happens to saved music?',
    'Можна скасувати коли завгодно?': 'Can I cancel anytime?',
    'Які умови доступу до часу для прослуховування аудіокниг дається для менеджерів і учасників підписки Premium Duo?':
        'What are the audiobook listening time terms for plan managers and members of Premium Duo?',

    'Додайте Premium Kids до своєї підписки та подаруйте дітям безпечний простір для прослуховування. До 3 акаунтів Premium для дітей, що мешкають разом. Усього за 0,99 $ на місяць.':
        'Add Premium Kids to your plan and give children a safe listening space. Up to 3 Premium accounts for kids living together. Just $0.99/month.',
    'Підключити Kids+': 'Get Kids+',
    'Чарівний світ казок': 'A magical world of fairy tales',
    'та колискових': 'and lullabies',
    'Величезна бібліотека українських народних та авторських казок, колискових і дитячих пісень':
        'A huge library of Ukrainian folk and original fairy tales, lullabies, and children’s songs',
    'Найкраще для вашої малечі': 'The best for your little ones',
    'До 3 акаунтів Premium для дітей усього за 0.99 $ на місяць з змогою скасування в будь-який момент':
        'Up to 3 Premium accounts for kids for only $0.99/month, cancel anytime',
    'Чому варто підключити': 'Why get',
    'Казки та колискові без реклами': 'Ad-free fairy tales and lullabies',
    'Безпечний простір': 'Safe space',
    'Коли ви додаєте Kids+, ваші власні миті, плейлисти й збережені:':
        'When you add Kids+, your own moments, playlists, and saved music remain:',
    'Основна підписка не змінюється': 'Your main plan stays unchanged',
    'Усі ваші треки та плейлисти зберігаються': 'All your tracks and playlists are kept',
    'Дитячі профілі підключаються в один клік': 'Kids profiles connect in one click',
    'Легко керуйте контентом та створюйте безпечний простір, щоб завжди бути впевненими в тому, що слухають ваші діти.':
        'Easily manage content and create a safe environment so you always know what your kids are listening to.',
    'Kids+ не для вас? Не проблема. Підписку можна скасувати будь-коли':
        'Kids+ not for you? No problem. You can cancel anytime',
    'Підключити Kids+ — це легко': 'Getting Kids+ is easy',
    'Увійдіть у свій акаунт у додатку або на сайті': 'Log in to your account in the app or on the website',
    'Додайте опцію Kids+ у налаштуваннях підписки': 'Add the Kids+ option in your subscription settings',
    'Насолоджуйтеся спеціальним дитячим додатком та казками': 'Enjoy the dedicated kids app and fairy tales',
    'Чи можна слухати контент без інтернету?': 'Can content be listened to offline?',
    'Як скасувати підписку, якщо дитині не сподобається?': 'How do I cancel if my child doesn’t like it?',

    'З поверненням': 'Welcome back',
    'Раді бачити вас знову!': 'Welcome back!',
    'Електронна пошта': 'Email address',
    'Адреса електронної пошти': 'Email address',
    'Увійти': 'Log in',
    'Вхід...': 'Logging in...',
    'або': 'or',
    'Продовжити через Google': 'Continue with Google',
    'Продовжити через Apple': 'Continue with Apple',
    'Зареєструватися через': 'Continue with',
    'Вхід через Apple': 'Continue with Apple',
    'Не маєте акаунта?': 'Don’t have an account?',
    'Немає акаунту?': 'Don’t have an account?',
    'Зареєструватися': 'Sign up',
    'Введіть код, надісланий на вашу електронну пошту': 'Enter the code sent to your email',
    'Надіслати код повторно': 'Resend code',
    'Надіслати код ще раз': 'Resend code',
    'Надсилання...': 'Sending...',
    'Перевірка...': 'Verifying...',
    'Зачекайте...': 'Please wait...',
    'Увійти за допомогою пароля': 'Log in with password',
    'Увійти без пароля': 'Log in without password',
    'Пароль': 'Password',
    'Забули пароль?': 'Forgot password?',
    'Отримати одноразовий код': 'Get a one-time code instead',
    'Введіть коректну адресу електронної пошти': 'Please enter a valid email address',
    'Неправильні адреса електронної пошти або пароль': 'Incorrect email address or password',
    'Цей код недійсний. Перевірте код і повторіть спробу': 'This code is invalid. Check the code and try again',
    'Код надіслано повторно': 'Code sent again',
    'Код уже надіслано. Спробуйте за хвилину': 'Code already sent. Try again in a minute',

    'Зареєструйтеся, щоб почати слухати': 'Sign up to start listening',
    'Далі': 'Next',
    'Уже маєте акаунт?': 'Already have an account?',
    'Крок 1 із 3': 'Step 1 of 3',
    'Крок 2 із 3': 'Step 2 of 3',
    'Крок 3 із 3': 'Step 3 of 3',
    'Крок 1 з 3': 'Step 1 of 3',
    'Крок 2 з 3': 'Step 2 of 3',
    'Крок 3 з 3': 'Step 3 of 3',
    'Створіть пароль': 'Create a password',
    'Пароль має містити принаймні:': 'Your password must contain at least:',
    '1 літеру': '1 letter',
    '1 цифру або спеціальний символ (наприклад, # ? ! &)': '1 number or special character (example: # ? ! &)',
    '1 число або 1 спеціальний символ (наприклад: #?!&)': '1 number or 1 special character (example: #?!&)',
    '10 символів': '10 characters',
    'Розкажіть про себе': 'Tell us about yourself',
    "Ім'я": 'Name',
    "Це ім'я відображатиметься у вашому профілі": 'This name will appear on your profile',
    "Це ім'я відображатиметься в профілі": 'This name will appear on your profile',
    "Введіть своє ім'я": 'Enter your name',
    'Дата народження': 'Date of birth',
    'Виберіть дату народження': 'Please enter a valid date of birth',
    'Навіщо потрібно вказувати дату народження?': 'Why do we need your date of birth?',
    'Стать': 'Gender',
    'Оберіть стать': 'Please select a gender',
    'Ми використовуємо вашу стать, щоб персоналізувати наші рекомендації та рекламу для вас':
        'We use your gender to help personalize our content recommendations and ads for you',
    'Чоловіча': 'Male',
    'Жіноча': 'Female',
    'Інша': 'Non-binary',
    'Не вказувати': 'Prefer not to say',
    'Чоловік': 'Male',
    'Жінка': 'Female',
    'Небінарна': 'Non-binary',
    'Інше': 'Other',
    'Не хочу вказувати': 'Prefer not to say',
    'Не вказано': 'Not specified',
    'Умови використання': 'Terms & Conditions',
    'Умови використання та Політика конфіденційності': 'Terms and Conditions & Privacy Policy',
    'Я погоджуюся з Умовами використання та Політикою конфідеційності':
        'I agree to the Terms and Conditions and Privacy Policy',
    'Я погоджуюся отримувати новини та персональні пропозиції':
        'I agree to receive news and personalized offers',
    "Я погоджуюся на обробку моїх даних для покращення сервісу (необов'язково)":
        'I agree to the processing of my data to improve the service (optional)',
    'Щоб продовжити, необхідно прийняти Умови використання':
        'Please accept the Terms and Conditions to continue',
    'Такий користувач уже зареєстрований. Увійдіть або використайте іншу адресу':
        'This email is already registered. Log in or use another email address',
    'Помилка реєстрації. Спробуйте ще раз': 'Registration error. Please try again',
    'Я не хочу отримувати маркетингові повідомлення від Sonora':
        'I would prefer not to receive marketing messages from Sonora',
    'Надавати мої реєстраційні дані постачальникам контенту Sonora для маркетингових цілей':
        'Share my registration data with Sonora’s content providers for marketing purposes',
    'Місяць': 'Month',
    'Січень': 'January',
    'Лютий': 'February',
    'Березень': 'March',
    'Квітень': 'April',
    'Травень': 'May',
    'Червень': 'June',
    'Липень': 'July',
    'Серпень': 'August',
    'Вересень': 'September',
    'Жовтень': 'October',
    'Листопад': 'November',
    'Грудень': 'December',

    'Відновлення паролю': 'Password reset',
    'Введіть адресу електронної пошти, і ми надішлемо код для зміни паролю':
        'Enter your email address and we will send you a code to reset your password',
    'Надіслати код': 'Send code',
    'Повернутися до входу': 'Back to log in',
    'Лист надіслано на': 'Email sent to',
    'Згадали пароль? Увійти': 'Remember your password? Log in',
    'Новий пароль': 'New password',
    'Для акаунта': 'For account',
    'Запросити новий код': 'Request a new code',
    'Щонайменше 10 символів': 'At least 10 characters',
    'Принаймні 1 літера': 'At least 1 letter',
    'Принаймні 1 число або спеціальний символ': 'At least 1 number or special character',
    'Підтвердіть пароль': 'Confirm password',
    'Паролі не збігаються': 'Passwords do not match',
    'Збереження...': 'Saving...',
    'Змінити пароль': 'Reset password',
    'Пароль змінено': 'Password changed',
    'Тепер увійдіть у свій акаунт із новим паролем': 'Now log in to your account with your new password',
    'Не вдалося надіслати код. Спробуйте ще раз': 'Failed to send code. Please try again',
    'Сеанс відновлення прострочено. Запросіть новий код': 'Reset session expired. Request a new code',
    'Не вдалося змінити пароль. Спробуйте ще раз': 'Failed to change password. Please try again',

    'Завантаження профілю...': 'Loading profile...',
    'Назад': 'Back',
    '← Назад': '← Prev',
    'Вперед →': 'Next →',
    'Профіль користувача': 'User Profile',
    'Редагувати профіль': 'Edit profile',
    'Редагування даних': 'Edit profile details',
    'Натисніть на фото для зміни': 'Click photo to change',
    "Ім'я користувача": 'Username',
    '⚠ Після збереження сесія завершиться — потрібно буде увійти знову.':
        '⚠ After saving, your session will end and you will need to log in again.',
    'Дані оновлено! Оскільки змінився username, потрібно увійти знову. Перенаправлення...':
        'Profile updated! Please log in again. Redirecting...',
    'Помилка при оновленні профілю': 'Error updating profile',
    'Скасувати': 'Cancel',
    'Зберегти': 'Save',

    'Головна': 'Home',
    'Пісні': 'Songs',
    'Жанри': 'Genres',
    'Виконавці': 'Artists',
    'Артисти': 'Artists',
    'Альбоми': 'Albums',
    'Реєстрація': 'Sign up',
    'Знайти': 'Search',
    'Вийти': 'Log out',
    'Завантаження...': 'Loading...',
    'Назва': 'Title',
    'Альбом': 'Album',
    'Жанр': 'Genre',
    'Виконавець': 'Artist',
    'Нічого не знайдено': 'Nothing found',
    '⚠ Помилка завантаження жанрів': '⚠ Failed to load genres',
    'Жанри відсутні': 'No genres found',
    '⚠ Помилка завантаження виконавців': '⚠ Failed to load artists',
    'Виконавці відсутні': 'No artists found',
    'Завантаження альбомів...': 'Loading albums...',
    "⚠ Помилка завантаження альбомів. Перевірте з'єднання з базою.":
        '⚠ Failed to load albums. Check your database connection.',
    'Альбоми відсутні': 'No albums found',
    'Завантаження альбому...': 'Loading album...',
    'Альбом не знайдено': 'Album not found',
    'Невідомий виконавець': 'Unknown artist',
    'В цьому альбомі поки немає треків.': 'There are no tracks in this album yet.',
    'Завантаження профілю виконавця...': 'Loading artist profile...',
    'Виконавця не знайдено': 'Artist not found',
    'Альбоми дискографії': 'Discography albums',
    'Популярні треки': 'Popular tracks',
    'Сингл': 'Single',
    'У цього виконавця поки немає завантажених треків.': 'This artist has no uploaded tracks yet.',
    'Вхід у жанр...': 'Loading genre...',
    'Жанр не знайдено': 'Genre not found',
    'Опис жанру відсутній.': 'No genre description available.',
    'Пісні у цьому жанрі': 'Songs in this genre',
    'У цьому жанрі поки немає пісень.': 'There are no songs in this genre yet.',
    'Пошук': 'Search',
    'Введіть запит для пошуку': 'Enter a search query',
    'Пошук...': 'Searching...',
    'Результати пошуку': 'Search results',
    'За запитом:': 'For query:',
    'Оберіть пісню': 'Select a song',
}

const PLACEHOLDER_TRANSLATIONS: Record<string, string> = {
    'Пошук пісень, виконавців, альбомів...': 'Search songs, artists, albums...',
    'Введіть електронну пошту': 'Enter your email',
    'Введіть пароль': 'Enter your password',
    'Місяць': 'Month',
    'День': 'Day',
    'Рік': 'Year',
    'дд': 'DD',
    'рррр': 'YYYY',
}

function translateDynamicUkToEn(trimmed: string): string | null {
    if (EXACT_TRANSLATIONS[trimmed]) {
        return EXACT_TRANSLATIONS[trimmed]
    }
    if (trimmed.startsWith('Результати: ')) {
        return trimmed.replace('Результати: ', 'Results: ')
    }
    if (trimmed.startsWith('Рік випуску: ')) {
        return trimmed.replace('Рік випуску: ', 'Release year: ')
    }
    if (trimmed.startsWith('Рік народження/заснування: ')) {
        return trimmed.replace('Рік народження/заснування: ', 'Year of birth/formation: ')
    }
    if (trimmed.startsWith('Стать: ')) {
        const g = trimmed.replace('Стать: ', '').trim()
        return `Gender: ${EXACT_TRANSLATIONS[g] ?? g}`
    }
    if (trimmed.endsWith(' треків')) {
        return trimmed.replace(' треків', ' tracks')
    }
    if (trimmed.endsWith(' рік')) {
        return trimmed.replace(' рік', '')
    }
    return null
}

const originalTextMap = new WeakMap<Text, string>()
const originalPlaceholderMap = new WeakMap<Element, string>()

function applyTranslationToDOM(lang: 'uk' | 'en') {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let currentNode = walker.nextNode()

    while (currentNode) {
        const textNode = currentNode as Text
        const raw = textNode.nodeValue ?? ''
        const trimmed = raw.trim()

        if (trimmed) {
            if (!originalTextMap.has(textNode) && translateDynamicUkToEn(trimmed)) {
                originalTextMap.set(textNode, raw)
            }

            const savedUk = originalTextMap.get(textNode)
            if (savedUk) {
                const ukTrimmed = savedUk.trim()
                if (lang === 'en') {
                    const en = translateDynamicUkToEn(ukTrimmed)
                    if (en) {
                        const replaced = savedUk.replace(ukTrimmed, en)
                        if (textNode.nodeValue !== replaced) {
                            textNode.nodeValue = replaced
                        }
                    }
                } else {
                    if (textNode.nodeValue !== savedUk) {
                        textNode.nodeValue = savedUk
                    }
                }
            }
        }

        currentNode = walker.nextNode()
    }

    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]')
    inputs.forEach((el) => {
        const currentPh = el.getAttribute('placeholder') ?? ''
        if (!originalPlaceholderMap.has(el) && PLACEHOLDER_TRANSLATIONS[currentPh]) {
            originalPlaceholderMap.set(el, currentPh)
        }
        const savedPh = originalPlaceholderMap.get(el)
        if (savedPh) {
            if (lang === 'en') {
                const enPh = PLACEHOLDER_TRANSLATIONS[savedPh]
                if (enPh && currentPh !== enPh) {
                    el.setAttribute('placeholder', enPh)
                }
            } else {
                if (currentPh !== savedPh) {
                    el.setAttribute('placeholder', savedPh)
                }
            }
        }
    })
}

export const LanguageTranslator = () => {
    const lang = useAppSelector(selectLanguage)
    const location = useLocation()

    useEffect(() => {
        const observer = new MutationObserver(() => {
            observer.disconnect()
            applyTranslationToDOM(lang)
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
            })
        })

        applyTranslationToDOM(lang)
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        })

        return () => observer.disconnect()
    }, [lang, location.pathname])

    return null
}
