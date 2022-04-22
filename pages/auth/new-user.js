import Head from "next/head";
import Header from "../../components/Header";
import styles from "../../styles/Auth.module.css";
import { useSession, getSession } from "next-auth/react";
import ProfileForm from "../../components/ProfileForm";

export default function NewUser() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const profileForm = {
    displayName: (session && session.user.name) ?? "",
    someAbout: "",
    age: 16,
    imgUrl: (session && session.user.image) ?? "",
  };
  return (
    <div className={styles.container}>
      <Head>
        <title className="app-title">Social Net</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <h1 className="app-title">Social Net</h1>
      <main className={styles.main}>
        <div className={styles.user}>
          {loading && <div className={styles.title}>Loading...</div>}
          {session && (
            <>
              <p style={{ marginBottom: "10px" }}>
                Welcome, {session.user.name ?? session.user.email}
              </p>

              <ProfileForm
                formId="add-profile-form"
                profileForm={profileForm}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: { destination: "/auth/signin" },
    };
  } else {
    return {
      props: { session },
    };
  }
}
