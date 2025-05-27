import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ShelterPage = () => {
    const { shelterId } = useParams();
    const [shelter, setShelter] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showAdoptionModal, setShowAdoptionModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        amount: 1000
    });

    const [filters, setFilters] = useState({
        searchText: '',
        genderId: null,
        minAge: null,
        maxAge: null,
        adoptionStatusId: null
    });

    useEffect(() => {
        const fetchShelterData = async () => {
            try {
                // Создаем общий заголовок для всех запросов
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                };

                // Формируем query-параметры
                const queryParams = new URLSearchParams();
                if (filters.genderId) queryParams.append('genderId', filters.genderId);
                if (filters.minAge) queryParams.append('minAge', filters.minAge);
                if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);
                if (filters.adoptionStatusId) queryParams.append('adoptionStatusId', filters.adoptionStatusId);
                if (filters.searchText) queryParams.append('searchText', filters.searchText);

                // Делаем параллельные запросы
                const [shelterResponse, petsResponse] = await Promise.all([
                    fetch(`/api/shelters/details/${shelterId}`, { headers }),
                    fetch(`/api/shelters/${shelterId}?${queryParams.toString()}`, { headers })
                ]);

                // Проверяем статус ответов
                if (!shelterResponse.ok) {
                    throw new Error(`Shelter request failed with status ${shelterResponse.status}`);
                }
                if (!petsResponse.ok) {
                    throw new Error(`Pets request failed with status ${petsResponse.status}`);
                }

                // Парсим JSON
                const [shelterData, petsData] = await Promise.all([
                    shelterResponse.json(),
                    petsResponse.json()
                ]);

                // Обновляем состояние
                setShelter(shelterData);
                setPets(petsData);
                setLoading(false);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message || 'Ошибка загрузки данных');
                setLoading(false);
            }
        };

        fetchShelterData();
    }, [shelterId, filters]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitVolunteer = async (e) => {
        e.preventDefault();
        // Отправка формы волонтерства
        setShowVolunteerModal(false);
    };

    const handleSubmitDonation = async (e) => {
        e.preventDefault();
        // Отправка формы пожертвования
        setShowDonationModal(false);
    };

    const handleAdoptClick = (pet) => {
        setSelectedPet(pet);
        setShowAdoptionModal(true);
    };

    const handleSubmitAdoption = async (e) => {
        e.preventDefault();
        // Отправка формы усыновления
        setShowAdoptionModal(false);
    };

    if (loading) return <Spinner animation="border" variant="success" />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!shelter) return <div>Приют не найден</div>;

    return (
        <div className="shelter-page">
            {/* Шапка приюта */}
            <Card className="shelter-header mb-4 mt-100 border-0">
                <Row className="g-0">
                    <Col md={3} className="d-flex align-items-center justify-content-center">
                        <Card.Img
                            src={shelter.logoUrl || '/images/default-shelter.png'}
                            alt={shelter.name}
                            className="shelter-logo"
                        />
                    </Col>
                    <Col md={9}>
                        <Card.Body>
                            <Card.Title className="shelter-title">{shelter.name}</Card.Title>
                            <Card.Text className="shelter-description">{shelter.description}</Card.Text>
                            <div className="shelter-meta">
                                <div className="shelter-meta">
                                    <p className="d-flex align-items-center">
                                        <img
                                            src="https://img.icons8.com/?size=100&id=14181&format=png&color=8AA65B"
                                            alt="Адрес"
                                            className="me-2"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        {shelter.phoneNumber || 'Не указан'}
                                    </p>
                                    <p className="d-flex align-items-center">
                                        <img
                                            src="https://img.icons8.com/?size=100&id=56977&format=png&color=8AA65B"
                                            alt="Часы работы"
                                            className="me-2"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        {shelter.address || 'Не указан'}
                                    </p>
                                    <p className="d-flex align-items-center">
                                        <img
                                            src="https://img.icons8.com/?size=100&id=4L95JCI3LAP4&format=png&color=8AA65B"
                                            alt="Телефон"
                                            className="me-2"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        {shelter.workingHours || 'Ежедневно 10:00-18:00'}
                                    </p>
                                </div>
                                {shelter.websiteUrl && (
                                    <p className="d-flex align-items-center">
                                        <img
                                            src="https://img.icons8.com/?size=100&id=120456&format=png&color=8AA65B"
                                            alt="Телефон"
                                            className="me-2"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                          <a href={shelter.websiteUrl} target="_blank" rel="noreferrer">
                                            {shelter.websiteUrl}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>

            <div className="shelter-actions mb-5">
                <Row className="g-4">
                    {/* Карточка пожертвования */}
                    <Col md={6}>
                        <Card
                            className="h-100 donation-card shadow-sm border-0"
                            data-aos="fade-right"
                        >
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src="/icons/donation-heart.png"
                                        alt="Пожертвование"
                                        className="me-3"
                                        style={{ width: '48px', height: '48px' }}
                                    />
                                    <Card.Title className="mb-0" style={{ color: '#8AA65B' }}>Поддержать приют</Card.Title>
                                </div>

                                <Card.Text className="flex-grow-1">
                                    Каждая помощь важна! Ваши пожертвования идут на лечение, корм и содержание животных.
                                    Мы ведем открытую отчетность - вы всегда можете узнать, как были использованы средства.
                                </Card.Text>

                                <div className="mt-3">
                                    <Button
                                        variant="success"
                                        className="w-100 py-2"
                                        onClick={() => setShowDonationModal(true)}
                                    >
                                        Сделать пожертвование
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Карточка волонтерства */}
                    <Col md={6}>
                        <Card
                            className="h-100 volunteer-card shadow-sm border-0"
                            data-aos="fade-left"
                            data-aos-delay="150"
                        >
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src="/icons/volunteer-hands.png"
                                        alt="Волонтерство"
                                        className="me-3"
                                        style={{ width: '48px', height: '48px' }}
                                    />
                                    <Card.Title className="mb-0" style={{ color: '#8AA65B' }}>Стать частью команды</Card.Title>
                                </div>

                                <Card.Text className="flex-grow-1">
                                    Нам всегда нужны помощники! Вы можете:
                                    <ul className="mt-2">
                                        <li>Стать временным опекуном питомца</li>
                                        <li>Помочь с передержкой животных</li>
                                        <li>Участвовать в благотворительных акциях</li>
                                    </ul>
                                </Card.Text>

                                <div className="mt-auto">
                                    <Button
                                        variant="outline-success"
                                        className="w-100 py-2"
                                        onClick={() => setShowVolunteerModal(true)}
                                    >
                                        Заполнить анкету волонтера
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Информация о питомцах */}
            <h3 className="mb-4">Наши питомцы</h3>

            {/* Панель фильтров */}
            <Card className="mb-4 filter-panel">
                <Card.Body>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0 border-0">
                            <Form.Control
                                type="search"
                                placeholder="Поиск по имени или описанию..."
                                value={filters.searchText}
                                className="search-input"
                                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                            />
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col xs={4}>
                                    <Form.Select
                                        value={filters.genderId || ''}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            genderId: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                    >
                                        <option value="">Любой пол</option>
                                        <option value="1">Мальчик</option>
                                        <option value="2">Девочка</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={4}>
                                    <Form.Select
                                        value={filters.minAge || ''}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            minAge: e.target.value ? parseInt(e.target.value) : null,
                                            maxAge: e.target.value === '8' ? null : filters.maxAge
                                        })}
                                    >
                                        <option value="">Любой возраст</option>
                                        <option value="0">Щенки/котята</option>
                                        <option value="1">1+ лет</option>
                                        <option value="3">3+ лет</option>
                                        <option value="8">8+ лет</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={4}>
                                    <Form.Select
                                        value={filters.maxAge || ''}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            maxAge: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                        disabled={filters.minAge >= 8}
                                    >
                                        <option value="">Макс. возраст</option>
                                        <option value="1">До 1 года</option>
                                        <option value="3">До 3 лет</option>
                                        <option value="7">До 7 лет</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {!loading.pets && (
                <Row xs={1} md={2} lg={3} className="g-4 mb-5">
                    {pets.length > 0 ? (
                        pets.map(pet => (
                            <Col key={pet.id}>
                                <Card className="h-100 border-0 shadow-hover"
                                    as={Link}
                                    to={`/shelters/pets/${pet.id}`}
                                    style={{
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        textDecoration: 'none'
                                    }}>
                                    {/* Контейнер для фото с эффектом увеличения при наведении */}
                                    <div style={{
                                        height: '280px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <Card.Img
                                            variant="top"
                                            src={pet.primaryPhotoUrl || '/images/default-pet.jpg'}
                                            alt={pet.name}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s',
                                                transform: 'scale(1)'
                                            }}
                                            className="card-img-hover"
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            backgroundColor: pet.adoptionStatus === 'dog' ? '#8AA65B' : '#FF6B6B',
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {pet.adoptionStatus}
                                        </div>
                                    </div>

                                    <Card.Body className="pt-3 pb-0">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <Card.Title className="mb-2" style={{ fontSize: '1.2rem' }}>
                                                {pet.name}, {pet.ageMonths} мес.
                                            </Card.Title>
                                            <span className="pet-age-badge">
                                                {pet.sizeName}
                                            </span>
                                        </div>

                                        <Card.Text className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                                            {pet.breedName} • {pet.genderName}
                                        </Card.Text>

                                        <Card.Text className="mb-3" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontSize: '0.9rem'
                                        }}>
                                            {pet.description || 'Нет описания'}
                                        </Card.Text>
                                    </Card.Body>

                                    <Card.Footer className="bg-white border-0 pt-0">
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            style={{
                                                borderRadius: '10px',
                                                padding: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                backgroundColor: '#8AA65B',
                                                borderColor: '#8AA65B'
                                            }}
                                            onClick={() => handleAdoptClick(pet)}
                                            disabled={pet.adoptionStatus !== 'Ищет семью'}
                                        >
                                            Взять домой
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center py-5">
                            <div className="no-pets-found">
                                <img
                                    src="/assets/sad-pet.png"
                                    alt="No pets found"
                                    className="no-pets-image"
                                />
                                <h4 className="text-muted mb-3">Питомцы не найдены</h4>
                                <p className="text-muted">Попробуйте изменить параметры поиска</p>
                                <Button
                                    variant="outline-secondary"
                                    className="mt-3"
                                    onClick={() => setFilters({ ...filters, shelterId: 0 })}
                                >
                                    Сбросить фильтры
                                </Button>
                            </div>
                        </Col>
                    )}
                </Row>
            )}

            {/* Модальное окно волонтерства */}
            <Modal show={showVolunteerModal} onHide={() => setShowVolunteerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Стать волонтером в {shelter.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitVolunteer}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ваше имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Почему вы хотите стать волонтером?</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="message"
                                value={formData.message}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit">
                            Отправить заявку
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно пожертвования */}
            <Modal show={showDonationModal} onHide={() => setShowDonationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Помочь приюту {shelter.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitDonation}>
                        <Form.Group className="mb-3">
                            <Form.Label>Сумма пожертвования (руб.)</Form.Label>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleFormChange}
                                min="100"
                                step="100"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ваше имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit">
                                Подтвердить пожертвование
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно усыновления */}
            <Modal show={showAdoptionModal} onHide={() => setShowAdoptionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Усыновить {selectedPet?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitAdoption}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ваше имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Расскажите о себе и условиях содержания</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="message"
                                value={formData.message}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit">
                                Отправить заявку
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ShelterPage;