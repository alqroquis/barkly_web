import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';
import { Modal, Button, Form, Container } from "react-bootstrap";
import { dangersList, dangerAdd, trafficList} from '../functions/maps';
import { useHeatmap, AddTrafficPointModal } from './Maps/heatmap';


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


//
const YandexMap = ({ points, mode, onMapClick, heatmapData }) => {

    const mapRef = useRef(null);
    const [ymaps, setYmaps] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [userLocation, setUserLocation] = useState([55.751574, 37.573856]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ymaps || !mapRef.current) return;

        const map = mapRef.current;
        let heatmapInstance = null;

        const updateHeatmap = () => {
            // Удаляем предыдущую тепловую карту
            if (heatmapInstance) {
                map.geoObjects.remove(heatmapInstance);
                heatmapInstance = null;
            }

            // Создаем новую только в режиме traffic и при наличии данных
            if (mode === 'traffic' && heatmapData?.length) {
                heatmapInstance = new ymaps.Heatmap(heatmapData, {
                    radius: 20,
                    dissipating: false,
                    opacity: 0.8,
                    intensityOfMidpoint: 0.2,
                    gradient: {
                        0.1: 'rgba(0, 0, 255, 0.7)',
                        0.2: 'rgba(0, 255, 255, 0.8)',
                        0.7: 'rgba(255, 255, 0, 0.9)',
                        1.0: 'rgba(255, 0, 0, 1)'
                    }
                });

                map.geoObjects.add(heatmapInstance);
                console.log('Heatmap updated with data:', heatmapData);
            }
        };

        updateHeatmap();

        return () => {
            if (heatmapInstance) {
                map.geoObjects.remove(heatmapInstance);
            }
        };
    }, [ymaps, heatmapData, mode]);


    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setIsLoading(false);
                },
                (err) => {
                    setError(err.message);
                    setIsLoading(false);
                }
            );
        } else {
            setError("Геолокация не поддерживается вашим браузером");
            setIsLoading(false);
        }
    }, []);


    const getPlacemarkOptions = (mode) => {
        const presets = {
            danger: 'islands#redIcon',
        };
        return { preset: presets[mode] };
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

    return (
        <div style={{ width: '100%', height: '50vh', borderRadius: '20px', overflow: 'hidden' }}>
            {isLoading ?
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
                :
                <YMaps
                    query={{
                        apikey: '0e1cca1e-99fa-411e-b190-1ac33ce1f87c',
                        lang: 'ru_RU',
                        load: 'package.full'
                    }}
                    onLoad={ymaps => setYmaps(ymaps)}
                    onError={(error) => {
                        setLoadError(error);
                    }}
                    style={{ zIndex: 1050 }}
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
                        <SearchControl options={{ float: "right" }} onError={(err) => { reject(err); }} />

                        {points.map(point => (
                            <Placemark
                                key={point.id}
                                geometry={point.coords}
                                options={getPlacemarkOptions(mode)}
                                properties={{
                                    hintContent: point.name,
                                    balloonContent: `
                                    <div style="padding: 10px;">
                                        <h4 style="margin: 0 0 5px 0;">${point?.name}</h4>
                                        <p style="margin: 0;">${point?.description}</p>
                                        <p style="margin: 0;">Автор: ${point?.user?.name}</p>
                                    </div>
                                `
                                }}
                                modules={['geoObject.addon.hint', 'geoObject.addon.balloon']}
                            />
                        ))}
                    </Map>
                </YMaps>}
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

    const { heatmapData, timeRange, setTimeRange } = useHeatmap();


    const handleMapClick = (e) => {
        const coords = e.get('coords');
        setClickedCoords(coords);
        setShowAddModal(true);
    };

    const handleAddPoint = async (newPoint) => {
        if (mapMode === 'danger') {
            const result = await dangerAdd(newPoint);
            if (result) {
                setDangerPoints([...dangerPoints, {
                    ...newPoint,
                    id: result.id,
                    user: { name: "Вы" }
                }]);
            }
        } else {
            const pointsToAdd = newPoint.timeSlots.map(time => ({
                ...newPoint,
                id: Date.now() + Math.random(),
                weight: 1 
            }));

            setTrafficPoints([...trafficPoints, ...pointsToAdd]);
        }
    };

    useEffect(() => {
        dangersList().then((data) => setDangerPoints(data?.dangers));
    }, []);


    const timeButtons = [
        { value: 'all', label: 'Все время' },
        { value: 'morning', label: 'Утро (6-12)' },
        { value: 'afternoon', label: 'День (12-18)' },
        { value: 'evening', label: 'Вечер (18-24)' }
    ];

    const dangerDescription = "На карте опасностей отображаются сообщения пользователей за последний месяц. Перед прогулкой проверяйте карту на наличие новых опасных находок. Предупрежден - значит вооружен!";
    const trafficDescription = "Тепловая карта загруженности покажет, где сейчас больше всего собаководов. Планируйте прогулки в тихих уголках или присоединяйтесь к активному сообществу!";

    return (
        <Container fluid style={{ marginTop: 100 }}>
            <h1 style={{ marginBottom: "20px" }}>
                Карты для владельцев собак –<br />
                удобно, полезно, безопасно
            </h1>

            <p className="text-left w-50 mb-5"> {mapMode === 'traffic' ? trafficDescription : dangerDescription} </p>

            <div className="d-flex w-100 flex-md-row gap-2 mb-1 justify-content-end align-items-center">
                {mapMode === 'traffic' && (
                    <div className="mb-3">
                        <h5>Фильтр по времени:</h5>
                        <div className="time-filters">
                            {timeButtons.map(({ value, label }) => (
                                <button
                                    key={value}
                                    className={timeRange === value ? 'active' : ''}
                                    onClick={() => setTimeRange(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <button
                    className={`${mapMode === 'traffic' ? 'green-button' : 'border-button'}`}
                    onClick={() => setMapMode('traffic')}
                >
                    Загруженность
                </button>

                <button
                    className={`${mapMode === 'danger' ? 'green-button' : 'border-button'}`}
                    onClick={() => setMapMode('danger')}
                >
                    Опасности
                </button>
            </div>

            <YandexMap
                points={mapMode === 'traffic' ? [] : dangerPoints}
                mode={mapMode}
                onMapClick={handleMapClick}
                heatmapData={heatmapData}
            />

            {mapMode === 'danger' ? (
                <AddDangerPointModal
                    show={showAddModal}
                    coords={clickedCoords}
                    onHide={() => setShowAddModal(false)}
                    onSave={handleAddPoint}
                />
            ) : (
                <AddTrafficPointModal
                    show={showAddModal}
                    coords={clickedCoords}
                    onHide={() => setShowAddModal(false)}
                    onSave={handleAddPoint}
                />
            )}
        </Container>
    );
};


export default Home;