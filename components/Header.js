import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useAppContext } from "../context";
import { Avatar } from "@mui/material";
import { deepOrange, deepPurple } from "@mui/material/colors";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorClosed, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import axios from "axios";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const handleSignin = (e) => {
    e.preventDefault();
    signIn();
  };

  const handleSignout = (e) => {
    e.preventDefault();
    signOut();
  };
  let name = null;
  let img = null;
  const { globalState } = useAppContext();
  const profile = globalState;
  if (session) {
    name = session.user.name ?? session.user.email;
    name = name + " S";
    img = session.user.image;
  }
  if (profile) {
    name = profile.displayName;
    img = profile.imgUrl;
  }

  const setProfileOn = async () => {
    if (!profile) return;
    const id = profile._id;

    try {
      const onLine = await axios.put(`/api/profiles/${id}`, {
        onLine: true,
      });
    } catch (error) {}
  };

  useEffect(() => {
    const id = setInterval(setProfileOn, 120000);
    return () => clearInterval(id);
  }, []);

  const handleClick = () => {
    router.push("/profile/EditProfile");
  };
  return (
    <div className="header">
      {session && (
        <>
          <Link href="/">
            <a className="logo" title="Home page">
              SocialNet
            </a>
          </Link>

          <Link href="/profile/EditProfile">
            <a>
              <div className="profile">
                <Avatar
                  className="header-avatar"
                  title={name + " (click to update your profile info)"}
                  alt=""
                  src={img}
                  sx={
                    ({ bgcolor: deepOrange[500] },
                    { width: "120px" },
                    { height: "70px" },
                    { objectFit: "fill" })
                  }
                >
                  {name[0]}
                </Avatar>
                <p className="userName"></p>
              </div>
            </a>
          </Link>

          <FontAwesomeIcon
            title="leave"
            className="btn-signin"
            icon={faDoorOpen}
            style={{
              fontSize: 20,
            }}
            onClick={handleSignout}
          />
        </>
      )}
      {!session && (
        <>
          <Link href="/">
            <a className="logo">SocialNet</a>
          </Link>

          <FontAwesomeIcon
            className="btn-signin"
            icon={faDoorClosed}
            style={{
              fontSize: 20,
            }}
            onClick={handleSignin}
          />
        </>
      )}
    </div>
  );
}
