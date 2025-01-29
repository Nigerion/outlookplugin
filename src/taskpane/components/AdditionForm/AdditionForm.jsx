import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import { InfoMeet } from "../InfoMeet/InfoMeet";
import { tokenRefresh, getCookie, updateMeeting, createNewMeeting, initializeApp } from "../utils";

const AdditionForm = ({}) => {
  const [buttonText, setButtonText] = useState("Сгенерировать ссылку");
  const [info, setInfo] = useState(false);
  const [data, setData] = useState("");
  const [meet, setMeet] = useState("Встреча создана");
  useEffect(() => {
    tokenRefresh();
    initializeApp();
  }, []);
  const handleSubmit = () => {
    if (buttonText === "Сгенерировать ссылку") {
      createNewMeeting(setData);
      setButtonText("Обновить встречу");
      setInfo(true);
    } else if (buttonText === "Обновить встречу") {
      setMeet("Встреча обновлена");
      updateMeeting(setData);
    }
  };
  return (
    <>
      <div>
        <p>{"Здравствуйте, " + getCookie("user")}</p>
      </div>
      <div style={{ maxWidth: "300px" }}>
        <p style={{ textAlign: "center" }}>
          Для создания ссылки на видеовстречу заполните данные в форме с информацией о событии (тема, время)
        </p>
      </div>
      {info === false ? "" : <InfoMeet datas={data} meet={meet}></InfoMeet>}

      <Button textButton={buttonText} onClick={handleSubmit} />
    </>
  );
};

export default AdditionForm;
