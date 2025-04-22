import React from "react";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Modal, Button, Form } from "react-bootstrap";
import logo from "../assets/logo.svg";
import logoutIcon from '../assets/logout.svg';
import profileIcon from '../assets/profile.svg';
import settingsIcon from '../assets/settings.svg';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar navbar-expand-md navbar-light fixed-top bg-white">
            <div className="container-lg">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarTogglerDemo01"
                    aria-controls="navbarTogglerDemo01"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                    <a className="navbar-brand" href="#">
                        <img src={logo} alt="Логотип" />
                    </a>

                    <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
                        <li className="nav-item active">
                            <a className="nav-link" href="/">Скачать</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/maps">Карты</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Приюты</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Тарифы</a>
                        </li>
                    </ul>

                    {user ? (
                        <div className="d-flex align-items-start">
                            <a href="/profile" className="nav-link me-3 d-flex flex-column align-items-center">
                                <img src={profileIcon} alt="Личный кабинет" style={{ width: "24px", height: "24px" }} />
                                <span style={{ fontSize: "0.875rem", marginTop: "4px", maxWidth: 50, lineHeight: "0.875rem" }}>Личный кабинет</span>
                            </a>
                            <a href="#" className="nav-link me-3 d-flex flex-column align-items-center">
                                <img src={settingsIcon} alt="Настройки" style={{ width: "24px", height: "24px" }} />
                                <span style={{ fontSize: "0.875rem", marginTop: "4px" }}>Настройки</span>
                            </a>
                            <button className="nav-link me-3 d-flex flex-column align-items-center" onClick={logout}>
                                <img src={logoutIcon} style={{ width: "24px", height: "24px" }} />
                                <span style={{ fontSize: "0.875rem", marginTop: "4px" }}>Выйти</span>
                            </button>
                        </div>) :
                        <AuthModal />
                    }
                </div>
            </div>
        </nav>
    );
};

const AuthModal = () => {
    const { handleLogin } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [login, setLogin] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    // Обработчик отправки формы входа
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(login, password);
    };


    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }
        console.log("Логин:", login, "Пароль:", password);
        // Здесь можно добавить логику для регистрации
    };


    return (
        <div className="d-flex">
            <button className="black-button" onClick={() => setShowModal(true)}>
                Войти
            </button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isLoginForm ? "Вход" : "Регистрация"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoginForm ? (
                        // Форма входа
                        <Form onSubmit={handleLoginSubmit}>
                            <Form.Group className="mb-3" controlId="formLogin">
                                <Form.Label>Логин</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите логин"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formPassword">
                                <Form.Label>Пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                                Войти
                            </Button>
                        </Form>
                    ) : (
                        // Форма регистрации
                        <Form onSubmit={handleRegisterSubmit}>
                            <Form.Group className="mb-3" controlId="formLogin">
                                <Form.Label>Логин</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите логин"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label>Ваше имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите Ваше имя"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formPassword">
                                <Form.Label>Пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formConfirmPassword">
                                <Form.Label>Повторите пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Повторите пароль"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                                Зарегистрироваться
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-3">
                        <Button
                            variant="link"
                            onClick={() => setIsLoginForm(!isLoginForm)}
                        >
                            {isLoginForm
                                ? "Еще не с нами? Зарегистрироваться"
                                : "Уже есть аккаунт? Войти"}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Navbar;