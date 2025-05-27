import { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Alert, ProgressBar, Modal, Row, Col } from 'react-bootstrap';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [tariff, setTariff] = useState(null);
    const [emailToAdd, setEmailToAdd] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [tariffs, setTariffs] = useState([]);
    const [selectedTariff, setSelectedTariff] = useState(null);
    const [isChangingTariff, setIsChangingTariff] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);


    useEffect(() => {
        if (showTariffModal) {
            fetch('/api/users/tariffs')
                .then(res => res.json())
                .then(data =>
                    setTariffs(data)
                )
                .catch(console.error);
        }
    }, [showTariffModal]);


    const handleSaveUser = async () => {
        if (!user.name) {
            alert('Поле "Имя" обязательно для заполнения');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении данных');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangeTariff = async () => {
        setIsChangingTariff(true);
        try {
            const response = await fetch('/api/users/change-tariff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tariffId: selectedTariff })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setSuccess('Тариф успешно изменен');
            setShowTariffModal(false);
            fetchUserData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка смены тарифа:', err);
            setError(err.message || 'Не удалось изменить тариф');
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsChangingTariff(false);
        }
    };

    // Функция отмены подписки
    const handleCancelSubscription = async () => {
        if (!window.confirm('Вы уверены, что хотите отменить подписку?')) return;

        setIsChangingTariff(true);
        try {
            const response = await fetch('/api/users/change-tariff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tariffId: null })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setSuccess('Подписка отменена');
            setShowTariffModal(false);
            fetchUserData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка отмены подписки:', err);
            setError(err.message || 'Не удалось отменить подписку');
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsChangingTariff(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const [userResponse, tariffResponse] = await Promise.all([
                fetch('/api/users/me').then(res => res.json()),
                fetch('/api/users/tariff').then(res => res.json())
            ]);

            if (userResponse.error) throw new Error(userResponse.error);
            if (tariffResponse.error) throw new Error(tariffResponse.error);

            setUser(userResponse);
            setTariff(tariffResponse);

            if (userResponse.hasPaidTariff) {
                fetchFamilyMembers();
            }
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Не удалось загрузить данные профиля');
        }
    };

    const fetchFamilyMembers = async () => {
        try {
            const response = await fetch('/api/family/members', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке списка семьи');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Ошибка загрузки членов семьи:', err);
            throw err;
        }
    };

    const handleAddFamilyMember = async () => {
        if (!emailToAdd) {
            setError('Введите email пользователя');
            return;
        }

        try {
            const response = await fetch('/api/family/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailToAdd })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error || 'Не удалось добавить пользователя');

            setSuccess('Пользователь успешно добавлен в семью');
            setEmailToAdd('');
            fetchFamilyMembers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка добавления в семью:', err);
            setError(err.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleRemoveFamilyMember = async (memberId) => {
        try {
            const response = await fetch(`/api/family/members/${memberId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setSuccess('Пользователь удален из семьи');
            fetchFamilyMembers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка удаления из семьи:', err);
            setError('Не удалось удалить пользователя');
            setTimeout(() => setError(''), 5000);
        }
    };

    if (!user || !tariff) {
        return <div>Загрузка...</div>;
    }

    return (
        <Container className="py-5">
            {/* Заголовок */}
            <h1 className="text-center text-accent mb-4">Мой профиль</h1>

            <Row>
                {/* Левая колонка */}
                <Col md={6} className="pe-md-4">
                    {/* Личные данные */}
                    <Card className="mb-4 border-0">
                        <Card.Body className="p-4">
                            <h2 style={{
                                fontFamily: 'Roboto',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '20px',
                                lineHeight: '23px',
                                color: '#000000',
                                marginBottom: '24px'
                            }}>
                                Личные данные
                            </h2>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Имя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={user.name}
                                        disabled={!isEditing}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={user.email}
                                        disabled
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Дата регистрации</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={new Date(user.createdAt).toLocaleDateString()}
                                        disabled
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    onClick={isEditing ? handleSaveUser : () => setIsEditing(!isEditing)}
                                    disabled={isSaving}
                                    style={{
                                        borderRadius: '25px',
                                        padding: '8px 16px',
                                        fontWeight: 500,
                                        color: '#fff',
                                        width: '100%'
                                    }}
                                >
                                    {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Редактировать профиль'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Правая колонка */}
                <Col md={6} className="ps-md-4">
                    {/* Тариф */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h2 style={{
                                        fontFamily: 'Roboto',
                                        fontStyle: 'normal',
                                        fontWeight: 500,
                                        fontSize: '20px',
                                        lineHeight: '23px',
                                        color: '#000000',
                                        marginBottom: '8px'
                                    }}>
                                        {tariff.name}
                                    </h2>
                                    <p className="mb-0 text-muted">{tariff.description}</p>
                                </div>
                                <Button
                                    variant="dark"
                                    onClick={() => setShowTariffModal(true)}
                                    style={{
                                        borderRadius: '25px',
                                        padding: '8px 16px',
                                        fontWeight: 500,
                                        color: '#fff'
                                    }}
                                >
                                    Управление подпиской
                                </Button>
                            </div>

                            <div className="mb-3">
                                <ProgressBar
                                    now={(tariff.currentPets / tariff.maxPets) * 100}
                                    style={{
                                        height: '10px',
                                        borderRadius: '5px'
                                    }}
                                >
                                    <ProgressBar
                                        style={{
                                            backgroundColor: '#8AA65B',
                                            width: `${(tariff.currentPets / tariff.maxPets) * 100}%`
                                        }}
                                    />
                                </ProgressBar>
                                <p className="text-muted small mt-2">
                                    Питомцев: {tariff.currentPets}/{tariff.maxPets}
                                </p>
                            </div>

                            {/* Дополнительная информация о тарифе */}
                            <div className="mt-4">
                                <h5 style={{ fontSize: '16px', marginBottom: '16px' }}>Возможности тарифа:</h5>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <img src="https://img.icons8.com/?size=20&id=oP5xX0sVsDIx&format=png&color=000000"></img>
                                        До {tariff.maxPets} питомцев
                                    </li>

                                    {user.hasPaidTariff && (
                                        <>
                                            <li className="mb-2">
                                                <img src="https://img.icons8.com/?size=20&id=14970&format=png&color=000000"></img>
                                                Общий доступ для семьи
                                            </li>
                                            <li className="mb-2">
                                                <img src="https://img.icons8.com/?size=20&id=JYQrEM0EyitQ&format=png&color=000000"></img>
                                                Премиум поддержка
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Семейный доступ */}
                    <Card className="mb-4 border-0">
                        <Card.Body className="p-4">
                            <h2 style={{
                                fontFamily: 'Roboto',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '20px',
                                lineHeight: '23px',
                                color: '#000000',
                                marginBottom: '24px'
                            }}>
                                Семейный доступ
                            </h2>

                            {familyMembers.length === 0 ? (
                                <>
                                    <p className="mb-4">
                                        Пока записи доступны только Вам, но Вы можете открыть доступ к информации
                                        о своих питомцах членам семьи или друзьям.
                                    </p>
                                    <Button
                                        variant="dark"
                                        onClick={() => setShowAddMemberModal(true)}
                                        style={{
                                            borderRadius: '25px',
                                            padding: '8px 16px',
                                            fontWeight: 500,
                                            color: '#fff',
                                            width: '100%'
                                        }}
                                    >
                                        Пригласить в семью
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <Button
                                            variant="dark"
                                            onClick={() => setShowAddMemberModal(true)}
                                            style={{
                                                borderRadius: '25px',
                                                padding: '8px 16px',
                                                fontWeight: 500,
                                                color: '#fff',
                                                width: '100%'
                                            }}
                                        >
                                            Добавить члена семьи
                                        </Button>
                                    </div>

                                    <h6>Члены семьи</h6>
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Имя</th>
                                                    <th>Email</th>
                                                    <th>Дата добавления</th>
                                                    <th>Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {familyMembers.map((member) => (
                                                    <tr key={member.id}>
                                                        <td>{member.name}</td>
                                                        <td>{member.email}</td>
                                                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleRemoveFamilyMember(member.id)}
                                                            >
                                                                Удалить
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Форма обратной связи */}
            <Row className="mt-4">
                <Col md={12}>
                    <Card className="border-0">
                        <Card.Body className="p-4">
                            <h2 style={{
                                fontFamily: 'Roboto',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '20px',
                                lineHeight: '23px',
                                color: '#000000',
                                marginBottom: '24px'
                            }}>
                                Мы всегда рады обратной связи
                            </h2>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Расскажите об опыте использования приложения: Удобно ли следить за здоровьем питомца?"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Control
                                        type="email"
                                        placeholder="Укажите адрес эл.почты, если хотите получить ответ на Ваш вопрос"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    style={{
                                        borderRadius: '25px',
                                        padding: '8px 16px',
                                        fontWeight: 500,
                                        color: '#fff'
                                    }}
                                >
                                    Отправить
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


            <Modal show={showAddMemberModal} onHide={() => setShowAddMemberModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Добавить члена семьи</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Email пользователя</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Введите email пользователя"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Пользователь должен быть зарегистрирован в системе
                        </Form.Text>
                    </Form.Group>
                    {error && <Alert variant="danger">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddMemberModal(false)}
                        disabled={isAddingMember}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="accent"
                        onClick={handleAddFamilyMember}
                        disabled={!newMemberEmail || isAddingMember}
                    >
                        {isAddingMember ? 'Добавление...' : 'Добавить'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showTariffModal} onHide={() => setShowTariffModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{user.hasPaidTariff ? 'Управление подпиской' : 'Выбор тарифа'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {user.hasPaidTariff ? (
                        <div className="text-center">
                            <p>Ваш текущий тариф: <strong>{tariff.name}</strong></p>
                            <p>Действует до: {new Date().toLocaleDateString()}</p>
                            <Button
                                variant="danger"
                                onClick={handleCancelSubscription}
                                disabled={isChangingTariff}
                            >
                                {isChangingTariff ? 'Обработка...' : 'Отменить подписку'}
                            </Button>
                        </div>
                    ) : (
                        <div className="tariff-grid">
                            {tariffs.map(t => (
                                <Card
                                    key={t.id}
                                    className={`mb-3 ${selectedTariff === t.id ? 'border-accent border-2' : ''}`}
                                    onClick={() => setSelectedTariff(t.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Card.Header className="bg-accent text-white">
                                        <h5>{t.name}</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <h6 className="text-accent">${t.price}/месяц</h6>
                                        <p>{t.description}</p>
                                        <ul>
                                            <li>До {t.maxPets} питомцев</li>
                                            <li>Общий доступ для семьи</li>
                                            <li>Премиум поддержка</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                {!user.hasPaidTariff && (
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowTariffModal(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="accent btn-green"
                            onClick={handleChangeTariff}
                            disabled={!selectedTariff || isChangingTariff}
                        >
                            {isChangingTariff ? 'Обработка...' : 'Подписаться'}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default UserProfile;