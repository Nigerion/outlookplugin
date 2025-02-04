import React from "react";
import { formatDateDay, formatDateHour } from "../utils";

export const InfoMeet = ({ meet, subjectField, startTimeField, endTimeField, confId }) => {
  let day = formatDateDay(startTimeField);
  let startTime = formatDateHour(startTimeField);
  let endTime = formatDateHour(endTimeField);
  return (
    <div style={{ maxWidth: "300px" }}>
      <h1 style={{ textAlign: "center" }}>{meet}</h1>
      <p>ID конференции:</p>
      <p>{"https://vision.api-factory.ru/meeting/" + confId}</p>
      <p>Название:</p>
      <p>{subjectField}</p>
      <p>Дата:</p>
      <p>{day + " c " + startTime + " по " + endTime}</p>
    </div>
  );
};

