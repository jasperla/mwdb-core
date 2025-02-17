import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "@mwdb-web/commons/auth";
import { ConfigContext } from "@mwdb-web/commons/config";
import api from "@mwdb-web/commons/api";
import { Extension } from "@mwdb-web/commons/extensions";
import { View, ShowIf } from "@mwdb-web/commons/ui";
import { ProviderButton, ProvidersSelectList } from "./OAuth";

export default function UserLogin() {
    const auth = useContext(AuthContext);
    const config = useContext(ConfigContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(null);
    const [providers, setProviders] = useState([]);

    const colorsList = ["#3c5799", "#01a0f6", "#d03f30", "#b4878b", "#444444"];
    const isOIDCEnabled = config.config["is_oidc_enabled"];

    const locationState = location.state || {};
    async function tryLogin() {
        try {
            const response = await api.authLogin(login, password);
            const prevLocation = locationState.prevLocation || "/";
            auth.updateSession(response.data);
            navigate(prevLocation);
        } catch (error) {
            setLoginError(error);
        }
    }

    const getProviders = useCallback(async () => {
        try {
            const response = await api.oauthGetProviders();
            setProviders(response.data["providers"]);
        } catch (e) {
            setLoginError(e);
        }
    }, []);

    useEffect(() => {
        if (isOIDCEnabled) {
            getProviders();
        }
    }, [getProviders, isOIDCEnabled]);

    if (auth.isAuthenticated) return <Navigate to="/" />;

    return (
        <div className="user-login">
            <div className="background" />
            <View fluid ident="userLogin" error={loginError}>
                <h2 align="center">Welcome to MWDB</h2>
                <h6 align="center">Log in using mwdb credentials</h6>
                <form
                    onSubmit={(ev) => {
                        ev.preventDefault();
                        tryLogin();
                    }}
                >
                    <Extension ident="userLoginNote" />
                    <div className="form-group">
                        <label>Login</label>
                        <input
                            type="text"
                            name="login"
                            value={login}
                            onChange={(ev) => setLogin(ev.target.value)}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                            className="form-control"
                            required
                        />
                    </div>
                    <input
                        type="submit"
                        value="Log in"
                        className="form-control btn btn-success"
                    />
                    <nav
                        className="form-group"
                        style={{ textAlign: "center", marginTop: "5px" }}
                    >
                        <div className="d-flex justify-content-between">
                            <div>
                                <Link to="/recover_password">
                                    Forgot password?
                                </Link>
                            </div>
                            <div>
                                <ShowIf
                                    condition={
                                        config.config["is_registration_enabled"]
                                    }
                                >
                                    <Link to="/register">Register user</Link>
                                </ShowIf>
                            </div>
                        </div>
                    </nav>
                    <ShowIf condition={providers.length}>
                        <hr />
                        <h6 align="center">Log in using OAuth</h6>
                        {providers.length <= 5 ? (
                            providers.map((provider, i) => (
                                <ProviderButton
                                    provider={provider}
                                    color={colorsList[i % colorsList.length]}
                                />
                            ))
                        ) : (
                            <ProvidersSelectList providersList={providers} />
                        )}
                    </ShowIf>
                </form>
            </View>
        </div>
    );
}
