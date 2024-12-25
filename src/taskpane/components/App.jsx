import React from "react";
import AddButton from "./AddButton/AddButton.jsx";
import { makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
  title: {
    margin: "20px",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
});
const App = () => {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Плагин для ВКС</h1>
      <AddButton />
    </div>
  );
};

export default App;
