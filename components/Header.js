import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useAppContext } from "../context";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorClosed, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import axios from "axios";
import { USER_REFRESH_STATUS } from "../variables";
import { FaGlobeAmericas } from "react-icons/fa";
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
  let name = "Guest";
  let img = "";

  const { globalState } = useAppContext();
  const profile = globalState;
  if (session) {
    name = session.user.name ?? session.user.email;
    img = session.user.image;
  }
  if (profile) {
    name = profile.displayName;
    img = profile.imgUrl;
  }

  useEffect(() => {
    let controller = new AbortController();

    const setProfileOn = async () => {
      if (!session || !profile) return;
      const id = profile._id;
      try {
        const onLine = await axios.put(
          `/api/profiles/${id}`,
          {
            onLine: true,
          },
          { signal: controller.signal }
        );
      } catch (error) {}
    };
    setProfileOn();
    return () => {
      controller?.abort();
    };
  }, []);

  useEffect(() => {
    let controller = new AbortController();
    const setProfileOn = async () => {
      if (!session || !profile) return;

      const id = profile._id;
      try {
        const onLine = await axios.put(
          `/api/profiles/${id}`,
          {
            onLine: true,
          },
          { signal: controller.signal }
        );
      } catch (error) {}
    };
    const id = setInterval(setProfileOn, USER_REFRESH_STATUS);
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, []);

  const handleClick = () => {
    router.push("/profile/EditProfile");
  };
  return (
    <div className="header">
      <div className="logo">
        <Link href="/">
          <a title="Home page">
            <i>
              <FaGlobeAmericas /> SocialNet
            </i>
          </a>
        </Link>
      </div>
      {(session || !session) && (
        <>
          <Link href="/profile/EditProfile">
            <a>
              <div className="profile">
                <img
                  className="header-avatar"
                  title={name + " (click to update your profile info)"}
                  alt={name[0]}
                  src={img ?? "/anonymous.png"}
                />
                <p className="userName">{name}</p>
              </div>
            </a>
          </Link>
        </>
      )}
      {!session ? (
        <>
          <FontAwesomeIcon
            className="btn-signin"
            icon={faDoorClosed}
            style={{
              fontSize: 18,
            }}
            onClick={handleSignin}
          />
        </>
      ) : (
        <FontAwesomeIcon
          title="Logout"
          className="btn-signin"
          icon={faDoorOpen}
          style={{
            fontSize: 20,
          }}
          onClick={handleSignout}
        />
      )}
    </div>
  );
}
