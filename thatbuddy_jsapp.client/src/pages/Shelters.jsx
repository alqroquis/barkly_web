import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ShelterMap from './Components/YandexMaps';
import defaultLogo from '../assets/default.svg';
import { Container, Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';

const Shelters = () => {
    const [shelters, setShelters] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState({
        shelters: true,
        pets: true
    });
    const [error, setError] = useState(null);

    // Состояние фильтров
    const [filters, setFilters] = useState({
        shelterId: 0,
        breedId: null,
        sizeId: null,
        genderId: null,
        minAge: null,
        maxAge: null,
        adoptionStatusId: null,
        searchText: ''
    });

    // Загрузка приютов
    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const response = await fetch('/api/shelters/list');
                if (!response.ok) throw new Error('Не удалось загрузить приюты');
                const data = await response.json();
                setShelters(data);
                setLoading(prev => ({ ...prev, shelters: false }));
            } catch (err) {
                setError(err.message);
                setLoading(prev => ({ ...prev, shelters: false }));
            }
        };

        fetchShelters();
    }, []);

    // Загрузка питомцев с учетом фильтров
    useEffect(() => {
        const fetchPets = async () => {
            try {
                setLoading(prev => ({ ...prev, pets: true }));

                // Формируем query-параметры
                const queryParams = new URLSearchParams();
                if (filters.shelterId > 0) queryParams.append('shelterId', filters.shelterId);
                if (filters.breedId) queryParams.append('breedId', filters.breedId);
                if (filters.sizeId) queryParams.append('sizeId', filters.sizeId);
                if (filters.genderId) queryParams.append('genderId', filters.genderId);
                if (filters.minAge) queryParams.append('minAge', filters.minAge);
                if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);
                if (filters.adoptionStatusId) queryParams.append('adoptionStatusId', filters.adoptionStatusId);
                if (filters.searchText) queryParams.append('searchText', filters.searchText);

                const response = await fetch(`/api/shelters/0?${queryParams.toString()}`);
                if (!response.ok) throw new Error('Не удалось загрузить питомцев');

                const data = await response.json();
                setPets(data);
                setLoading(prev => ({ ...prev, pets: false }));
            } catch (err) {
                setError(err.message);
                setLoading(prev => ({ ...prev, pets: false }));
            }
        };

        fetchPets();
    }, [
        filters.shelterId,
        filters.breedId,
        filters.sizeId,
        filters.genderId,
        filters.minAge,
        filters.maxAge,
        filters.adoptionStatusId,
        filters.searchText
    ]);

    if (loading.shelters) return (
        <div className="d-flex justify-content-center mt-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return (
        <Alert variant="danger" className="mt-5">
            Ошибка: {error}
        </Alert>
    );

    return (
        <Container fluid style={{ marginTop: 100 }}>
            <h1 className="text-center mb-4">
                Помогите тем, кому не хватает<br />
                любви и заботы
            </h1>

            <p className="text-left w-50 mx-auto mb-5">
                Ознакомьтесь с картой приютов, выберите питомца, поддержите волонтеров или сделайте пожертвование.
            </p>

            <ShelterMap />

            {/* Секция приютов */}
            <h1 className="text-center my-5 mt-5">
                Список приютов
            </h1>
            <Row className="justify-content-center mb-5">
                {shelters.map(shelter => (
                    <Col key={shelter.id} xs={6} sm={4} md={3} lg={2} className="mb-4">
                        <Card
                            as={Link}
                            to={`/shelters/${shelter.id}`}
                            className={`text-center border-0 h-100`}
                            style={{ cursor: 'pointer', textDecoration: 'none' }}
                        >
                            <Card.Body>
                                <div className="mx-auto mb-3" style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    filter: "drop-shadow(0px 0px 7px rgba(0, 0, 0, 0.25))",
                                    backgroundColor: '#f9f9f9'
                                }}>
                                    <img
                                        src={shelter.logoUrl || defaultLogo}
                                        alt={shelter.name}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <Card.Title className="h6 mb-1">{shelter.name}</Card.Title>
                                <Card.Text className="text-muted small">
                                    {shelter.address.split(',')[0]}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Секция питомцев с фильтрами */}
            <h1 className="text-center my-5 mt-5">
                Наши питомцы ищут дом
            </h1>

            {/* Панель фильтров и поиска */}
            <Card className="mt-5 mb-4 filter-panel">
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

            {/* Индикатор загрузки */}
            {loading.pets && (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {/* Список питомцев */}
            {!loading.pets && (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-5">
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
                                    <div style={{
                                        height: '280px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <Card.Img
                                            variant="top"
                                            src={pet.primaryPhotoUrl || defaultLogo}
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
                                            backgroundColor: pet.adoptionStatus === 'Ищет семью' ? '#8AA65B' : '#FF6B6B',
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
                            <div style={{
                                background: '#f8f9fa',
                                borderRadius: '15px',
                                padding: '40px',
                                border: '2px dashed #e0e0e0'
                            }}>
                                <img
                                    src="/assets/sad-pet.png"
                                    alt="No pets found"
                                    style={{ width: '100px', opacity: 0.7, marginBottom: '20px' }}
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
        </Container>
    );
};
export default Shelters;
