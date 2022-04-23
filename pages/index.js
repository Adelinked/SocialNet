import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Home.module.css";
import { useSession, getSession } from "next-auth/react";
import dbConnect from "../lib/dbConnect";
import Profile from "../models/profile";
import Post from "../models/Post";
import ProfilesNav from "../components/ProfilesNav";
import PostComp from "../components/PostComp";
import PostsNav from "../components/PostsNav";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const postsLimit = 5;

export default function Home({ profiles, posts_profile }) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState(posts_profile);
  const [profilesCli, setProfilesCli] = useState(profiles);

  const loading = status === "loading";
  const [skip, setSkip] = useState(0);
  const [bottomLoad, setBottomLoad] = useState(false);
  const [msg, setMsg] = useState("");
  const relaodHomePage = () => {
    refreshPosts();
    refreshProfiles();
  };

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    return function cleanup() {
      document.removeEventListener("scroll", handleScroll);
    };
  });

  useEffect(() => {
    const id = setInterval(relaodHomePage, 20000);
    return () => clearInterval(id);
  }, [posts]);

  async function refreshProfiles() {
    try {
      const res = await axios.get(`/api/profiles`);
      const { data } = res;
      setProfilesCli(data.data);
    } catch (error) {}
  }

  async function refreshPosts() {
    try {
      const res = await axios.get(`/api/posts?skip=0&limit=${posts.length}`);
      const { data } = res;
      setPosts(data.data);
    } catch (error) {}
  }
  async function getPosts() {
    try {
      setBottomLoad(true);
      const res = await axios.get(
        `/api/posts?skip=${skip}&limit=${postsLimit}`
      );
      const { data } = res;
      setPosts([...posts, ...data.data]);
      if (data.data.length == 0) {
        setMsg("No more posts to diplay");
        setTimeout(() => {
          setMsg("");
        }, 1500);
      }
      setBottomLoad(false);
    } catch (error) {}
  }
  useEffect(() => {
    if (skip > 0) {
      getPosts();
    }
  }, [skip]);

  const handleScroll = (e) => {
    const {
      offsetHeight,
      scrollTop,
      scrollHeight,
      scrollTopMax,
      clientHeight,
    } = e.target.documentElement;

    if (clientHeight + scrollTop === scrollHeight) {
      setSkip(posts.length);
    }
  };
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
        {session && (
          <>
            <div className={styles.profilesAside}>
              <ProfilesNav profiles={profilesCli} />
            </div>

            <div className={styles.postsContainer} id="postsContainer">
              <PostComp setPosts={setPosts} posts={posts} />
              <PostsNav posts={posts} setPosts={setPosts} />
              {bottomLoad && <CircularProgress style={{ margin: "0 50%" }} />}
              {msg.length > 0 && (
                <p style={{ textAlign: "center", fontWeight: "600" }}>{msg}</p>
              )}
            </div>

            <div className={styles.futurAside}></div>
          </>
        )}
        {!session && (
          <>
            <p className={styles.title}>
              Please <a href="/auth/signin">Sign in </a>to continue
            </p>
          </>
        )}
      </main>
      <footer className="footer">
        <Footer />
      </footer>
    </div>
  );
}

export async function getServerSideProps(context) {
  let profiles = [],
    pro,
    posts_profile = [];

  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: "/auth/signin" },
    };
  }

  dbConnect();

  try {
    pro = await Profile.find({ user: session.user.userId });
    if (!pro || pro.length == 0) {
      return {
        redirect: { destination: "/auth/new-user" },
      };
    }
  } catch (error) {
    return {
      redirect: { destination: "/auth/new-user" },
    };
  }

  try {
    profiles = await Profile.find({ user: { $ne: session.user.userId } }).sort({
      updatedAt: -1,
    });
  } catch (error) {}

  try {
    const result = await Post.find({}, undefined, { limit: Number(postsLimit) })
      .sort({ updatedAt: -1 })
      .populate({
        path: "profile",
        select: "displayName age imgUrl someAbout",
      });

    posts_profile = result.map((doc) => {
      const { profile, _doc } = doc;

      const { text, postImg, updatedAt, _id, createdAt } = _doc;
      const { displayName, imgUrl, age, someAbout } = profile;
      return {
        text,
        postImg,
        updatedAt,
        _id,
        createdAt,
        displayName,
        imgUrl,
        age,
        someAbout,
      };
    });
  } catch (error) {}

  return {
    props: {
      profiles: JSON.parse(JSON.stringify(profiles)),
      profile: JSON.parse(JSON.stringify(pro[0])),
      posts_profile: JSON.parse(JSON.stringify(posts_profile)),
    },
  };
}
