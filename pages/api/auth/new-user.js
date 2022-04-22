import Head from "next/head";
import Header from "../../../components/Header";
import styles from "../../../styles/Home.module.css";
import { useSession } from "next-auth/react";

export default NewUser = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <div className={styles.container}>
      <Head>
        <title>Social Net</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Social Net</h1>
        <div className={styles.user}>
          {loading && <div className={styles.title}>Loading...</div>}
          {session && (
            <>
              <p style={{ marginBottom: "10px" }}>
                {" "}
                Welcome, {session.user.name ?? session.user.email}
              </p>{" "}
              <br />
              <img src={session.user.image} alt="" className={styles.avatar} />
              <div>
                <h1>Profile info</h1>
                <p>
                  Please complete your profile info (you can modify them at
                  anytime)
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
