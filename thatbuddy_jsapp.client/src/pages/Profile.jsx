import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { petsList, petsGet, petAdd, medCardGet, petUpdate } from '../functions/pets';
import { documentsList, documentsUpload } from '../functions/documents';
import defaultLogo from '../assets/default.svg';
import { toast } from "react-toastify";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";


const BreedSearch = ({ value, onChange }) => {
    const [breeds, setBreeds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBreed, setSelectedBreed] = useState(value || []);

    useEffect(() => {
        setSelectedBreed(value || []);
    }, [value]);


    useEffect(() => {
        fetch(`/api/search/breeds`, { method: "GET", credentials: "include" }).then((response) => {
            return response.json();
        }).then((data) => {
            setBreeds(data.breeds);
            setPage(1);
            setHasMore(data.totalCount > data.breeds?.length);
        });
    }, []);


    const handleSearch = async (query) => {
        setIsLoading(true);
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/search/breeds?query=${query}&page=1`, { method: "GET", credentials: "include" });
            const data = await response.json();
            setBreeds(data.breeds);
            setPage(1);
            setHasMore(data.totalCount > data.breeds?.length);
        } catch (error) {
            console.error("Ошибка при поиске пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleLoadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search/breeds?query=${searchQuery}&page=${page + 1}`, { method: "GET", credentials: "include" });
            const data = await response.json();
            console.log(data.breeds);
            setBreeds((prevBreeds) => [...prevBreeds, ...data.breeds]);
            setPage((prevPage) => prevPage + 1);
            setHasMore(data?.totalCount > breeds?.length + data.breeds?.length);
        } catch (error) {
            console.error("Ошибка при загрузке пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
            handleLoadMore();
        }
    };


    return (
        <AsyncTypeahead
            id="breed-search"
            placeholder="Введите породу"
            isLoading={isLoading}
            options={breeds}
            onSearch={handleSearch}
            onChange={(selected) => {
                setSelectedBreed(selected);
                onChange(selected);
            }}
            onInputChange={(text) => handleSearch(text)}
            selected={selectedBreed}
            labelKey="name"
            renderMenuItemChildren={(option) => <div>{option.name}</div>}
            onScroll={handleScroll}
            defaultInputValue={selectedBreed[0]?.name}
        />
    );
};


const ReminderCard = () => {
    return (
        <Card
            style={{
                width: "276px",
                height: "131px",
                background: "#F4F4F4",
                borderRadius: "20px",
                marginBottom: "20px",
                border: "none"
            }}
        >
            <Card.Body>
                <Card.Title
                    style={{
                        fontFamily: "Roboto",
                        fontStyle: "normal",
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "16px",
                        color: "#000000",
                        marginBottom: "10px",
                    }}
                >
                    Ревакцинация
                </Card.Title>

            </Card.Body>
        </Card>
    );
};


