import { toast } from "react-toastify";

export async function dangersList() {
    try {
        const response = await fetch("/api/dangers/list", {
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


export async function dangerAdd(pointInfo) {
    try {
        const response = await fetch(`/api/dangers/add`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(pointInfo)
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
        return { dangers: [] };
    }
}


export async function trafficList(timeStart, timeEnd) {
    try {
        console.log(timeStart, timeEnd);
        const response = await fetch(`/api/traffic/list?timeStart=${timeStart}&timeEnd=${timeEnd}`, {
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
        return { traffics: [] };
    }
}
