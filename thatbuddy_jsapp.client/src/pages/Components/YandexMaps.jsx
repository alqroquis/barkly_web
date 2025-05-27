import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';

const ShelterMap = () => {
    const mapRef = useRef(null);
    const [ymaps, setYmaps] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [userLocation, setUserLocation] = useState([55.751574, 37.573856]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shelters, setShelters] = useState([]);
    const [isLoadingShelters, setIsLoadingShelters] = useState(true);

    // Кастомная иконка для приютов
    const shelterIcon = {
        iconLayout: 'default#image',
        iconImageHref: 'https://img.icons8.com/?size=100&id=JVfsy2CNetIy&format=png&color=000000',
        iconImageSize: [45, 45],
        iconImageOffset: [-16, -32]
    };

    // Получение списка приютов
    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const response = await fetch('/api/shelters/list');
                if (!response.ok) {
                    throw new Error('Не удалось загрузить список приютов');
                }
                const data = await response.json();
                setShelters(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoadingShelters(false);
            }
        };

        fetchShelters();
    }, []);

    // Получение геолокации пользователя
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

    const getPlacemarkOptions = (type) => {
        const presets = {
            danger: 'islands#redIcon',
            shelter: shelterIcon
        };
        return presets[type] || 'islands#blueIcon';
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

    if (isLoadingShelters) {
        return (
            <div style={{
                width: '100%',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8f9fa',
                borderRadius: '20px'
            }}>
                Загрузка данных о приютах...
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '30vh', borderRadius: '20px', overflow: 'hidden' }}>
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
                        <SearchControl options={{ float: "right" }} onError={(err) => { console.error(err); }} />

                        {shelters.map(shelter => (
                            <Placemark
                                key={shelter.id}
                                geometry={shelter.coords}
                                options={{
                                    ...getPlacemarkOptions('shelter'),
                                    balloonPanelMaxMapArea: 0,
                                    balloonCloseButton: true,
                                }}
                                properties={{
                                    hintContent: shelter.name,
                                    balloonContent: `
                <div style="
                    padding: 15px;
                    border-radius: 12px;
                    font-family: Arial, sans-serif;
                    max-width: 300px;
                ">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                       ${shelter.logoUrl ?
                                            `<img src="${shelter.logoUrl}" 
                              alt="Логотип" 
                              style="width: 50px; 
                                     border-radius: 10px; 
                                     margin-top: 10px;"/>` : ''
                                        }
                        <h4 style="margin: 0; font-size: 16px;">${shelter.name}</h4>
                    </div>
                    <div style="
                        background: #f5f5f5;
                        padding: 10px;
                        border-radius: 8px;
                        margin-bottom: 10px;
                    ">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;">
                            <strong>Адрес:</strong> ${shelter.address}
                        </p>
                        ${shelter.description ?
                                            `<p style="margin: 0; font-size: 14px; color: #555;">
                                <strong>Описание:</strong> ${shelter.description}
                            </p>` : ''
                                        }
                    </div>
                </div>
            `
                                }}
                                modules={['geoObject.addon.hint', 'geoObject.addon.balloon']}
                            />
                        ))}
                    </Map>
                </YMaps>
            }
        </div>
    );
};

export default ShelterMap;