const AddPetModal = ({ show, onHide, onSave }) => {
    const [name, setName] = useState("");
    const [breed, setBreed] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [stigma, setStigma] = useState(""); // Номер клейма
    const [microchip, setMicrochip] = useState(""); // Номер микрочипа
    const [description, setDescription] = useState(""); // Описание питомца


    const handleSave = () => {
        if (!name || !birthdate) {
            alert("Заполните поля Имя и Дата рождения");
            return;
        }
        onSave({ name: name, breedId: breed.id, birthDate: new Date(`${birthdate}T12:30:52.673Z`).toISOString(), stigma: stigma, microchip: microchip, description: description });

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
                <Button variant="primary" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


const EditPetModal = ({ show, onHide, onSave, pet }) => {
    const [name, setName] = useState("");
    const [breed, setBreed] = useState(null);
    const [birthdate, setBirthdate] = useState("");
    const [stigma, setStigma] = useState("");
    const [microchip, setMicrochip] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (pet) {
            setName(pet.name || "");
            setBirthdate(pet.birthdate?.split("T")[0] || "");
            setStigma(pet.stigma || "");
            setMicrochip(pet.microchip || "");
            setDescription(pet.description || "");
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
                <Button variant="primary" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
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


const DogHead = ({ name, age, imageUrl = defaultLogo }) => {
    return (
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
                style={{
                    boxSizing: "border-box",
                    width: "112px",
                    height: "112px",
                    border: "3px solid rgba(255, 255, 255, 0.13)",
                    filter: "drop-shadow(0px 0px 7px rgba(0, 0, 0, 0.25))",
                    borderRadius: "50%",
                    backgroundImage: `url("${imageUrl}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
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
                <button className="green-button">Добавить запись активности</button>
            </div>
        </div>
    );
};


class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reminders: [],
            pet: null,
            medcard: null,
            activeTab: "Общее",
            showEditModal: false,
            documents: [],
            showDownloadModal: false,
            selectedDocument: null,
            showEmbeddedView: false
        };
        this.fetchPet = this.fetchPet.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.toggleEditModal = this.toggleEditModal.bind(this);
        this.handleSavePet = this.handleSavePet.bind(this);
    }


    componentDidMount() {
        this.fetchReminders();
    }


    fetchReminders = async () => {

    };


    fetchPet = async (id) => {
        this.setState({ activeTab: "Общее" });
        this.setState({ pet: null, medcard: null });
        let petInfo = await petsGet(id);
        let medcardInfo = await medCardGet(id);
        this.setState({ pet: petInfo, medcard: medcardInfo });
        await this.fetchDocuments(id);
    };

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

    handleSavePet = async (updatedPetInfo) => {
        try {
            const updatedPet = await petUpdate(this.state.pet.id, updatedPetInfo);
            this.setState({
                pet: updatedPet,
                showEditModal: false
            });
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
        const { reminders, pet, activeTab, medcard, showEditModal, documents, showDownloadModal, selectedDocument, showEmbeddedView } = this.state;
        const tabs = ["Общее", "Медицинская карта", "Документы", "Соревнования", "Статистика", "Прием лекарств"];

        return (
            <Container fluid style={{ marginTop: 100 }}>
                <h1 style={{ marginBottom: "20px" }}>Личный кабинет</h1>
                <Row>
                    <Col md={4}>
                        <h2 style={{ marginBottom: "20px" }}>Напоминания</h2>
                        {reminders !== null && reminders?.map((reminder) => (
                            <ReminderCard key={reminder.id} reminder={reminder} />
                        ))}
                    </Col>

                    <Col md={8}>
                        <h2 style={{ marginBottom: "20px" }}>Мои питомцы</h2>
                        <PetsColumn onSelectedPetChange={this.fetchPet} />
                        <div className="grey-rounded-container">
                            {pet !== null && <DogHead name={pet.name} age={calculateDogAge(pet.birthdate)} imageUrl={pet.logoUrl} />}
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
                                        <button className="black-button" onClick={() => { }}>
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

                                    {showEmbeddedView && (
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            zIndex: 1000,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '20px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                marginBottom: '10px'
                                            }}>
                                                <button
                                                    className="black-button"
                                                    onClick={() => this.setState({ showEmbeddedView: false })}
                                                >
                                                    Закрыть
                                                </button>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {this.renderEmbeddedView()}
                                            </div>
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
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}


const pluralize = (number, words) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[
        number % 100 > 4 && number % 100 < 20
            ? 2
            : cases[number % 10 < 5 ? number % 10 : 5]
    ];
};


const calculateDogAge = (birthdateString) => {
    const birthdate = new Date(birthdateString);
    const currentDate = new Date();

    const timeDiff = currentDate - birthdate;

    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    const years = Math.floor(timeDiff / millisecondsInYear);
    const remainingMilliseconds = timeDiff % millisecondsInYear;
    const months = Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24 * 30.44));

    return { years, months };
};


const formatAge = (years, months) => {
    const yearWord = pluralize(years, ["год", "года", "лет"]);
    const monthWord = pluralize(months, ["месяц", "месяца", "месяцев"]);

    let result = "";
    if (years > 0) {
        result += `${years} ${yearWord}`;
    }
    if (months > 0) {
        if (result) result += " и ";
        result += `${months} ${monthWord}`;
    }
    else if (years < 1 && months < 1) {
        result = `Меньше месяца`
    }
    return result || "Возраст не определен";
};


const formatBirthdate = (birthdateString) => {
    const date = new Date(birthdateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};


export default Profile;