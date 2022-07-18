import {
  getProviders,
  getCsrfToken,
  signIn,
  getSession,
} from "next-auth/react";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import { useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { purple, deepPurple, deepOrange, green } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Auth.module.css";

import { toast } from "react-toastify";

export default function ({ session, providers, csrfToken }) {
  const { query } = useRouter();
  const [status, setStatus] = useState();
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  const handleChgEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
    setValidEmail(validateEmail(email));
  };

  const errorMsg = (error) => {
    if (error) {
      switch (error) {
        case "Signin":
          return "Try signing in with a different account.";
        case "OAuthSignin":
          return "Try signing in with a different account.";
        case "OAuthCallback":
          return "Try signing in with a different account.";
        case "OAuthCreateAccount":
          return "Try signing in with a different account.";
        case "EmailCreateAccount":
          return "Try signing in with a different account.";
        case "Callback":
          return "Try signing in with a different account.";
        case "OAuthAccountNotLinked":
          return "The same email address is already used with a diffrent provider";
        case "EmailSignin":
          return "The e-mail could not be sent.";
        case "CredentialsSignin":
          return "Sign in failed. Check the details you provided are correct.";
        case "SessionRequired":
          return "Please sign in to access this page.";
        default:
          return "Unable to sign in (" + error + ")";
      }
    }
  };
  const handleErrorMsg = (error) => {
    if (error == "Success") {
      toast.success("Success! Ckeck your email box");
      return;
    }
    toast.error(errorMsg(error));
  };

  handleErrorMsg(query.error);

  const handleSubmit = (e) => {
    e.preventDefault();
    const providerId = e.nativeEvent.submitter.id;
    switch (providerId) {
      case "github":
      case "google":
      case "facebook":
        signIn(providerId);
        break;
      case "email":
        signIn(providerId, { email });
        break;
      case "credentials":
        signIn("credentials", {
          email: e.target["email2"].value,
          password: e.target["password"].value,
        });
        break;
    }
    setTimeout(() => {}, 500);
    setStatus("Loading");
  };

  const handleClick = (provideId) => {
    /*signIn(provideId);
    setStatus("Loading");*/
  };

  //if (session) return null;
  const GitHubButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
    "&:hover": {
      backgroundColor: purple[700],
    },
  }));

  const GoogleButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
    "&:hover": {
      backgroundColor: deepOrange[700],
    },
  }));

  const EmailButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(green[600]),
    backgroundColor: green[600],
    "&:hover": {
      backgroundColor: green[700],
    },
  }));

  return (
    <>
      <Head>
        <title>SocialNet Signin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="app-title">
        <i className="fa fa-globe"> SocialNet</i>
      </h1>

      <div className={styles.loginContainer}>
        {status !== "Loading" ? (
          <form onSubmit={handleSubmit}>
            <p className={styles.loginTitle}>Choose a login Method</p>
            <Link href="/">
              <a>
                <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
                  Or continue as guest!
                </p>
              </a>
            </Link>
            <input type="hidden" name="csrfToken" defaultValue={csrfToken} />

            {Object.values(providers).map((provider) => (
              <div key={provider.name}>
                {provider.name === "GitHub" ? (
                  <GitHubButton
                    id={provider.id}
                    size="large"
                    sx={{ width: "250px", margin: "10px", fontWeight: "700" }}
                    onClick={() => handleClick(provider.id)}
                    type="submit"
                    variant="contained"
                  >
                    Sign in with {provider.name}
                  </GitHubButton>
                ) : provider.name === "Google" ? (
                  <GoogleButton
                    id={provider.id}
                    size="large"
                    sx={{ width: "250px", margin: "10px", fontWeight: "700" }}
                    onClick={() => handleClick(provider.id)}
                    type="submit"
                    variant="contained"
                  >
                    Sign in with {provider.name}
                  </GoogleButton>
                ) : provider.name === "Email" ? (
                  <>
                    <p
                      style={{
                        textAlign: "center",
                        margin: "0",
                        marginTop: "15px",
                        fontWeight: 600,
                      }}
                    >
                      OR
                    </p>

                    <TextField
                      variant="standard"
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChgEmail}
                      label="Email:"
                      sx={{
                        marginLeft: "10px",
                        width: "250px",
                      }}
                    />
                    <EmailButton
                      id={provider.id}
                      sx={{ width: "250px", margin: "10px", fontWeight: "700" }}
                      size="large"
                      variant="contained"
                      onClick={() => handleClick(provider.id)}
                      type="submit"
                      disabled={!validEmail}
                    >
                      Sign in with {provider.name}
                    </EmailButton>
                  </>
                ) : (
                  <Button
                    id={provider.id}
                    sx={{ width: "250px", margin: "10px", fontWeight: "700" }}
                    size="large"
                    variant="contained"
                    onClick={() => handleClick(provider.id)}
                    type="submit"
                  >
                    Sign in with {provider.name}
                  </Button>
                )}
              </div>
            ))}
          </form>
        ) : (
          <CircularProgress />
        )}
      </div>
      <Footer />
    </>
  );
}
/*
<label htmlFor="username">email</label>
            <input name="email2" type="email"></input>
            <label htmlFor="password">Password</label>
            <input name="password" type="password"></input>*/
// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  const providers = await getProviders();
  const session = await getSession(context);
  const csrfToken = await getCsrfToken(context);

  if (session) {
    return {
      redirect: { destination: "/" },
    };
  } else {
    return {
      props: { providers, session, csrfToken },
    };
  }
}
