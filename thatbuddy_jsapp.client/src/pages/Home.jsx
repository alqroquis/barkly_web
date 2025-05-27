import React, { useState } from "react";
import activity from '../assets/activity_image.jpg';
import remind from '../assets/reminder_image.jpg';
import document from '../assets/document_image.jpg';
import analys from '../assets/analis_image.jpg';
import blog from '../assets/blog_image.jpg';
import tracker from '../assets/tracker_image.jpg';
import shelter from '../assets/shelter_image.jpg';
import news from '../assets/news_image.jpg';
import appLogo from '../assets/woof-logo-wide.svg';
import banner_mobile from '../assets/banner_mobile.png';
import banner_desktop from '../assets/banner_desktop.png';
import apk from '../assets/apk.svg';
import googleplay from '../assets/googleplay.svg';
import appstore from '../assets/appstore.svg';


const Home = () => {
    return <CustomContainer />;
};


const textArray = [
    "Удобные напоминания",
    "Трекер активности",
    "Прием лекарств",
    "Карта dog-friendly мест",
    "Документы в одном месте",
    "Медицинская карта"
];


const StyledParagraphs = () => {
    return (
        <div className="text-container d-none d-sm-flex">
            {textArray.map((text, index) => (
                <p key={index} className={`custom-paragraph ${index % 2 === 0 ? "even" : "odd"}`}>
                    {text}
                </p>
            ))}
        </div>
    );
};


const functionsList = [
    {
        name: 'Отслеживать здоровье и активность собаки',
        description: 'Регистрация прогулок, визитов к ветеринару, стрижек и других событий поможет вам быть уверенным в здоровье вашего питомца.',
        src: activity
    },
    {
        name: 'Получать напоминания о важных событиях',
        description: 'Не забудьте о важных процедурах, таких как прием лекарств или уход за шерстью — наш сервис напомнит вам!',
        src: remind
    },
    {
        name: 'Хранить все важные документы',
        description: 'Вся информация, включая ветеринарные справки, паспорта и другие документы, всегда будет под рукой.',
        src: document
    },
    {
        name: 'Анализировать статистику по каждому питомцу',
        description: 'Смотрите данные о здоровье и активности вашего питомца, чтобы вовремя реагировать на любые изменения.',
        src: analys
    }
]


const societyList = [
    {
        name: 'Полезные статьи от кинологов',
        description: 'Читайте статьи о том, как правильно ухаживать за собакой, а также получайте советы от профессиональных кинологов и ветеринаров.',
        src: blog
    },
    {
        name: 'Безопасные и удобные прогулки',
        description: 'Используйте интерактивную карту с тепловыми зонами, чтобы находить популярные маршруты и избегать опасных мест.',
        src: tracker
    },
    {
        name: 'Список приютов',
        description: 'Узнайте, как можно помочь животным и поддержать приюты в вашем городе.',
        src: shelter
    },
    {
        name: 'Новости в Вашем городе',
        description: 'Вы найдете актуальные новости о мероприятиях, выставках, встречах собаководов и благотворительных акциях.',
        src: news
    }
]


const AppInfo = () => {
    return (
        <div className="d-flex flex-lg-row flex-column align-items-lg-start align-items-center text-lg-start text-center p-4 mt-100">
            
            <div className="flex-shrink-0"
                style={{
                    width: "166px",
                    height: "166px",
                    background: `url(${appLogo}) center/cover`,
                    borderRadius: "30px",
                }}
            ></div>

            <div className="ms-lg-4 mt-3 mt-lg-0">
                <h3 className="fw-bold text-lg-start" style={{ maxWidth: "400px" }}>Woof!</h3>
                <p style={{ maxWidth: "400px" }}>
                    Следите за здоровьем питомца и делайте жизнь с собакой в городе проще! Напоминания, карты, лекарства — всё в одном приложении.
                </p>

                <div className="d-flex flex-wrap justify-content-lg-start justify-content-center gap-2">
                    <button className="black-button d-flex align-items-center gap-2">
                        <img src={apk} alt="Android" width="20" height="20" />
                        APK
                    </button>
                    <button className="black-button d-flex align-items-center gap-2">
                        <img src={googleplay} alt="Google Play" width="20" height="20" />
                        Google Play
                    </button>
                    <button className="black-button d-flex align-items-center gap-2">
                        <img src={appstore} alt="App Store" width="20" height="20" />
                        App Store
                    </button>
                </div>
            </div>
        </div>
    );
};


