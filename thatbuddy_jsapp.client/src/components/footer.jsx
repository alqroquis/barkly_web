import React from "react";
import { Container, Row, Col } from 'react-bootstrap';
import logo from '../assets/woof-logo.svg';
import apk from '../assets/apk.svg';
import googleplay from '../assets/googleplay.svg';
import appstore from '../assets/appstore.svg';


const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#F5F5F5',
            color: '#333333',
            padding: '40px 0 30px',
            borderRadius: 25,
            marginTop: 100
        }}>
            <Container>
                <Row className="align-items-center">
                    {/* Логотип и описание */}
                    <Col md={6} className="mb-4">
                        <div className="d-flex align-items-start mb-3">
                            <img
                                src={logo}
                                alt="WoofSupport"
                                style={{
                                    height: '40px',
                                    marginRight: '12px'
                                }}
                            />
                        </div>
                        <p style={{
                            fontSize: '14px',
                            opacity: '0.8',
                            lineHeight: '1.5',
                            marginBottom: '20px'
                        }}>
                            Не является медицинским приложением, в любом случае лучше всегда консультироваться с ветеринарами.
                        </p>
                    </Col>

                    {/* Навигация */}
                    <Col md={2} className="mb-4">
                        <h6 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '16px',
                            color: '#8AA65B'
                        }}>Приложение</h6>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            fontSize: '14px'
                        }}>
                            <li style={{ marginBottom: '8px' }}><a href="/features" style={{ color: '#333333', textDecoration: 'none' }}>Функции</a></li>
                            <li style={{ marginBottom: '8px' }}><a href="/tariffs" style={{ color: '#333333', textDecoration: 'none' }}>Тарифы</a></li>
                            <li style={{ marginBottom: '8px' }}><a href="/maps" style={{ color: '#333333', textDecoration: 'none' }}>Карты</a></li>
                            <li style={{ marginBottom: '8px' }}><a href="/shelters" style={{ color: '#333333', textDecoration: 'none' }}>Приюты</a></li>
                        </ul>
                    </Col>

                    {/* Кнопки скачивания */}
                    <Col md={2} className="mb-4">
                        <h6 style={{
                            fontSize: '14px',
                            fntWeight: '600',
                            marginBottom: '16px',
                            color: '#8AA65B'
                        }}>Скачать приложение</h6>
                        <div className="d-flex flex-column" style={{ gap: '10px' }}>
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
                    </Col>
                </Row>

                {/* Юридическая информация */}
                <Row className="mt-4">
                    <Col>
                        <div style={{
                            borderTop: '1px solid #E0E0E0',
                            paddingTop: '20px',
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#666666'
                        }}>
                            <p style={{ marginBottom: '5px' }}>
                                © {new Date().getFullYear()} ООО "ВУФ-Инвест" | ИНН 1234567890
                            </p>
                            <p style={{ marginBottom: '0' }}>
                                <a href="/privacy" style={{ color: '#666666', textDecoration: 'none', marginRight: '15px' }}>
                                    Политика конфиденциальности
                                </a>
                                <a href="/terms" style={{ color: '#666666', textDecoration: 'none' }}>
                                    Пользовательское соглашение
                                </a>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;