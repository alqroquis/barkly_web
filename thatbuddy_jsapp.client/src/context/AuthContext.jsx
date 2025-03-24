import { createContext, useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUser } from '../functions/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Обработчик отправки формы входа
    const handleLogin = async (login, password) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: login, password: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Неверный логин или пароль");
            }
            const data = await response.json();
            toast.success(data.message);
            let userInfo = await getUser();
            setUser(userInfo);
            localStorage.setItem("user", JSON.stringify(userInfo));
        } catch (error) {
            console.error("Ошибка входа, вызываю toast...", error.message);
            toast.error(error.message);
        }
    };

    const logout = async () => {
        await axios.get("/auth/logout", { withCredentials: true });
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{
            user,
            handleLogin,
            loading,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
AuthProvider.propTypes = {
    children: PropTypes.node
}

export default AuthContext;