const faqs = [
    { question: "Сколько питомцев можно добавить в приложении?", answer: "Вы можете добавить одного питомца в бесплатной версии и до десяти питомцев с тарифом PRO." },
    { question: "Как настроить напоминания о вакцинации и других процедурах?", answer: "Зайдите в раздел \"Напоминания\" и создайте новое событие. Укажите тип процедуры, дату и периодичность – приложение само напомнит вам о важных делах." },
    { question: "Вы сами ведете записи карты опасностей?", answer: "Нет, это делают пользователи, авторизованные в нашем приложении. Если Вы столкнулись с проблемой, Вы можете найти на странице Карты опасностей кнопку для отправки сообщения." },
    { question: "Как часто обновляется карта опасностей?", answer: "Карта опасностей выводит все отметки пользователей за последние два месяца. Новые отметки попадают на карту сразу после проверки сообщения." },
    { question: "Можно ли делиться профилем питомца с другими пользователями?", answer: "Да! Вы можете открыть доступ к профилю питомца для членов семьи или друзей, чтобы они могли добавлять записи и получать напоминания." },
    { question: "Как связаться с поддержкой?", answer: "Напишите нам через форму обратной связи в настройках. Мы всегда рады обратной связи!" },
];


const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="container d-flex flex-column gap-3 p-3 mt-5 mb-3">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    style={{
                        background: "#FFFFFF",
                        borderRadius: "12px",
                        cursor: "pointer",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                    }}
                    className="faq-item p-3"
                >
                    <div
                        className="d-flex justify-content-between align-items-center w-100"
                        onClick={() => toggleFAQ(index)}
                    >
                        <p className="mb-0 fw-bold">{faq.question}</p>
                        <div
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                background: "#F5F5F5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            {openIndex === index ? (
                                <span style={{ fontSize: "18px" }}>−</span>
                            ) : (
                                <span style={{ fontSize: "18px" }}>+</span>
                            )}
                        </div>
                    </div>
                    {openIndex === index && (
                        <div
                            className="mt-3 text-secondary"
                            style={{
                                textAlign: "left",
                                width: "100%",
                                borderTop: "1px solid #eee",
                                paddingTop: "12px"
                            }}
                        >
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


const CustomContainer = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            
            <picture style={{marginTop:80}}>
                <source srcSet={banner_desktop} media="(min-width: 768px)" />
                <img src={banner_mobile} alt="Баннер" className="img-fluid" />
            </picture>

            <h3 className="mt-100 d-flex w-100 justify-content-center">Идеальное решение для <br/> заботливых владельцев собак!</h3>
            <div className="w-100 d-flex justify-content-center">
                <p className="text-center" style={{ maxWidth: "50%" }}>
                    Мы предлагаем универсальное приложение, которое объединяет трекер для ухода за вашим питомцем и социальную платформу для общения с другими собаководами. Это место, где забота о здоровье вашего любимца становится проще, а общение с единомышленниками — интересным и полезным.
                </p>
            </div>
          

            <h3 className="mt-100 d-flex w-100 justify-content-center">Для вашего питомца — все в одном месте</h3>
            <p className="text-center w-100">С помощью нашего приложения вы сможете:</p>

            <div className="row row-cols-1 row-cols-lg-4 row-cols-md-2 g-4 mt-3">
                {functionsList.map((elem, index) => <div key={index} className="col">
                    <div className="card" style={{ border: 'none' }}>
                        <img src={elem.src} className="card-img-top" alt={elem.name} style={{ borderRadius: 30 }} />
                        <div className="card-body">
                            <h5 className="card-title">{elem.name}</h5>
                            <p className="card-text">{elem.description}</p>
                        </div>
                    </div>
                </div>)}
            </div>

            <h3 className="mt-100 d-flex w-100 justify-content-center">Сообщество собаководов — обмен опытом и поддержка</h3>
            <p className="text-center w-100">Мы стремимся создать пространство, где каждый собаковод может найти полезные советы и поддержку. На платформе доступны:</p>
            <div className="row row-cols-1 row-cols-md-4 g-4 mt-3">
                {societyList.map((elem, index) => <div key={index} className="col">
                    <div className="card" style={{ border: 'none' }}>
                        <img src={elem.src} className="card-img-top" alt={elem.name} style={{ borderRadius: 30 }} />
                        <div className="card-body">
                            <h5 className="card-title">{elem.name}</h5>
                            <p className="card-text">{elem.description}</p>
                        </div>
                    </div>
                </div>)}
            </div>

            <h3 className="mt-100 d-flex w-100 justify-content-center">Удобнее вести записи в приложении</h3>
            <div className="w-100 d-flex justify-content-center">
                <AppInfo />
            </div>

            <h3 className="mt-100 d-flex w-100 justify-content-center">FAQ | Частые вопросы </h3>
           <FAQ />
        </div>
    );
};


export default Home;