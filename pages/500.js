import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";

// pages/500.js
export default function Custom500() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SocialNet Server Error</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        <h1>SocialNet: Server-side error occurred</h1>
        <p>
          Try to <a href="/">refresh</a> the page.
        </p>
      </main>
      <footer className="footer"></footer>
    </div>
  );
}
