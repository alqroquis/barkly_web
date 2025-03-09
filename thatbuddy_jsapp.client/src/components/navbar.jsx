import React from "react";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Modal, Button } from "react-bootstrap";
import logo from "../assets/logo.svg"; // Подставьте путь к изображению


const Navbar = () => {
    const { user, loginWithGoogle, loginWithYandex, logout } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
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
                            <a className="nav-link" href="#">Скачать</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Карты</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Приюты</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Тарифы</a>
                        </li>
                    </ul>

                    {user ? (<Button variant="danger" onClick={logout}> Выйти </Button>) : (<>
                        <div className="d-flex">
                            <button className="black-button" onClick={() => setShowModal(true)}>Войти</button>

                            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Выберите способ входа</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="text-center">
                                    <Button variant="outline-primary" className="w-100 mb-2" onClick={loginWithGoogle}>
                                        Войти через Google
                                    </Button>
                                    <Button variant="outline-warning" className="w-100" onClick={loginWithYandex}>
                                        Войти через Яндекс
                                    </Button>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </>)}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;