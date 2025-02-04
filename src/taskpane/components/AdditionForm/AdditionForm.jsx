import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import { InfoMeet } from "../InfoMeet/InfoMeet";
import {
  createNewMeeting,
  extractMeetingId,
  getCookie,
  getFormEndTime,
  getFormLocation,
  getFormStartTime,
  getFormSubject,
  getMeetingBody,
  tokenRefresh,
  updateMeeting,
} from "../utils";

const AdditionForm = ({}) => {
  const [buttonText, setButtonText] = useState("Сгенерировать ссылку");
  const [info, setInfo] = useState(false);
  const [meet, setMeet] = useState("Встреча создана");

  const [subjectField, setSubjectField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");
  // const [bodyField, setBodyField] = useState("");
  // const [locationField, setLocationField] = useState("");
  const [confId, setConfId] = useState("");
  let confDescription = "Описание отсутсвует";

  function updateFields() {
    getFormSubject(setSubjectField);
    // getFormLocation(setLocationField); //не нужно
    getFormEndTime(setEndTimeField);
    getFormStartTime(setStartTimeField);
    // getMeetingBody(setBodyField);
  }

  useEffect(() => {
    setInterval(updateFields, 1000);
    setInterval(tokenRefresh, 5 * 300000);
  }, []);

  const handleSubmit = () => {
    updateFields();
    if (buttonText === "Сгенерировать ссылку") {
      createNewMeeting(setConfId, subjectField, confDescription, startTimeField, endTimeField);

      setButtonText("Обновить встречу");
      setInfo(true);
    } else if (buttonText === "Обновить встречу") {
      setMeet("Встреча обновлена");
      updateMeeting(setConfId, subjectField, confDescription, startTimeField, endTimeField, confId);
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
      {info === false ? (
        ""
      ) : (
        <InfoMeet
          meet={meet}
          subjectField={subjectField}
          startTimeField={startTimeField}
          endTimeField={endTimeField}
          confId={confId}
        ></InfoMeet>
      )}

      <Button textButton={buttonText} onClick={handleSubmit} />
    </>
  );
};

export default AdditionForm;
