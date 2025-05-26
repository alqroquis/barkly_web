import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';
import { Modal, Button, Form, Container, Spinner, Row, Col, Card, Badge } from "react-bootstrap";
import { dangersList, dangerAdd, trafficList, trafficAdd } from '../functions/maps';
import { Link } from 'react-router-dom';

// 
const AddDangerPointModal = ({ show, coords, onHide, onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSave = () => {
        if (!title) {
            alert("Введите название точки");
            return;
        }

        onSave({
            name: title,
            description,
            coords,
        });

        setTitle("");
        setDescription("");
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить точку опасности</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Координаты</Form.Label>
                        <div className="text-muted">
                            Широта: {coords?.[0]?.toFixed(6)}, Долгота: {coords?.[1]?.toFixed(6)}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDangerTitle">
                        <Form.Label>Название опасности*</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Например: Бродячие собаки"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDangerDescription">
                        <Form.Label>Описание</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Подробное описание опасности"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button variant="danger" onClick={handleSave}>
                    Добавить точку
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export const AddTrafficPointModal = ({ show, coords, onHide, onSave, isLoading }) => {
    const [selectedTime, setSelectedTime] = useState('');

    const handleSave = () => {
        if (!selectedTime || !coords) {
            alert("Выберите время и убедитесь, что координаты установлены");
            return;
        }

        // Форматируем время в HH:MM:SS
        const formattedTime = `${selectedTime}:00`;

        onSave({
            coords,
            activityTime: formattedTime
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить точку загруженности</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Координаты</Form.Label>
                        <div className="text-muted">
                            Широта: {coords?.[0]?.toFixed(6)}, Долгота: {coords?.[1]?.toFixed(6)}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Время прогулки*</Form.Label>
                        <Form.Control
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        />
                        <Form.Text className="text-muted">
                            Выберите время, когда вы обычно гуляете с собакой
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                    Отмена
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Добавление...' : 'Добавить точку'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

//
const YandexMap = ({ points, mode = 'danger', onMapClick, trafficPoints = [] }) => {
    const mapRef = useRef(null);
    const [ymaps, setYmaps] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [userLocation, setUserLocation] = useState([55.751574, 37.573856]);
    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setIsLoading(false);
                },
                () => {
                    setIsLoading(false);
                }
            );
        } else {
            setIsLoading(false);
        }
    }, []);

    const getPlacemarkOptions = (pointMode) => {
        const options = {
            danger: {
                iconLayout: 'default#image',
                iconImageHref: 'https://img.icons8.com/?size=100&id=9o8zt9bo50Lj&format=png&color=000000',
                iconImageSize: [45, 45],
                iconImageOffset: [-15, -15]
            },
            traffic: {
                iconLayout: 'default#image',
                iconImageHref: 'https://img.icons8.com/?size=100&id=67uiU3EeXuIi&format=png&color=000000',
                iconImageSize: [45, 45],
                iconImageOffset: [-15, -15]
            }
        };
        return options[pointMode] || options.danger;
    };

    // Получаем точки для текущего режима
    const getCurrentPoints = () => {
        if (mode === 'traffic') {
            return trafficPoints;
        }
        return points;
    };

    if (loadError) {
        return (
            <div style={{
                width: '100%',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8f9fa',
                borderRadius: '20px',
                border: '1px dashed #ccc'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h4>Не удалось загрузить карту</h4>
                    <p>{loadError.message || "Проверьте интернет-соединение"}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    const currentPoints = getCurrentPoints();

    return (
        <div style={{ width: '100%', height: '50vh', borderRadius: '20px', overflow: 'hidden' }}>
            {isLoading ? (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#f5f5f5'
                }}>
                    Определяем ваше местоположение...
                </div>
            ) : (
                <YMaps
                    query={{
                        apikey: '0e1cca1e-99fa-411e-b190-1ac33ce1f87c',
                        lang: 'ru_RU',
                        load: 'package.full'
                    }}
                    onLoad={ymaps => setYmaps(ymaps)}
                    onError={setLoadError}
                >
                    <Map
                        onClick={onMapClick}
                        instanceRef={mapRef}
                        defaultState={{
                            center: userLocation,
                            zoom: 12,
                            controls: ['zoomControl', 'fullscreenControl']
                        }}
                        width="100%"
                        height="100%"
                        modules={['geocode']}
                    >
                        <SearchControl options={{ float: "right" }} />

                        {mode === 'danger' && currentPoints.map(point => (
                            <Placemark
                                key={point.id}
                                geometry={point.coords}
                                options={{
                                    iconLayout: 'default#image',
                                    iconImageHref: 'https://img.icons8.com/?size=100&id=9o8zt9bo50Lj&format=png&color=000000',
                                    iconImageSize: [45, 45],
                                    iconImageOffset: [-15, -15],
                                    hideIconOnBalloonOpen: false,
                                    balloonOffset: [0, -20]
                                }}
                                properties={{
                                    hintContent: `<strong>${point.name}</strong>`,
                                    balloonContent: `
            <div style="padding: 15px; max-width: 300px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="https://img.icons8.com/?size=100&id=9o8zt9bo50Lj&format=png&color=FF0000" 
                         style="width: 30px; height: 30px; margin-right: 10px;">
                    <h4 style="margin: 0; color: #d9534f;">${point.name}</h4>
                </div>
                
                <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                    <p style="margin: 0; font-size: 14px;">${point.description}</p>
                </div>
                
                <div style="display: flex; align-items: center; margin-top: 10px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6c757d" style="margin-right: 5px;">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span style="font-size: 12px; color: #6c757d;">
                        ${point.coords[0].toFixed(6)}, ${point.coords[1].toFixed(6)}
                    </span>
                </div>
                
                <div style="display: flex; align-items: center; margin-top: 5px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6c757d" style="margin-right: 5px;">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span style="font-size: 12px; color: #6c757d;">
                        Добавил: ${point.user?.name || 'Неизвестно'}
                    </span>
                </div>
                
                <div style="display: flex; align-items: center; margin-top: 5px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6c757d" style="margin-right: 5px;">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    <span style="font-size: 12px; color: #6c757d;">
                        ${new Date(point.createdAt).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                    </span>
                </div>
            </div>
        `
                                }}
                                modules={['geoObject.addon.hint', 'geoObject.addon.balloon']}
                            />
                        ))}

                        {mode === 'traffic' && currentPoints.map(point => (
                            <Placemark
                                key={point.id}
                                geometry={point.coords}
                                options={getPlacemarkOptions('traffic')}
                            />))}
                    </Map>
                </YMaps>
            )}
        </div>
    );
};

//
const Home = () => {
    const [mapMode, setMapMode] = useState('traffic');
    const [dangerPoints, setDangerPoints] = useState([]);
    const [trafficPoints, setTrafficPoints] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [clickedCoords, setClickedCoords] = useState(null);
    const [timeRange, setTimeRange] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    const handleMapClick = (e) => {
        const coords = e.get('coords');
        setClickedCoords(coords);
        setShowAddModal(true);
    };

    const handleAddPoint = async (newPoint) => {
        try {
            setIsLoading(true);
            if (mapMode === 'danger') {
                const result = await dangerAdd(newPoint);
                if (result?.id) {
                    setDangerPoints(prev => [...prev, {
                        ...newPoint,
                        id: result.id,
                        user: { name: "Вы" }
                    }]);
                }
            } else {
                const result = await trafficAdd({
                    Coords: newPoint.coords,
                    ActivityTime: newPoint.activityTime || "12:00:00"
                });
                if (result?.id) {
                    setTrafficPoints(prev => [...prev, {
                        coords: newPoint.coords,
                        id: result.id,
                        activityTime: newPoint.activityTime || "12:00:00"
                    }]);
                }
            }
        } finally {
            setIsLoading(false);
            setShowAddModal(false);
        }
    };

    const getTimeRange = () => {
        switch (timeRange) {
            case 'morning': return { timeStart: "06:00:00", timeEnd: "11:59:59" };
            case 'afternoon': return { timeStart: "12:00:00", timeEnd: "17:59:59" };
            case 'evening': return { timeStart: "18:00:00", timeEnd: "23:59:59" };
            default: return { timeStart: "00:00:00", timeEnd: "23:59:59" };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const dangers = await dangersList();
                setDangerPoints(dangers?.dangers || []);

                const { timeStart, timeEnd } = getTimeRange();
                const traffic = await trafficList(timeStart, timeEnd);
                setTrafficPoints(traffic?.traffic || []);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const timeButtons = [
        { value: 'all', label: 'Все время' },
        { value: 'morning', label: 'Утро (6-12)' },
        { value: 'afternoon', label: 'День (12-18)' },
        { value: 'evening', label: 'Вечер (18-24)' }
    ];

    const dangerDescription = "На карте опасностей отображаются сообщения пользователей за последний месяц. Перед прогулкой проверяйте карту на наличие новых опасных находок. Предупрежден - значит вооружен!";
    const trafficDescription = "Карта загруженности покажет, где сейчас больше всего собаководов. Планируйте прогулки в тихих уголках или присоединяйтесь к активному сообществу!";

    return (
        <Container fluid style={{ marginTop: 100 }}>
            <h1 style={{ marginBottom: "20px" }}>
                Карты для владельцев собак –<br />
                удобно, полезно, безопасно
            </h1>

            <p className="text-left w-50 mb-5">
                {mapMode === 'traffic' ? trafficDescription : dangerDescription}
            </p>

            <div className="d-flex w-100 flex-md-row justify-content-between align-items-center gap-2 mb-1">
                <div>
                    {mapMode === 'traffic' && (
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0">Выберите время:</h5>
                            <div className="time-filters d-flex gap-2">
                                {timeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        className={`btn p-0 border-0 bg-transparent ${timeRange === value ? 'text-dark fw-bold' : 'text-secondary'
                                            }`}
                                        onClick={() => setTimeRange(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button
                        className={`${mapMode === 'traffic' ? 'green-button btn-green' : 'border-button'}`}
                        onClick={() => setMapMode('traffic')}
                    >
                        Загруженность
                    </button>
                    <button
                        className={`${mapMode === 'danger' ? 'green-button btn-green' : 'border-button'}`}
                        onClick={() => setMapMode('danger')}
                    >
                        Опасности
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <Spinner animation="border" />
                </div>
            ) : (
                <YandexMap
                    points={mapMode === 'traffic' ? [] : dangerPoints}
                    trafficPoints={mapMode === 'traffic' ? trafficPoints : []}
                    mode={mapMode}
                    onMapClick={handleMapClick}
                />
            )}

            <ArticlesSection />

            {showAddModal && (
                mapMode === 'danger' ? (
                    <AddDangerPointModal
                        show={showAddModal}
                        coords={clickedCoords}
                        onHide={() => setShowAddModal(false)}
                        onSave={handleAddPoint}
                        isLoading={isLoading}
                    />
                ) : (
                    <AddTrafficPointModal
                        show={showAddModal}
                        coords={clickedCoords}
                        onHide={() => setShowAddModal(false)}
                        onSave={handleAddPoint}
                        isLoading={isLoading}
                    />
                )
            )}
        </Container>
    );
};

const ArticlesSection = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [catsRes, artsRes] = await Promise.all([
                    fetch('/api/articles/categories'),
                    fetch(`/api/articles?category=${selectedCategory || ''}`)
                ]);

                const cats = await catsRes.json();
                const arts = await artsRes.json();

                setCategories(cats);
                setArticles(arts);
            } catch (error) {
                console.error('Ошибка загрузки статей:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory]);

    return (
        <>
            <h2 className="mb-4 text-left mt-100" style={{
                fontWeight: 600,
                color: '#2c3e50'
            }}>
                Полезные статьи для владельцев собак
            </h2>

            <div className="mb-4 text-left">
                <button
                    onClick={() => setSelectedCategory(null)}
                    style={{
                        backgroundColor: !selectedCategory ? '#8AA65B' : 'transparent',
                        color: !selectedCategory ? 'white' : '#8AA65B',
                        border: '1px solid #8AA65B',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        marginRight: '10px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                >
                    Все категории
                </button>

                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        style={{
                            backgroundColor: selectedCategory === category.slug ? '#8AA65B' : 'transparent',
                            color: selectedCategory === category.slug ? 'white' : '#8AA65B',
                            border: '1px solid #8AA65B',
                            borderRadius: '20px',
                            padding: '8px 16px',
                            marginRight: '10px',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <section className="py-5 mt-5" style={{ backgroundColor: '#f8faf6', borderRadius: 25 }}>
                <Container>

                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner" style={{
                                width: '40px',
                                height: '40px',
                                border: `3px solid rgba(138, 166, 91, 0.3)`,
                                borderTopColor: '#8AA65B',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }}></div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {articles.map(article => (
                                <article
                                    key={article.id}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        position: 'relative'
                                    }}
                                    className="article-card"
                                >
                                    {article.imageUrl && (
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s ease'
                                                }}
                                                className="article-image"
                                            />
                                        </div>
                                    )}
                                    <div style={{ padding: '20px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            backgroundColor: '#e8f1e1',
                                            color: '#8AA65B',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            marginBottom: '12px'
                                        }}>
                                            {article.categoryName}
                                        </span>
                                        <h3 style={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            marginBottom: '12px',
                                            fontSize: '18px',
                                            width: '100%',
                                            textAlign: 'left'
                                        }}>
                                            {article.title}
                                        </h3>
                                        <p style={{
                                            color: '#7f8c8d',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            marginBottom: '20px'
                                        }}>
                                            {article.excerpt}
                                        </p>
                                        <Link to={`/articles/${article.categorySlug}/${article.slug}`} style={{ textDecoration: 'none' }}>
                                        <button
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                backgroundColor: 'transparent',
                                                color: '#8AA65B',
                                                border: 'none',
                                                padding: '0',
                                                fontFamily: "'Inter', sans-serif",
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'color 0.3s ease'
                                            }}
                                            className="read-more-btn"
                                        >
                                            Читать далее
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#8AA65B"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{
                                                    marginLeft: '8px',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                            </button>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </Container>

                <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .article-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                
                .article-card:hover .article-image {
                    transform: scale(1.05);
                }
                
                .read-more-btn:hover {
                    color: #6d8a4a;
                }
                
                .read-more-btn:hover svg {
                    transform: translateX(3px);
                }
            `}</style>
            </section>
        </>
    );
};

export default Home;