import React from "react";
import { formatDateDay, formatDateHour } from "../utils";

export const InfoMeet = ({ datas, meet }) => {
  let day = formatDateDay(datas.started_at);
  let startTime = formatDateHour(datas.started_at);
  let endTime = formatDateHour(datas.ended_at);
  return (
    <div>
      <h1>{meet}</h1>
      <p>ID конференции:</p>
      <p>{datas.id}</p>
      <p>Название:</p>
      <p>{datas.title}</p>
      <p>Дата:</p>
      <p>{"Дата: " + day + " c " + startTime + " по " + endTime}</p>
    </div>
  );
};
