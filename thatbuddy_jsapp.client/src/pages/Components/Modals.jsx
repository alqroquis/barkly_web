import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab } from "react-bootstrap";
import { BreedSearch, FeedTypeSearch } from '../Components/SearchComponents';
import { toast } from "react-toastify";


export const AddPetModal = ({ show, onHide, onSave }) => {
    const [name, setName] = useState("");
    const [breed, setBreed] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [stigma, setStigma] = useState("");
    const [microchip, setMicrochip] = useState("");
    const [description, setDescription] = useState("");

    const handleSave = () => {
        if (!name || !birthdate) {
            alert("Заполните поля Имя и Дата рождения");
            return;
        }
        onSave({
            name: name,
            breedId: breed.id,
            birthDate: new Date(`${birthdate}T12:30:52.673Z`).toISOString(),
            stigma: stigma,
            microchip: microchip,
            description: description
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить питомца</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formPetName">
                        <Form.Label>Имя питомца</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetBreed">
                        <Form.Label>Порода</Form.Label>
                        <BreedSearch value={breed} onChange={setBreed} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetBirthdate">
                        <Form.Label>Дата рождения</Form.Label>
                        <Form.Control
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetStigma">
                        <Form.Label>Номер клейма</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер клейма"
                            value={stigma}
                            onChange={(e) => setStigma(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetMicrochip">
                        <Form.Label>Номер микрочипа</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер микрочипа"
                            value={microchip}
                            onChange={(e) => setMicrochip(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetDescription">
                        <Form.Label>Описание питомца</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Введите описание питомца"
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
                <Button variant="primary btn-green" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export const EditPetModal = ({ show, onHide, onSave, pet }) => {
    const [name, setName] = useState(null);
    const [breed, setBreed] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [stigma, setStigma] = useState(null);
    const [microchip, setMicrochip] = useState(null);
    const [description, setDescription] = useState(null);

    useEffect(() => {
        if (pet) {
            setName(pet.name || null);
            setBirthdate(pet.birthdate?.split("T")[0] || null);
            setStigma(pet.stigma || null);
            setMicrochip(pet.microchip || null);
            setDescription(pet.description || null);
        }
    }, [pet]);

    useEffect(() => {
        if (pet?.breed) {
            setBreed([pet.breed]);
        }
    }, [pet]);

    const handleSave = () => {
        if (!name || !birthdate) {
            alert("Заполните поля Имя и Дата рождения");
            return;
        }
        onSave({
            name: name,
            breedId: breed?.[0]?.id || null,
            birthDate: new Date(birthdate).toISOString(),
            stigma: stigma,
            microchip: microchip,
            description: description
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать данные питомца</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formPetName">
                        <Form.Label>Имя питомца</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetBreed">
                        <Form.Label>Порода</Form.Label>
                        <BreedSearch
                            value={breed}
                            onChange={(selected) => setBreed(selected)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetBirthdate">
                        <Form.Label>Дата рождения</Form.Label>
                        <Form.Control
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                        />
                        {/* Для отладки можно добавить: */}
                        <small className="text-muted">
                            Текущее значение: {birthdate || "не установлено"}
                        </small>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetStigma">
                        <Form.Label>Номер клейма</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер клейма"
                            value={stigma}
                            onChange={(e) => setStigma(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetMicrochip">
                        <Form.Label>Номер микрочипа</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер микрочипа"
                            value={microchip}
                            onChange={(e) => setMicrochip(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPetDescription">
                        <Form.Label>Описание питомца</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Введите описание питомца"
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
                <Button variant="primary btn-green" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export const EditMedicineCardModal = ({ show, onHide, onSave, medicineCard, petId }) => {
    const [allergies, setAllergies] = useState(null);
    const [weight, setWeight] = useState(null);
    const [feedType, setFeedType] = useState(null);
    const [feedingFrequency, setFeedingFrequency] = useState(null);
    const [ingredients, setIngredients] = useState(null);
    const [servingSize, setServingSize] = useState(null);
    const [featuresOfCare, setFeaturesOfCare] = useState(null);

    useEffect(() => {
        if (medicineCard) {
            setAllergies(medicineCard.allergies || null);
            setWeight(medicineCard.weight || null);
            setFeedType(medicineCard.feedType ? [medicineCard.feedType] : null);
            setFeedingFrequency(medicineCard.feedingFrequency || null);
            setIngredients(medicineCard.ingredients || null);
            setServingSize(medicineCard.servingSize || null);
            setFeaturesOfCare(medicineCard.featuresOfCare || null);
        }
    }, [medicineCard]);

    const handleSave = () => {
        onSave({
            allergies: allergies,
            weight: weight ? parseFloat(weight) : null,
            feedTypeId: feedType?.[0]?.id || null,
            feedingFrequency: feedingFrequency ? parseInt(feedingFrequency) : null,
            ingredients: ingredients,
            servingSize: servingSize ? parseInt(servingSize) : null,
            featuresOfCare: featuresOfCare
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать медицинскую карту</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formAllergies">
                        <Form.Label>Аллергии</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Укажите аллергии"
                            value={allergies || ''}
                            onChange={(e) => setAllergies(e.target.value || null)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formWeight">
                        <Form.Label>Вес (кг)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            placeholder="Укажите вес"
                            value={weight || ''}
                            onChange={(e) => setWeight(e.target.value || null)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFeedType">
                        <Form.Label>Тип корма</Form.Label>
                        <FeedTypeSearch
                            value={feedType}
                            onChange={(selected) => setFeedType(selected)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFeedingFrequency">
                        <Form.Label>Частота кормления (раз в день)</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max="10"
                            placeholder="Укажите частоту кормления"
                            value={feedingFrequency || ''}
                            onChange={(e) => setFeedingFrequency(e.target.value || null)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formIngredients">
                        <Form.Label>Состав корма</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Укажите состав корма"
                            value={ingredients || ''}
                            onChange={(e) => setIngredients(e.target.value || null)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formServingSize">
                        <Form.Label>Размер порции (г)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Укажите размер порции"
                            value={servingSize || ''}
                            onChange={(e) => setServingSize(e.target.value || null)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFeaturesOfCare">
                        <Form.Label>Особенности ухода</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Укажите особенности ухода"
                            value={featuresOfCare || ''}
                            onChange={(e) => setFeaturesOfCare(e.target.value || null)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button variant="primary btn-green" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export const ActivityModal = ({ show, onHide, petId, fetchActivities, fetchWeightMeasurements }) => {
    const [activeTab, setActiveTab] = useState('walk');
    const [formData, setFormData] = useState({
        duration: '',
        distance: '',
        weight: '',
        medicine: '',
        description: '',
        activityTypeId: 1,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const activityData = {
            activityTypeId: getActivityTypeId(activeTab),
            description: formData.description,
            petId: petId
        };

        switch (activeTab) {
            case 'walk':
                activityData.durationMinutes = parseInt(formData.duration);
                activityData.distanceKm = parseFloat(formData.distance);
                activityData.activityTypeId = 1;
                await handleAddActivity(activityData);
                break;
            case 'training':
                activityData.durationMinutes = parseInt(formData.duration);
                activityData.activityTypeId = 4;
                await handleAddActivity(activityData);
                break;
            case 'weight':
                activityData.weightKg = parseFloat(formData.weight);
                await handleAddWeight(activityData);
                break;
            case 'medicine':
                activityData.medicine = formData.medicine;
                await handleAddActivity(activityData);
                break;
        }
    };

    const handleAddActivity = async (activityData) => {
        try {
            const response = await fetch('/api/activities/add-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении активности');
            }

            toast.success('Активность успешно добавлена!');
            fetchActivities();
            onHide();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAddWeight = async (weightData) => {
        try {
            const response = await fetch('/api/activities/add-weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: petId,
                    weightKg: weightData.weightKg
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении данных о весе');
            }

            toast.success('Данные о весе успешно добавлены!');
            fetchWeightMeasurements();
            onHide();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getActivityTypeId = (tab) => {
        switch (tab) {
            case 'walk': return 1;
            case 'training': return 2;
            case 'weight': return 3;
            case 'medicine': return 4;
            default: return 1;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const CommonFields = ({ formData, handleChange }) => (
        <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
        </Form.Group>
    );

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Добавить активность</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    style={{color: 'black', textDecoration: 'none'} }
                >
                    <Tab eventKey="walk" title="Прогулка">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Длительность (мин)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Дистанция (км)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    name="distance"
                                    value={formData.distance}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <CommonFields
                                formData={formData}
                                handleChange={handleChange}
                            />
                            <Button variant="primary btn-green" type="submit">Сохранить</Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="training" title="Тренировка">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Длительность (мин)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <CommonFields
                                formData={formData}
                                handleChange={handleChange}
                            />
                            <Button variant="primary btn-green" type="submit">Сохранить</Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="weight" title="Измерение веса">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Вес (кг)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <CommonFields
                                formData={formData}
                                handleChange={handleChange}
                            />
                            <Button variant="primary btn-green" type="submit">Сохранить</Button>
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};


export const CommonFields = ({ formData, handleChange }) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label>Заметки</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
        </Form.Group>
    );
};