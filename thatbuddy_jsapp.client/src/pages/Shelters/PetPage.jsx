import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Carousel,
    Badge,
    Button,
    Tab,
    Tabs,
    Spinner,
    Alert,
    Modal
} from 'react-bootstrap';
import { motion } from 'framer-motion';

const PetDetails = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('about');
    const [showAdoptModal, setShowAdoptModal] = useState(false);
    const [favorite, setFavorite] = useState(false);

    useEffect(() => {
        const fetchPetDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/shelters/pets/${petId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPet(data.pet);
                setPhotos(data.photos);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.Message || 'Не удалось загрузить данные');
                setLoading(false);
            }
        };

        fetchPetDetails();
    }, [petId]);

    const handleAdoptClick = () => {
        setShowAdoptModal(true);
    };


    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Назад к списку</Button>
            </Container>
        );
    }

    if (!pet) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Container className="my-5 pet-detail-container mt-100">
                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
                            <Carousel indicators={photos.length > 1} controls={photos.length > 1}>
                                {photos.map((photo, index) => (
                                    <Carousel.Item key={index}>
                                        <div
                                            className="pet-image-container"
                                            style={{ backgroundImage: `url(${photo.photoUrl})` }}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </Card>
                    </Col>

                    <Col lg={6}>
                        <Card className="border-0 shadow-sm rounded-lg h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h1 className="mb-1 pet-name">{pet.name}</h1>
                                        <div className="d-flex align-items-center mb-3">
                                            <Badge
                                                bg={pet.adoptionStatus === 'Ищет семью' ? 'success' : 'danger'}
                                                className="me-2"
                                            >
                                                {pet.adoptionStatus}
                                            </Badge>
                                            <span className="text-muted">{pet.breedName} • {pet.genderName}</span>
                                        </div>
                                    </div>
                                    <Badge pill bg="light" className="text-dark fs-6">
                                        {pet.ageMonths} мес.
                                    </Badge>
                                </div>

                                <div className="pet-stats mb-4">
                                    <Row>
                                        <Col xs={4} className="text-center">
                                            <div className="stat-value">{pet.sizeName}</div>
                                            <div className="stat-label">Размер</div>
                                        </Col>
                                        <Col xs={4} className="text-center">
                                            <div className="stat-value">{pet.weight} кг</div>
                                            <div className="stat-label">Вес</div>
                                        </Col>
                                    </Row>
                                </div>

                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="mb-3"
                                >
                                    <Tab eventKey="about" title="О питомце">
                                        <div className="mt-3">
                                            <h5 className="mb-3">Характер</h5>
                                            <p>{pet.Personality || 'Информация отсутствует'}</p>

                                            <h5 className="mb-3 mt-4">Здоровье</h5>
                                            <ul className="list-unstyled">
                                                <li>
                                                    <strong>Вакцинация:</strong> {pet.vaccinationStatus || 'Не указано'}
                                                </li>
                                                <li>
                                                    <strong>Стерилизация:</strong> {pet.sterilizationStatus || 'Не указано'}
                                                </li>
                                                <li>
                                                    <strong>Состояние здоровья:</strong> {pet.healthStatus || 'Не указано'}
                                                </li>
                                            </ul>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="shelter" title="Приют">
                                        <div className="mt-3">
                                            <h5 className="d-flex align-items-center">
                                              {/*  <FaHome className="me-2 text-success" />*/}
                                                {pet.ShelterName}
                                            </h5>
                                            <div className="d-flex align-items-center mt-3 mb-2">
                                               {/* <FaMapMarkerAlt className="me-2 text-muted" />*/}
                                                <span>Адрес приюта</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                               {/* <FaPhone className="me-2 text-muted" />*/}
                                                <span>+7 (XXX) XXX-XX-XX</span>
                                            </div>
                                            <Button variant="outline-success">
                                                Показать на карте
                                            </Button>
                                        </div>
                                    </Tab>
                                </Tabs>
                                {pet.adoptionStatus === 'Ищет семью' && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="success"
                                            size="lg"
                                            className="w-100 mt-3 py-3 adopt-button"
                                            onClick={handleAdoptClick}
                                        >
                                            Хочу забрать!
                                        </Button>
                                    </motion.div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Modal show={showAdoptModal} onHide={() => setShowAdoptModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Забрать {pet.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Поздравляем с решением забрать {pet.name}!</p>
                        <p>Пожалуйста, заполните форму ниже, и мы свяжемся с вами для уточнения деталей.</p>
                        {/* Здесь должна быть форма для заявки */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAdoptModal(false)}>
                            Закрыть
                        </Button>
                        <Button variant="success" onClick={() => {
                            setShowAdoptModal(false);
                            navigate('/adoption-form', { state: { petId: pet.id } });
                        }}>
                            Перейти к анкете
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </motion.div>
    );
};

export default PetDetails;