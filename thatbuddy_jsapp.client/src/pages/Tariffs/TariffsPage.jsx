import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import free from '../../assets/tariffs/standart.svg';
import pro from '../../assets/tariffs/pro.svg';
import family from '../../assets/tariffs/family.svg';

const TariffsPage = () => {
    const tariffs = [
        {
            id: 1,
            name: "Бесплатный",
            description: "Базовые возможности для одного пользователя",
            pets: 1,
            members: 0,
            price: 0.00,
            active: true,
            image: free
        },
        {
            id: 2,
            name: "PRO",
            description: "Расширенные возможности для семьи",
            pets: 5,
            members: 3,
            price: 299.00,
            active: true,
            image: pro
        },
        {
            id: 3,
            name: "Семейный",
            description: "Полный доступ для большой семьи",
            pets: 10,
            members: 10,
            price: 599.00,
            active: true,
            image: family
        }
    ];

    return (
        <div style={{ padding: '40px 0', marginTop: 100 }}>
            <Container>
                <h1 style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '32px',
                    lineHeight: '38px',
                    color: '#000000',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    Тарифы – выберите удобный формат использования
                </h1>

                <div style={{
                    background: '#F5F5F5',
                    borderRadius: '25px 25px 0px 0px',
                    padding: '30px'
                }}>
                    <Row className="g-4">
                        {tariffs.map((tariff) => (
                            <Col key={tariff.id} md={4}>
                                <Card style={{
                                    height: '100%',
                                    borderRadius: '15px',
                                    overflow: 'hidden',
                                    border: 'none',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    ':hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <div style={{
                                        height: '6px',
                                        background: tariff.id === 1 ? '#E5E5E5' :
                                            tariff.id === 2 ? '#FACAA3' : '#B67865'
                                    }}></div>

                                    <Card.Body style={{
                                        padding: '25px',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        background: '#fff'
                                    }}>
                                        <div style={{
                                            flexGrow: 1,
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                background: tariff.id === 1 ? '#F8F8F8' :
                                                    tariff.id === 2 ? '#FBEBDE' : '#F3DBD3',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '20px'
                                            }}>
                                                <img
                                                    src={tariff.image}
                                                    alt={tariff.name}
                                                    style={{
                                                        maxHeight: '50px'
                                                    }}
                                                />
                                            </div>

                                            <Card.Title style={{
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: 'bold',
                                                fontSize: '24px',
                                                marginBottom: '15px',
                                                color: tariff.id === 1 ? '#000000' :
                                                    tariff.id === 2 ? '#FACAA3' : '#B67865'
                                            }}>
                                                {tariff.name}
                                            </Card.Title>

                                            <Card.Text style={{
                                                color: '#666',
                                                marginBottom: '25px',
                                                minHeight: '60px'
                                            }}>
                                                {tariff.description}
                                            </Card.Text>

                                            <div style={{
                                                background: '#f9f9f9',
                                                borderRadius: '10px',
                                                padding: '15px',
                                                marginBottom: '20px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '8px'
                                                }}>
                                                    <span>Питомцы:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{tariff.pets}</span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <span>Члены семьи:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{tariff.members}</span>
                                                </div>
                                            </div>

                                            <h4 style={{
                                                fontWeight: 'bold',
                                                fontSize: '28px',
                                                margin: '20px 0',
                                                color: '#333'
                                            }}>
                                                {tariff.price === 0 ? 'Бесплатно' : `${tariff.price.toFixed(2)} ₽`}
                                                {tariff.price > 0 && <small style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'normal',
                                                    color: '#999',
                                                    display: 'block'
                                                }}>в месяц</small>}
                                            </h4>
                                        </div>

                                        <button
                                            className={`tariffButton ${tariff.id === 1 ? 'freeButton' :
                                                tariff.id === 2 ? 'proButton' : 'familyButton'
                                                }`}
                                        >
                                            {tariff.price === 0 ? 'Начать бесплатно' : 'Купить тариф'}
                                        </button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default TariffsPage;