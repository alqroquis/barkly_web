export const pluralize = (number, words) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[
        number % 100 > 4 && number % 100 < 20
            ? 2
            : cases[number % 10 < 5 ? number % 10 : 5]
    ];
};


export const calculateDogAge = (birthdateString) => {
    const birthdate = new Date(birthdateString);
    const currentDate = new Date();

    const timeDiff = currentDate - birthdate;

    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    const years = Math.floor(timeDiff / millisecondsInYear);
    const remainingMilliseconds = timeDiff % millisecondsInYear;
    const months = Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24 * 30.44));

    return { years, months };
};


export const formatAge = (years, months) => {
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


export const formatBirthdate = (birthdateString) => {
    const date = new Date(birthdateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};