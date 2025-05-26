import React, { useState, useEffect } from "react";
import { Modal, Form, Tabs, Tab, Dropdown, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { petsList, petsGet, petAdd, medCardGet, petUpdate, medCardUpdate } from '../functions/pets';
import { documentsList, documentsUpload } from '../functions/documents';
import { calculateDogAge, formatAge, formatBirthdate } from './Components/Functions';
import { AddPetModal, EditPetModal, EditMedicineCardModal, ActivityModal } from './Components/Modals';
import PetActivityChart, { WeightChart, TrainingChart } from './Components/DurationBarChart';
import { toast } from "react-toastify";
import { Pencil, Trash, ThreeDotsVertical, Plus } from 'react-bootstrap-icons';
import defaultLogo from '../assets/logos/dog.png';
import logo1 from '../assets/logos/bigle.png';
import logo2 from '../assets/logos/dober.png';
import logo3 from '../assets/logos/golden.png';
import logo4 from '../assets/logos/hasky.png';
import logo5 from '../assets/logos/mops.png';
import logo6 from '../assets/logos/shpich.png';


const ReminderCard = ({ reminder, onEdit, onDelete }) => {
    // Форматирование даты и времени
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    return (
        <Card
            style={{
                width: "100%",
                minHeight: "80px",
                background: "#FFFFFF",
                borderRadius: "20px",
                border: "none",
                marginBottom: "20px",
                position: 'relative',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Card.Body style={{ padding: '12px' }}>
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 1
                }}>
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="link"
                            id="dropdown-basic"
                            size="sm"
                            style={{
                                padding: '0',
                                border: 'none',
                                background: 'transparent',
                                boxShadow: 'none'
                            }}
                        >
                            <img
                                src="https://img.icons8.com/?size=100&id=21622&format=png&color=000000"
                                alt="Меню"
                                width={16}
                                height={16}
                            />
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            style={{
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                                padding: '4px 0',
                                marginTop: '5px'
                            }}
                        >
                            <Dropdown.Item
                                onClick={onEdit}
                                style={{
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <img
                                    src="https://img.icons8.com/?size=100&id=71201&format=png&color=000000"
                                    alt="Редактировать"
                                    width={14}
                                    height={14}
                                    style={{ marginRight: '8px' }}
                                />
                                Редактировать
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={onDelete}
                                className="text-danger"
                                style={{
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <img
                                    src="https://img.icons8.com/?size=100&id=11767&format=png&color=000000"
                                    alt="Удалить"
                                    width={14}
                                    height={14}
                                    style={{ marginRight: '8px' }}
                                />
                                Удалить
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                    marginRight: '20px'
                }}>
                    <Card.Title
                        style={{
                            fontFamily: "Roboto",
                            fontStyle: "normal",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "16px",
                            color: "#000000",
                            margin: 0
                        }}
                    >
                        {reminder.title}
                    </Card.Title>

                    {reminder.categoryName && (
                        <span style={{
                            height: '27px',
                            backgroundColor: reminder.categoryColor || '#CDE160',
                            color: '#000000',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            alignItems: 'center'
                        }}>
                            {reminder.categoryName}
                        </span>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: reminder.description ? '6px' : '0',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {formatDate(reminder.date)}
                    </span>

                    <span style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {formatTime(reminder.startTime)}
                        {reminder.endTime && ` - ${formatTime(reminder.endTime)}`}
                    </span>
                </div>

                {reminder.description && (
                    <Card.Text
                        style={{
                            fontFamily: "Roboto",
                            fontStyle: "normal",
                            fontWeight: 400,
                            fontSize: "13px",
                            lineHeight: "15px",
                            color: "#000000",
                            marginBottom: 0,
                            marginTop: '4px'
                        }}
                    >
                        {reminder.description}
                    </Card.Text>
                )}
            </Card.Body>
        </Card>
    );
};


const RemindersList = () => {
    const [reminders, setReminders] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentReminder, setCurrentReminder] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newReminder, setNewReminder] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '12:00',
        endTime: null,
        description: '',
        importanceLevel: 1,
        categoryId: null
    });

    const fetchReminders = async () => {
        try {
            const response = await fetch('/api/reminders/list');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setReminders(data.reminders);
        } catch (error) {
            console.error('Error fetching reminders:', error);
        }
    };


    useEffect(() => {
        fetchReminders();
        fetchCategories();
    }, []);


    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/ReminderCategories/list');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };


    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    const handleSave = async () => {
        try {
            const response = await fetch(`/api/reminders/update/${currentReminder.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentReminder),
            });

            if (!response.ok) throw new Error('Update failed');

            setShowEditModal(false);
            fetchReminders(); // Обновляем список
        } catch (error) {
            console.error('Error updating reminder:', error);
        }
    };


    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/reminders/delete/${currentReminder.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            setShowDeleteConfirm(false);
            fetchReminders(); // Обновляем список
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };


    const handleAdd = async () => {
        try {
            if (!newReminder.title || !newReminder.date || !newReminder.startTime) {
                throw new Error('Заполните обязательные поля');
            }

            if (newReminder.endTime && newReminder.endTime <= newReminder.startTime) {
                throw new Error('Время окончания должно быть позже времени начала');
            }

            const response = await fetch('/api/reminders/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newReminder.title,
                    description: newReminder.description,
                    startTime: newReminder.startTime + ':00',
                    endTime: newReminder.endTime ? newReminder.endTime + ':00' : null,
                    date: newReminder.date,
                    importanceLevel: newReminder.importanceLevel,
                    categoryId: newReminder.categoryId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении');
            }

            setShowAddModal(false);
            setNewReminder({
                title: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '12:00',
                endTime: null,
                description: '',
                importanceLevel: 1,
                categoryId: null
            });
            fetchReminders();
        } catch (error) {
            console.error('Error adding reminder:', error);
            alert(error.message);
        }
    };

    return (
        <Col md={4}>
            <h2 style={{ margin: 0, marginBottom: '20px' }}>Напоминания</h2>
            {reminders.length > 0 && (
                reminders.map((reminder) => (
                    <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onEdit={() => {
                            setCurrentReminder(reminder);
                            setShowEditModal(true);
                        }}
                        onDelete={() => {
                            setCurrentReminder(reminder);
                            setShowDeleteConfirm(true);
                        }}
                    />
                ))
            )}


            <Button
                variant="dark"
                onClick={() => setShowAddModal(true)}
                style={{
                    borderRadius: '25px',
                    padding: '8px 16px',
                    fontWeight: 500,
                    color: '#fff'
                }}
            >
                Добавить напоминание
            </Button>

            {/* Модальное окно редактирования */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Редактировать напоминание</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentReminder && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Название</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentReminder.title}
                                    onChange={(e) => setCurrentReminder({
                                        ...currentReminder,
                                        title: e.target.value
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Дата</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={currentReminder.date}
                                    onChange={(e) => setCurrentReminder({
                                        ...currentReminder,
                                        date: e.target.value
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Время начала</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={currentReminder.startTime}
                                    onChange={(e) => setCurrentReminder({
                                        ...currentReminder,
                                        startTime: e.target.value
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Время окончания (необязательно)</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={currentReminder.endTime || ''}
                                    onChange={(e) => setCurrentReminder({
                                        ...currentReminder,
                                        endTime: e.target.value || null
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={currentReminder.description || ''}
                                    onChange={(e) => setCurrentReminder({
                                        ...currentReminder,
                                        description: e.target.value
                                    })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Сохранить
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Модальное окно добавления */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Добавить напоминание</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Название*</Form.Label>
                            <Form.Control
                                type="text"
                                value={newReminder.title}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    title: e.target.value
                                })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Дата*</Form.Label>
                            <Form.Control
                                type="date"
                                value={newReminder.date}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    date: e.target.value
                                })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Время начала*</Form.Label>
                            <Form.Control
                                type="time"
                                value={newReminder.startTime}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    startTime: e.target.value
                                })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Время окончания (необязательно)</Form.Label>
                            <Form.Control
                                type="time"
                                value={newReminder.endTime || ''}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    endTime: e.target.value || null
                                })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Важность</Form.Label>
                            <Form.Select
                                value={newReminder.importanceLevel}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    importanceLevel: parseInt(e.target.value)
                                })}
                            >
                                <option value="1">Низкая</option>
                                <option value="2">Средняя</option>
                                <option value="3">Высокая</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Категория</Form.Label>
                            <Form.Select
                                value={newReminder.categoryId || ''}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    categoryId: e.target.value ? parseInt(e.target.value) : null
                                })}
                            >
                                <option value="">Без категории</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newReminder.description}
                                onChange={(e) => setNewReminder({
                                    ...newReminder,
                                    description: e.target.value
                                })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Отмена
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAdd}
                        disabled={!newReminder.title || !newReminder.date || !newReminder.startTime}
                    >
                        Добавить
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Подтверждение удаления */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите удалить напоминание "{currentReminder?.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </Col>
    );
};


const PetsColumn = ({ onSelectedPetChange }) => {
    const [pets, setPets] = useState(null);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let list = petsList()
            .then((data) => {
                if (data?.length > 0) {
                    setPets(data);
                    setSelectedPet(data[0]);
                    onSelectedPetChange(data[0].id);
                }
            });
    }, []);

    const handleSelectPet = (pet) => {
        setSelectedPet(pet);
        onSelectedPetChange(pet.id);
    };

    const handleAddPet = () => {
        setShowModal(true);
    };

    const handleSavePet = async (petData) => {
        let result = await petAdd(petData);
    };

    return (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
                style={{
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "34px",
                    height: "34px",
                    background: "#000000",
                    border: "1px solid #2C2C2C",
                    borderRadius: "32px",
                    color: "#FFFFFF",
                    marginBottom: "20px",
                }}
                onClick={handleAddPet}
            >
                +
            </Button>
            {pets !== null &&
                pets?.map((pet, index) => (
                    <Button
                        key={index}
                        style={{
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "9px 13px",
                            gap: "10px",
                            height: "34px",
                            background:
                                selectedPet === pet
                                    ? "#000000"
                                    : "rgba(255, 255, 255, 0.29)",
                            border: "1px solid #000000",
                            borderRadius: "20px",
                            fontFamily: "Roboto",
                            fontStyle: "normal",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "16px",
                            color: selectedPet === pet ? "#FFFFFF" : "#000000",
                        }}
                        onClick={() => handleSelectPet(pet)}
                    >
                        {pet.name}
                    </Button>
                ))}
            <AddPetModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleSavePet}
            />
        </div>
    );
};


const DogHead = ({ name, age, imageUrl = defaultLogo, onAddActivity, petId, onUpdatePet }) => {
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedLogo, setSelectedLogo] = useState(imageUrl);
    const [isUpdating, setIsUpdating] = useState(false);

    const logos = [logo1, logo2, logo3, logo4, logo5, logo6];

    const handleAvatarClick = () => {
        setShowAvatarModal(true);
        setSelectedLogo(imageUrl);
    };

    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
    };

    const handleSaveAvatar = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/pets/edit/${petId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ logoUrl: selectedLogo }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении аватарки');
            }

            onUpdatePet({ logoUrl: selectedLogo });
            setShowAvatarModal(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "30px",
                    marginBottom: "40px",
                }}
                className="dog-profile"
            >
                <div
                    onClick={handleAvatarClick}
                    style={{
                        boxSizing: "border-box",
                        width: "112px",
                        height: "112px",
                        border: "3px solid rgba(255, 255, 255, 0.13)",
                        filter: "drop-shadow(0px 0px 7px rgba(0, 0, 0, 0.25))",
                        borderRadius: "50%",
                        backgroundImage: `url("${imageUrl}")`,
                        backgroundSize: "cover",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: "center",
                        cursor: 'pointer',
                    }}
                />

                <div style={{ display: 'flex', height: 112, flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div
                        style={{
                            fontFamily: "Roboto",
                            fontStyle: "normal",
                            fontWeight: 500,
                            fontSize: "20px",
                            lineHeight: "23px",
                            color: "#000000",
                        }}
                    >
                        {name}
                    </div>

                    <p className="p-light">{formatAge(age.years, age.months)}</p>
                    <button className="green-button btn-green" onClick={onAddActivity}>Добавить запись активности</button>
                </div>
            </div>

            {/* Модальное окно выбора аватарки */}
            <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Выберите аватар для {name}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                    {logos.map((logo, index) => (
                        <Image
                            key={index}
                            src={logo}
                            roundedCircle
                            style={{
                                width: '80px',
                                height: '80px',
                                cursor: 'pointer',
                                border: selectedLogo === logo ? '3px solid #4CAF50' : '3px solid transparent',
                                objectFit: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                            }}
                            onClick={() => handleLogoSelect(logo)}
                        />
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
                        Отмена
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveAvatar}
                        disabled={selectedLogo === imageUrl || isUpdating}
                    >
                        {isUpdating ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};


class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reminders: [],
            pet: null,
            medcard: null,
            activeTab: "Статистика",
            showEditModal: false,
            showEditMedModal: false,
            documents: [],
            showDownloadModal: false,
            selectedDocument: null,
            showActivityForm: false,
            showWeightForm: false,
            showAddMedicineModal: false,
            showTrackingModal: false,
            activities: [],
            trainings: [],
            weightMeasurements: [],
            weightHistory: [],
            activityTypes: [],
            medicines: [],
            medicineTracking: [],
            currentMedicineId: null,
            currentDate: null,
            currentTracking: null
        };
        this.fetchPet = this.fetchPet.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.toggleEditModal = this.toggleEditModal.bind(this);
        this.handleSavePet = this.handleSavePet.bind(this);
        this.fetchActivities = this.fetchActivities.bind(this);
        this.fetchDocuments = this.fetchDocuments.bind(this);
        this.handleAddDocument = this.handleAddDocument.bind(this);
        this.fetchDocuments = this.fetchDocuments.bind(this);
        this.fetchWeightMeasurements = this.fetchWeightMeasurements.bind(this);
        this.fetchTrainings = this.fetchTrainings.bind(this);
        this.fetchMedicines = this.fetchMedicines.bind(this);
        this.fetchAllMedicineTracking = this.fetchAllMedicineTracking.bind(this);
        this.handleDayClick = this.handleDayClick.bind(this);
        this.handleTrackingSubmit = this.handleTrackingSubmit.bind(this);
        this.handleAddMedicine = this.handleAddMedicine.bind(this);
    }


    fetchPet = async (id) => {
        this.setState({ activeTab: "Статистика" });
        this.setState({ pet: null, medcard: null });
        let petInfo = await petsGet(id);
        let medcardInfo = await medCardGet(id);
        this.setState({ pet: petInfo, medcard: medcardInfo });
        await this.fetchActivities();
        await this.fetchDocuments(id);
        await this.fetchWeightMeasurements();
        await this.fetchTrainings();
        await this.fetchMedicines();
    };


    async fetchActivities() {
        if (!this.state.pet?.id) return;

        try {
            const response = await fetch(`/api/activities/get-activities/${this.state.pet.id}?activityTypeId=1`);
            const data = await response.json();
            this.setState({ activities: data });
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }


    async fetchTrainings() {
        if (!this.state.pet?.id) return;

        try {
            const response = await fetch(`/api/activities/get-activities/${this.state.pet.id}?activityTypeId=4`);
            const data = await response.json();
            this.setState({ trainings: data });
        } catch (error) {
            console.error('Error fetching trainings:', error);
        }
    }


    generateDaysInMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }, (_, i) => ({
            date: new Date(year, month, i + 1)
        }));
    };


    handleDayClick = (medicineId, date) => {
        const tracking = this.state.medicineTracking.find(t =>
            t.medicineId === medicineId &&
            new Date(t.date).toDateString() === date.toDateString()
        );

        this.setState({
            showTrackingModal: true,
            currentMedicineId: medicineId,
            currentDate: date,
            currentTracking: tracking || null
        });
    };


    handleTrackingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch('/api/medicine/upsert-tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: this.state.currentTracking?.id || null,
                    medicineId: this.state.currentMedicineId,
                    petId: this.state.pet.id,
                    status: parseInt(formData.get('status')),
                    date: this.state.currentDate.toISOString(),
                    description: formData.get('description')
                })
            });

            if (response.ok) {
                this.fetchAllMedicineTracking();
                this.setState({ showTrackingModal: false });
                toast.success('Данные о приеме сохранены');
            }
        } catch (error) {
            toast.error('Ошибка при сохранении');
        }
    };


    handleAddMedicine = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch('/api/medicine/upsert-medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: this.state.pet?.id,
                    name: formData.get('name'),
                    dosage: formData.get('dosage'),
                    description: formData.get('description')
                })
            });

            if (response.ok) {
                this.fetchMedicines();
                this.setState({ showAddMedicineModal: false });
                toast.success('Лекарство сохранено');
            }
        } catch (error) {
            toast.error('Ошибка при сохранении лекарства');
        }
    };


    async addMedicineTracking(trackingData) {
        try {
            const response = await fetch('/api/medicine/add-tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trackingData)
            });
            await response.json();
            toast.success('Успешно!');
        } catch (error) {
            console.error('Error adding medicine tracking:', error);
            throw error;
        }
    }


    async fetchMedicines() {
        try {
            const response = await fetch(`/api/medicine/get-medicines/${this.state.pet?.id}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении списка лекарств');
            }
            const medicines = await response.json();
            this.setState({ medicines }, () => {
                if (medicines.length > 0 && this.state.pet?.id) {
                    this.fetchAllMedicineTracking();
                }
            });
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Не удалось загрузить список лекарств');
        }
    }


    async fetchAllMedicineTracking() {
        if (!this.state.pet?.id || this.state.medicines.length === 0) return;

        try {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const trackingPromises = this.state.medicines.map(medicine =>
                this.getMedicineTracking(medicine.id, this.state.pet.id, firstDayOfMonth, lastDayOfMonth)
            );

            const trackingResults = await Promise.all(trackingPromises);

            const allTracking = trackingResults.flat();

            this.setState({ medicineTracking: allTracking });
        } catch (error) {
            console.error('Error fetching medicine tracking:', error);
            toast.error('Не удалось загрузить данные о приеме лекарств');
        }
    }


    async getMedicineTracking(medicineId, petId, fromDate, toDate) {
        try {
            let url = `/api/medicine/get-tracking/${medicineId}`;
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error getting tracking for medicine ${medicineId}:`, error);
            throw error;
        }
    }


    async fetchWeightMeasurements() {
        if (!this.state.pet?.id) return;

        try {
            const response = await fetch(`/api/activities/get-weight-measurements/${this.state.pet.id}`);
            const data = await response.json();
            this.setState({ weightMeasurements: data });
        } catch (error) {
            console.error('Error fetching weight measurements:', error);
        }
    }


    fetchDocuments = async (petId) => {
        const documents = await documentsList(petId);
        this.setState({ documents });
    };


    handleAddDocument = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await documentsUpload(this.state.pet.id, formData);
        await this.fetchDocuments(this.state.pet.id);
    };


    isViewableType = (fileType) => {
        return (
            fileType.startsWith('image/') ||
            fileType === 'application/pdf' ||
            fileType === 'text/plain'
        );
    };


    handleDownloadDocument = async (doc) => {
        try {
            const response = await fetch(`/api/documents/${doc.id}?download=true`, {
                method: 'get',
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.originalName || 'document';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            toast.error(error.message || 'Не удалось скачать файл');
        }
    };


    handleTabClick = (tab) => {
        this.setState({ activeTab: tab });
    };


    toggleEditModal = () => {
        this.setState(prevState => ({
            showEditModal: !prevState.showEditModal
        }));
    };


    toggleEditMedModal = () => {
        this.setState(prevState => ({
            showEditMedModal: !prevState.showEditMedModal
        }));
    };


    handleSavePet = async (updatedPetInfo) => {
        try {
            const updatedPet = await petUpdate(this.state.pet.id, updatedPetInfo);
            this.setState({
                showEditModal: false
            });
            let petInfo = await petsGet(this.state.pet.id);
            this.setState({ pet: petInfo });
        } catch (error) {

        }
    };


    handleSaveMedCard = async (updatedMedInfo) => {
        try {
            const updatedPet = await medCardUpdate(this.state.pet.id, updatedMedInfo);
            this.setState({
                showEditMedModal: false
            });
            let medcardInfo = await medCardGet(this.state.pet.id);
            this.setState({ medcard: medcardInfo });
        } catch (error) {

        }
    };


    handleDeleteDocument = async (documentId) => {
        try {
            await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE',
            });
            this.setState(prevState => ({
                documents: prevState.documents.filter(doc => doc.id !== documentId)
            }));
        } catch (error) {
            toast.error(error.message || 'Не удалось удалить файл');
        }
    };


    getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        if (fileType === 'text/plain') return '📝';
        return '📁';
    };


    render() {
        const {
            pet,
            activeTab,
            medcard,
            showEditModal,
            documents,
            showDownloadModal,
            selectedDocument,
            showEditMedModal,
            activities,
            showActivityForm,
            weightMeasurements,
            trainings,
            showAddMedicineModal,
            showTrackingModal,
            medicines,
            medicineTracking,
            currentMedicineId,
            currentDate,
            currentTracking } = this.state;

        const tabs = ["Статистика", "Общее", "Медицинская карта", "Документы", "Прием лекарств"];

        return (
            <Container fluid style={{ marginTop: 100 }}>
                <Row>
                    <RemindersList />

                    <Col md={8}>
                        <h2 style={{ marginBottom: "20px" }}>Мои питомцы</h2>
                        <PetsColumn onSelectedPetChange={this.fetchPet} />
                        <div className="grey-rounded-container">
                            {pet !== null && <DogHead name={pet?.name} age={calculateDogAge(pet?.birthdate)} imageUrl={pet?.logoUrl} onAddActivity={() => this.setState({ showActivityForm: true })} petId={pet?.id} onUpdatePet={() => this.fetchPet(pet?.id)} />}
                            {pet !== null && <ActivityModal
                                show={showActivityForm}
                                onHide={() => this.setState({ showActivityForm: false })}
                                fetchActivities={this.fetchActivities}
                                fetchWeightMeasurements={this.fetchWeightMeasurements}
                                petId={pet.id}
                            />}
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
                                {tabs.map((tab, index) => (
                                    <Button
                                        key={index}
                                        style={{
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "9px 13px",
                                            gap: "10px",
                                            height: "34px",
                                            background: activeTab === tab ? "#000000" : "rgba(255, 255, 255, 0.29)",
                                            border: "1px solid #000000",
                                            borderRadius: "20px",
                                            fontFamily: "Roboto",
                                            fontStyle: "normal",
                                            fontWeight: 400,
                                            fontSize: "14px",
                                            lineHeight: "16px",
                                            color: activeTab === tab ? "#FFFFFF" : "#000000",
                                        }}
                                        onClick={() => this.handleTabClick(tab)}
                                    >
                                        {tab}
                                    </Button>
                                ))}
                            </div>


                            {activeTab === "Общее" && pet !== null &&
                                <div style={{ display: 'flex', gap: 15, flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h5>Информация о питомце</h5>
                                        <button className="black-button" onClick={this.toggleEditModal}>
                                            Редактировать
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Имя: </label>
                                        <p>{pet.name}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Описание: </label>
                                        <p>{pet.description || "Не указано"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Порода: </label>
                                        <p>{pet.breed?.name || "Порода не указана"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Дата рождения: </label>
                                        <p>{formatBirthdate(pet.birthdate) || "Дата рождения не указана"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Номер микрочипа: </label>
                                        <p>{pet.microchip?.length > 0 ? pet.microchip : "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Номер клейма: </label>
                                        <p>{pet.stigma?.length > 0 ? pet.stigma : "Не указан"}</p>
                                    </div>

                                    <EditPetModal
                                        show={showEditModal}
                                        onHide={this.toggleEditModal}
                                        onSave={this.handleSavePet}
                                        pet={pet}
                                    />
                                </div>}


                            {activeTab === "Медицинская карта" && medcard !== null &&
                                <div style={{ display: 'flex', gap: 15, flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h5>Медицинские данные</h5>
                                        <button className="black-button" onClick={this.toggleEditMedModal}>
                                            Редактировать
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Вес: </label>
                                        <p>{`${medcard?.weight} кг` ?? "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Тип корма: </label>
                                        <p>{medcard?.feedType?.name?.length > 0 ? medcard?.feedType?.name : "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Частота кормления (раз в день): </label>
                                        <p>{medcard?.feedingFrequency ?? "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Состав корма: </label>
                                        <p>{medcard?.ingredients?.length > 0 ? medcard?.ingredients : "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Размер порции (в граммах): </label>
                                        <p>{medcard?.servingSize ?? "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Другие особенности ухода: </label>
                                        <p>{medcard?.featuresOfCare?.length > 0 ? medcard?.featuresOfCare : "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Последняя обработка от гельминтов: </label>
                                        <p>{(medcard?.lastTicksTreatment?.desc + ' ' + formatBirthdate(medcard?.lastTicksTreatment?.treatmentDate)) ?? "Не указаны"}</p>
                                    </div>

                                    <EditMedicineCardModal
                                        show={showEditMedModal}
                                        onHide={this.toggleEditMedModal}
                                        onSave={this.handleSaveMedCard}
                                        medicineCard={medcard} />

                                </div>}


                            {activeTab === "Документы" &&
                                <div style={{ display: 'flex', gap: 15, flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h5>Документы</h5>
                                        <input
                                            type="file"
                                            onChange={(e) => this.handleAddDocument(e.target.files[0])}
                                            style={{ display: 'none' }}
                                            id="document-upload"
                                        />
                                        <label
                                            htmlFor="document-upload"
                                            className="black-button"
                                            style={{ cursor: 'pointer', margin: 0 }}
                                        >
                                            Добавить документ
                                        </label>
                                    </div>

                                    {documents.length === 0 ? (
                                        <p>Нет загруженных документов</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {documents.map(doc => (
                                                <div
                                                    key={doc.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '10px',
                                                        border: '1px solid #eee',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '20px' }}>{this.getFileIcon(doc.fileType)}</span>
                                                        <span>{doc.originalName}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button
                                                            className="black-button"
                                                            onClick={() => this.handleDownloadDocument(doc, true)}
                                                        >
                                                            Скачать
                                                        </button>
                                                        <button
                                                            className="black-button"
                                                            onClick={() => this.handleDeleteDocument(doc.id)}
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}


                                    {showDownloadModal && (
                                        <div style={{
                                            position: 'fixed',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            backgroundColor: 'white',
                                            padding: '20px',
                                            borderRadius: '5px',
                                            zIndex: 1000,
                                            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                                        }}>
                                            <p>Этот тип файла нельзя просмотреть в браузере. Хотите скачать его?</p>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                <button
                                                    className="black-button"
                                                    onClick={() => {
                                                        this.handleDownloadDocument(selectedDocument, true);
                                                        this.setState({ showDownloadModal: false });
                                                    }}
                                                >
                                                    Скачать
                                                </button>
                                                <button
                                                    className="black-button"
                                                    onClick={() => this.setState({ showDownloadModal: false })}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>}


                            {activeTab === "Статистика" && (
                                <>
                                    {weightMeasurements?.length > 0 && (
                                        <>
                                            <h4 className="mb-4">Статистика веса</h4>
                                            <div className="container bg-white p-4 mb-4" style={{ borderRadius: 25 }}>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <WeightChart data={weightMeasurements} />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activities?.length > 0 && (
                                        <>
                                            <h4 className="mb-4">Статистика активностей</h4>
                                            <div className="container bg-white p-4 mb-4" style={{ borderRadius: 25 }}>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="mb-5">
                                                            <h5>Длительность прогулок</h5>
                                                            <PetActivityChart data={activities} type="duration" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="container bg-white p-4 mb-4" style={{ borderRadius: 25 }}>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="mb-3">
                                                            <h5>Пройденное расстояние</h5>
                                                            <PetActivityChart data={activities} type="distance" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {trainings?.length > 0 && (
                                        <div className="container bg-white p-4 mb-4" style={{ borderRadius: 25 }}>
                                            <h5>Статистика тренировок</h5>
                                            <TrainingChart data={trainings} />
                                        </div>
                                    )}
                                </>
                            )}


                            {activeTab === "Прием лекарств" && (
                                <div className="container-fluid p-0">
                                    <div className="d-flex gap-3 align-items-center justify-content-between mb-4">
                                        <h4>Прием лекарств</h4>
                                        <button
                                            className="black-button"
                                            onClick={() => this.setState({ showAddMedicineModal: true })}
                                        >
                                            Добавить лекарство
                                        </button>
                                    </div>


                                    {medicines.map(medicine => (
                                        <div key={medicine.id} className="bg-white rounded p-4 mb-4 shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>{medicine.name}</h5>
                                                <span className="text-muted">{medicine.dosage}</span>
                                            </div>

                                            <div className="d-flex flex-wrap gap-2">
                                                {this.generateDaysInMonth()?.map(day => {
                                                    const tracking = medicineTracking.find(t =>
                                                        t.medicineId === medicine?.id &&
                                                        new Date(t.date)?.toDateString() === day?.date?.toDateString()
                                                    );

                                                    return (
                                                        <div
                                                            key={day.date.toString()}
                                                            className={`day-circle`}
                                                            style={{ background: tracking && tracking?.status == 0 ? '#7E9951' : '#D9D9D9'}}
                                                            onClick={() => this.handleDayClick(medicine.id, day.date)}
                                                            title={`${day.date.toLocaleDateString()} - ${tracking ? tracking.status === 'taken' ? 'Принято' : 'Пропущено' : 'Нет данных'}`}
                                                        >
                                                            {day.date.getDate()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}


                                    <Modal show={showTrackingModal} onHide={() => this.setState({ showTrackingModal: false })}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Редактировать прием лекарства</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form onSubmit={this.handleTrackingSubmit}>
                                                <input type="hidden" name="medicineId" value={currentMedicineId} />
                                                <input type="hidden" name="date" value={currentDate?.toISOString()} />

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Статус</Form.Label>
                                                    <Form.Select
                                                        name="status"
                                                        defaultValue={currentTracking?.status || 1}
                                                    >
                                                        <option value={0} >Принято</option>
                                                        <option value={1} >Пропущено</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Примечания</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="description"
                                                        defaultValue={currentTracking?.description || ''}
                                                    />
                                                </Form.Group>

                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="btn-green"
                                                        onClick={() => this.handleDeleteTracking(currentTracking?.id)}
                                                        disabled={!currentTracking}
                                                    >
                                                        Удалить
                                                    </Button>
                                                    <Button type="submit">Сохранить</Button>
                                                </div>
                                            </Form>
                                        </Modal.Body>
                                    </Modal>


                                    <Modal show={showAddMedicineModal} onHide={() => this.setState({ showAddMedicineModal: false })}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Добавить лекарство</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form onSubmit={this.handleAddMedicine}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Название</Form.Label>
                                                    <Form.Control type="text" name="name" required />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Дозировка</Form.Label>
                                                    <Form.Control type="text" name="dosage" required />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Описание</Form.Label>
                                                    <Form.Control as="textarea" rows={3} name="description" />
                                                </Form.Group>

                                                <Button variant="btn-green" type="submit">Добавить</Button>
                                            </Form>
                                        </Modal.Body>
                                    </Modal>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}


export default Profile;