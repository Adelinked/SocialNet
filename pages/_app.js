import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AppWrapper } from "../context";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppWrapper value={pageProps.profile}>
        <Component {...pageProps} />
        <ToastContainer />
      </AppWrapper>
    </SessionProvider>
  );
}

export default MyApp;
