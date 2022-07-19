import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProfileForm from "../../components/Forms/ProfileForm";
import { useAppContext } from "../../context";
import { useSession, getSession } from "next-auth/react";
import styles from "../../styles/Home.module.css";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { GUEST_USER } from "../../variables";
import Profile from "../../models/profile";

export default function EditProfile({ profile }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const { globalState, setGlobalState } = useAppContext();

  /*let profile = globalState;
  async function getProfile() {
    console.log("get pro");
    let pro;
    try {
      const res = await axios.get(`../api/profiles/userProfile`);
      pro = res.data.data[0];
      setGlobalState(JSON.parse(JSON.stringify(pro)));
    } catch (error) {}
  }
  useEffect(() => {
    if (session && profile?.displayName == "Guest") getProfile();
  }, []);*/
  if (profile) {
    const { displayName, someAbout, age, imgUrl, _id } = profile;
  }

  return (
    <div className="container">
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
        {session ? (
          profile && (
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
          )
        ) : (
          <>
            <p className={styles.title}>
              Please <a href="/auth/signin">Sign in </a>to continue
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  let pro = [GUEST_USER];

  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: "/auth/signin" },
    };
  }
  pro = await Profile.find({ user: session.user.userId });

  return { props: { profile: JSON.parse(JSON.stringify(pro[0])) } };
}
