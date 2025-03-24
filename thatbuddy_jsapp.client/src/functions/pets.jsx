import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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