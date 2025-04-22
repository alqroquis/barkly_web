import { toast } from "react-toastify";

export async function documentsList(petId) {
    try {
        const response = await fetch(`/api/documents/list/${petId}`, {
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


export async function documentsUpload(petId, formData) {
    try {
        const response = await fetch(`/api/documents/upload/${petId}`, {
            method: 'POST',
            body: formData,
            credentials: "include",
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