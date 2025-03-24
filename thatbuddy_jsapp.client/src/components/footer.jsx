import React from "react";

const Footer = () => {
    return (
        <footer className="bg-dark text-light p-5 mt-5" style={{borderRadius: 30}}>
            <div className="container">
                <div className="row">
                    {/* Левая колонка - информация о компании */}
                    <div className="col-lg-4 col-md-6 mb-3">
                        <h5>ООО &quot;ЭтоМойПес&quot;</h5>
                        <p className="mb-1">ИНН: 1234567890</p>
                        <p className="mb-1">ОГРН: 9876543210</p>
                        <p>Адрес: г. Москва, ул. Примерная, д. 10</p>
                    </div>

                    {/* Центральная колонка - контакты */}
                    <div className="col-lg-4 col-md-6 mb-3">
                        <h5>Контакты</h5>
                        <p className="mb-1 d-flex align-items-center">
                            <img src="https://img.icons8.com/?size=100&id=p245zwoX4pkU&format=png&color=FFFFFF" alt="Телефон" width="24" className="me-2" />
                            <a href="tel:+79991234567" className="text-light text-decoration-none">+7 (999) 123-45-67</a>
                        </p>
                        <p className="d-flex align-items-center">
                            <img src="https://img.icons8.com/?size=100&id=okvpqeYbG0xb&format=png&color=FFFFFF" alt="Email" width="24" className="me-2" />
                            <a href="mailto:info@mybuddy.ru" className="text-light text-decoration-none">info@mybuddy.ru</a>
                        </p>
                    </div>

                    {/* Правая колонка - соцсети */}
                    <div className="col-lg-4 col-md-12">
                        <h5>Мы в соцсетях</h5>
                        <div className="d-flex gap-3">
                            <a href="https://t.me/mybuddy" className="text-light" target="_blank" rel="noopener noreferrer">
                                <img src="https://img.icons8.com/?size=100&id=63306&format=png&color=000000" alt="Telegram" width="30" />
                            </a>
                            <a href="https://vk.com" className="text-light" target="_blank" rel="noopener noreferrer">
                                <img src="https://img.icons8.com/?size=100&id=114452&format=png&color=000000" alt="VK" width="30" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Подвал с правами */}
                <div className="text-center mt-3">
                    <p className="mb-0">&copy; {new Date().getFullYear()} ООО &quot;That’s My Buddy&quot;. Все права защищены.</p>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
