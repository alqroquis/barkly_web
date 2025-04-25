import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { petsList, petsGet, petAdd, medCardGet, petUpdate, medCardUpdate } from '../functions/pets';
import { documentsList, documentsUpload } from '../functions/documents';
import { pluralize, calculateDogAge, formatAge, formatBirthdate } from './Components/Functions';
import { AddPetModal, EditPetModal, EditMedicineCardModal, ActivityModal } from './Components/Modals';
import PetActivityChart, { WeightChart, TrainingChart} from './Components/DurationBarChart';
import defaultLogo from '../assets/default.svg';
import { toast } from "react-toastify";


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


const DogHead = ({ name, age, imageUrl = defaultLogo, onAddActivity }) => {
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
                <button className="green-button" onClick={onAddActivity}>Добавить запись активности</button>
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
            showEditMedModal: false,
            documents: [],
            showDownloadModal: false,
            selectedDocument: null,
            showActivityForm: false,
            showWeightForm: false,
            activities: [],
            trainings: [],
            weightMeasurements: [],
            weightHistory: [],
            activityTypes: []
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
        await this.fetchActivities();
        await this.fetchWeightMeasurements();
        await this.fetchTrainings();
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
        const { reminders, pet, activeTab, medcard, showEditModal, documents, showDownloadModal, selectedDocument, showEditMedModal, activities, showActivityForm, weightMeasurements, trainings } = this.state;
        const tabs = ["Общее", "Медицинская карта", "Документы", "Статистика", "Прием лекарств"];

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
                            {pet !== null && <DogHead name={pet.name} age={calculateDogAge(pet.birthdate)} imageUrl={pet.logoUrl} onAddActivity={() => this.setState({ showActivityForm: true })} />}
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
                                    {activities?.length > 0 && (
                                        <>
                                            <h4 className="mb-4">Статистика активностей</h4>
                                            <div className="container bg-white rounded p-4 mb-4 shadow-sm">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="mb-5">
                                                            <h5>Длительность прогулок</h5>
                                                            <PetActivityChart data={activities} type="duration" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="container bg-white rounded p-4 mb-4 shadow-sm">
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

                                    {weightMeasurements?.length > 0 && (
                                        <>
                                            <h4 className="mb-4">Статистика веса</h4>
                                            <div className="container bg-white rounded p-4 mb-4 shadow-sm">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <WeightChart data={weightMeasurements} />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}


                                    {trainings?.length > 0 && (
                                        <div className="container bg-white rounded p-4 mb-4 shadow-sm">
                                            <h5>Статистика тренировок</h5>
                                            <TrainingChart data={trainings} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}


export default Profile;