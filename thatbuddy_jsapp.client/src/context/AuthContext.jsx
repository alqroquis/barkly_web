import { createContext, useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/auth/profile", { withCredentials: true })
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const loginWithYandex = () => {
        window.location.href = "https://localhost:51739/auth/login/yandex"; // URL ������ �������
    };

    const logout = async () => {
        await axios.get("/auth/logout", { withCredentials: true });
        // �������������� �������� ����� ������
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithGoogle: () => { },
            loginWithYandex: loginWithYandex,
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