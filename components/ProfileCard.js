import styles from "../styles/Profile.module.css";
import { Avatar, Box, TextField } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { StyledBadge } from "./StyledBadge";
import { OLD_ONLINE_STATUS } from "../variables";

const checkLastUpdate = (date, time) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  if (diff > time) {
    return false;
  }
  return true;
};

export default function ProfileCard({
  avatarOnly = false,
  onStatus = false,
  aside = false,
  ...props
}) {
  const router = useRouter();
  const [showDesc, setShowDesc] = useState(false);
  const name = props.profile.displayName;
  const imgSrc = props.profile.imgUrl;
  const age = props.profile.age;
  const someAbout = props.profile.someAbout;
  const updated = props.profile.updatedAt;
  const scroll = props.scroll;
  let timeoutId = useRef(null);

  const handleMouseOver = (e) => {
    setShowDesc(true);

    //clearTimeout(id);
    /*const itemHeight = scroll * 55;
    const screenHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollHeight =
      itemHeight >= scrollY
        ? Math.max(scrollY, itemHeight)
        : Math.min(scrollY, itemHeight);
     setTimeout(
      () => window.scrollTo({ top: scrollHeight, behavior: "smooth" }),
      200
    );*/
  };

  const handleMouseLeave = (e) => {};
  const handleClick = () => {
    router.push(`/profile/UserPosts?name=${name}`);
  };

  useEffect(() => {
    timeoutId = setTimeout(() => setShowDesc(false), 2500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showDesc]);

  return (
    <div className={styles.contProfileCard} onClick={handleClick}>
      {onStatus && checkLastUpdate(updated, OLD_ONLINE_STATUS) ? (
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
        >
          <Avatar
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            className={styles.avatarProfiles}
            alt=""
            src={imgSrc}
            sx={
              ({ bgcolor: deepPurple[500] },
              { width: "80px" },
              { height: "40px" })
            }
          >
            {name[0]}
          </Avatar>
        </StyledBadge>
      ) : (
        <Avatar
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          className={styles.avatarProfiles}
          alt=""
          src={imgSrc}
          sx={
            ({ bgcolor: deepPurple[500] },
            { width: "80px" },
            { height: "40px" })
          }
        ></Avatar>
      )}
      {!avatarOnly && <p className={styles.profileName}>{name}</p>}
      {showDesc &&
        (!aside ? (
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
                src={imgSrc}
                variant="square"
              />
              <TextField
                variant="standard"
                id="displayName"
                name="displayName"
                value={name}
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
              value={name}
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
        ))}
    </div>
  );
}
