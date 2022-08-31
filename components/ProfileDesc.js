import styles from "../styles/Profile.module.css";
import { Avatar, Box, TextField } from "@mui/material";
import { useEffect, useRef } from "react";

export const ProfileDesc = ({ showDesc, setShowDesc, aside, ...rest }) => {
  if (!showDesc) return null;
  const { displayName, imgUrl, age, someAbout } = rest;
  let timeoutId = useRef(null);

  useEffect(() => {
    const descriptionDiv = document.getElementById(
      `${displayName}-description`
    );
    if (!descriptionDiv) return;

    const maxWidth = aside ? "120px" : "300px";

    if (showDesc) {
      descriptionDiv.style.width = maxWidth;
    } else {
      descriptionDiv.style.width = "0";
    }
    timeoutId = setTimeout(() => setShowDesc(false), 1500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showDesc]);

  return !aside ? (
    <div className={styles.profileView} id={`${displayName}-description`}>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "80%" },
        }}
        noValidate
        autoComplete="off"
      >
        <Avatar
          alt="Remy Sharp"
          className={styles.avatarView}
          src={imgUrl}
          variant="square"
        />
        <TextField
          variant="standard"
          id="displayName"
          name="displayName"
          value={displayName}
          label="Name:"
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          variant="standard"
          label="Age (years):"
          name="age"
          type="text"
          value={age}
          InputProps={{
            readOnly: true,
          }}
        />

        <TextField
          multiline
          maxRows={4}
          label="About"
          name="someAbout"
          type="text"
          value={someAbout}
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
    </div>
  ) : (
    <div className={styles.profileViewAside} id={`${displayName}-description`}>
      <TextField
        variant="standard"
        id="displayName"
        name="displayName"
        value={displayName}
        InputProps={{
          readOnly: true,
        }}
      />
    </div>
  );
};
