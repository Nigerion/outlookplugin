import React, { useState } from "react";
import { Input } from "../Input/Input";
import Button from "../Button/Button";
import { authenticateUser } from "../utils";
export const AuthorizationForm = ({ setIsAuth }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = () => {
    if (login && password) {
      // setIsAuth(true);
      authenticateUser(login, password, setIsAuth);
    } else {
      console.log("Введите логин и пароль.");
    }
    console.log(login, password);
  };
  return (
    <>
      <div style={{ maxWidth: "300px", textAlign: "center" }}>
        <p>Для создания ссылки на видеовстречу заполните данные в форме с информацией о событии (тема, время)</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "300px" }}>
        <h2>Авторизация</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
          <Input placeholder="Логин" type="email" onChange={(e) => setLogin(e.target.value)} />
          <Input placeholder="Пароль" type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button textButton="Войти" onClick={handleSubmit} />
      </div>
    </>
  );
};
