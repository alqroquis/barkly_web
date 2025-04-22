import { toast } from "react-toastify";

export async function getUser() {
    try {
        const response = await fetch("/api/auth/current-user", {
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