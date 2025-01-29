import React from "react";
import { makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
  input: {
    borderColor: "#1a1a1a",
    backgroundColor: "rgb(211, 211, 211)",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
  },
});
export const Input = ({ placeholder, onChange, type }) => {
  const styles = useStyles();
  return <input className={styles.input} type={type} placeholder={placeholder} required onChange={onChange} />;
};
