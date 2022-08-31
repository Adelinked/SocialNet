import styles from "../styles/Profile.module.css";
import { Avatar, Box, TextField } from "@mui/material";

export const ProfileDesc = ({ showDesc, aside, ...rest }) => {
  if (!showDesc) return null;
  const { displayName, imgUrl, age, someAbout } = rest;
  return !aside ? (
    <div className={styles.profileView}>
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
    <div className={styles.profileViewAside}>
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
