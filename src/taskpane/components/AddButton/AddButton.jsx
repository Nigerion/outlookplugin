import React from "react";
import { v4 as uuidv4 } from "uuid";
import { makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
  button: {
    margin: "20px",
    color: "white",
    borderRadius: "10px",
    padding: "10px",
    border: "none",
    backgroundColor: "blue",
  },
});

const AddLinkButton = () => {
  const styles = useStyles();
  const addMeetingLink = (link) => {
    if (Office.context && Office.context.mailbox && Office.context.mailbox.item) {
      Office.context.mailbox.item.body.setAsync(
        `<p>Ссылка на видеоконференцию: <a href="${link}">${link}</a></p>`,
        { coercionType: Office.CoercionType.Html },
        (asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log("Ссылка добавлена успешно");
          } else {
            console.error("Ошибка при добавлении ссылки:", asyncResult.error);
          }
        }
      );
    } else {
      console.error("Office.context.mailbox.item не доступен");
    }
  };
  const generateLink = () => {
    const uniqueId = uuidv4();
    const meetingLink = `https://video.example.com/meeting-${uniqueId}`;
    addMeetingLink(meetingLink);
  };
  return (
    <button className={styles.button} onClick={generateLink}>
      Добавить ссылку на ВКС
    </button>
  );
};

export default AddLinkButton;
