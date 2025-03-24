import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { petsList, petsGet, petAdd } from '../functions/pets';
import defaultLogo from '../assets/default.svg';
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";


const BreedSearch = ({ onChange }) => {
    const [breeds, setBreeds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [breed, setBreed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (query) => {
        setIsLoading(true);
        setSearchQuery(query); 
        try {
            const response = await fetch(`/api/search/breeds?query=${query}&page=1`, {method: "GET", credentials: "include"});
            const data = await response.json();
            console.log(data.breeds);
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
                setBreed(selected); 
                onChange(selected[0] || null);
            }}
            onInputChange={(text) => handleSearch(text)}
            selected={breed}
            labelKey="name"
            renderMenuItemChildren={(option) => <div>{option.name}</div>}
            onScroll={handleScroll}
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
        console.log(breed);
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
            activeTab: "Общее"
        };
        this.fetchPet = this.fetchPet.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
    }


    componentDidMount() {
        this.fetchReminders();
    }


    fetchReminders = async () => {

    };


    fetchPet = async (id) => {
        this.setState({ pet: null });
        let petInfo = await petsGet(id);
        this.setState({ pet: petInfo });
    };


    handleTabClick = (tab) => {
        this.setState({ activeTab: tab });
    };


    render() {
        const { reminders, pet, activeTab } = this.state;
        const tabs = ["Общее", "Медицинская карта", "Документы", "Соревнования", "Статистика", "Прием лекарств"];

        return (
            <Container fluid style={{ marginTop: 100 }}>
                <h1 style={{ marginBottom: "20px" }}>Личный кабинет</h1>
                <Row>
                    {/* Левая колонка: Напоминания */}
                    <Col md={4}>
                        <h2 style={{ marginBottom: "20px" }}>Напоминания</h2>
                        {reminders !== null && reminders?.map((reminder) => (
                            <ReminderCard key={reminder.id} reminder={reminder} />
                        ))}
                    </Col>

                    {/* Правая колонка: Мои питомцы */}
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
                                        <button className="black-button" onClick={() => { }}>
                                            Редактировать
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Имя: </label>
                                        <p>{pet.name}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Порода: </label>
                                        <p>{pet.breed?.name ?? "Порода не указана"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Дата рождения: </label>
                                        <p>{formatBirthdate(pet.birthdate) ?? "Дата рождения не указана"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Номер микрочипа: </label>
                                        <p>{pet.microchip?.length > 0 ? pet.microchip : "Не указан"}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <label className="p-light">Номер клейма: </label>
                                        <p>{pet.stigma?.length > 0 ? pet.stigma : "Не указан"}</p>
                                    </div>
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