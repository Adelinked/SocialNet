import Head from "next/head";
import Header from "../../components/Header";
import ProfileForm from "../../components/ProfileForm";
import { useAppContext } from "../../context";
import { useSession } from "next-auth/react";
import styles from "../../styles/Home.module.css";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";

export default function EditProfile() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const { globalState, setGlobalState } = useAppContext();

  let profile = globalState;
  async function getProfile() {
    let pro;
    try {
      const res = await axios.get(`../api/profiles/userProfile`);
      pro = res.data.data[0];
      setGlobalState(JSON.parse(JSON.stringify(pro)));
    } catch (error) {}
  }
  useEffect(() => {
    if (!profile) {
      getProfile();
    }
  }, []);
  if (profile) {
    const { displayName, someAbout, age, imgUrl, _id } = profile;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>SocialNet Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <CircularProgress />
          </div>
        )}
        {session && profile && (
          <>
            <div className={styles.profilesAside}></div>
            <div className={styles.postsContainer}>
              {" "}
              <ProfileForm
                formId="edit-profile-form"
                profileForm={{ displayName, someAbout, age, imgUrl, _id }}
                forNewProfile={false}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
