import { toast } from "react-toastify";

export async function petsList() {
    try {
        const response = await fetch("/api/pets/list", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}


export async function petsGet(id) {
    try {
        const response = await fetch(`/api/pets/get/${id}`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}


export async function medCardGet(id) {
    try {
        const response = await fetch(`/api/pets/get-medicine-card/${id}`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}


export async function petAdd(petInfo) {
    try {
        const response = await fetch(`/api/pets/add`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(petInfo)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        toast.success("Успешно!");
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}


export async function petUpdate(petId, petInfo) {
    try {
        const response = await fetch(`/api/pets/edit/${petId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(petInfo)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        toast.success("Данные питомца успешно обновлены!");
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}


export async function medCardUpdate(petId, medicineCardInfo) {
    try {
        const response = await fetch(`/api/pets/edit-medicine-card/${petId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(medicineCardInfo)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        toast.success("Данные питомца успешно обновлены!");
        return data;
    } catch (error) {
        toast.error(error.message);
    }
}