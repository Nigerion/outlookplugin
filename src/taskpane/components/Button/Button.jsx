import React from "react";
import { makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
  button: {
    backgroundColor: "#3d3d3d",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  // button:hover {
  //     backgroundColor: "#1a1a1a",
  // }
});
// import styles from "./style.module.css";
const style = {
  backgroundColor: "#3d3d3d",
  color: "white",
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  ":hover": {
    backgroundColor: "#1a1a1a",
  },
};
const Button = ({ textButton, onClick}) => {
  const styles = useStyles();
  return (
    <button style={style} className={styles.button} onClick={onClick}>
      {textButton}
    </button>
  );
};

export default Button;
