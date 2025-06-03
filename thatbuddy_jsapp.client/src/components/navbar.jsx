import React from "react";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { Modal, Form } from "react-bootstrap";
import logo from "../assets/woof-logo.svg";
import logoutIcon from '../assets/logout.svg';
import profileIcon from '../assets/profile.svg';
import petIcon from '../assets/pet-icon.svg';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <Navbar bg="white" expand="md" fixed="top" className="py-2">
            <Container>
                <Navbar.Brand href="/">
                    <img src={logo} alt="Логотип" height="50" />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="offcanvasNavbar" />

                <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                >
                    <Offcanvas.Header closeButton>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="mx-auto">
                            <Nav.Link href="/">Скачать</Nav.Link>
                            <Nav.Link href="/maps">Карты</Nav.Link>
                            <Nav.Link href="/shelters">Приюты</Nav.Link>
                            <Nav.Link href="/tariffs">Тарифы</Nav.Link>
                        </Nav>

                        {user ? (
                            <div className="d-flex align-items-start">
                                <Nav.Link href="/profile" className="d-flex flex-column align-items-center me-3">
                                    <img src={petIcon} alt="Питомцы" style={{ width: "24px", height: "24px" }} />
                                    <span style={{ fontSize: "0.875rem", marginTop: "4px" }}>Питомцы</span>
                                </Nav.Link>
                                <Nav.Link href="/me" className="d-flex flex-column align-items-center me-3">
                                    <img src={profileIcon} alt="Личный кабинет" style={{ width: "24px", height: "24px" }} />
                                    <span style={{ fontSize: "0.875rem", marginTop: "4px", maxWidth: 50, lineHeight: "0.875rem" }}>Личный кабинет</span>
                                </Nav.Link>
                                <Button variant="link" className="d-flex flex-column align-items-center me-3 p-0" onClick={logout}>
                                    <img src={logoutIcon} alt="Выйти" style={{ width: "24px", height: "24px" }} />
                                    <span style={{ fontSize: "0.875rem", marginTop: "20px" }}>Выйти</span>
                                </Button>
                            </div>
                        ) : (
                            <AuthModal />
                        )}
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
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

                            <Button variant="primary btn-green" type="submit" className="w-100">
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

                                <Button variant="primary" type="submit" className="w-100 btn-green">
                                Зарегистрироваться
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-3">
                        <Button
                            style={{ textDecoration: 'none', color: '#000000'}}
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

export default Navigation;