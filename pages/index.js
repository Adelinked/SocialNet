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
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import throttle from "lodash.throttle";

import {
  TIME_PROFILES_UPDATE,
  POSTS_LIMIT,
  TIME_REFRESH_POSTS,
  GUEST_USER,
} from "../variables";

export default function Home({ profiles, posts_profile, profile }) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState(posts_profile);
  const [profilesCli, setProfilesCli] = useState(profiles);

  const loading = status === "loading";
  const [skip, setSkip] = useState(0);
  const [bottomLoad, setBottomLoad] = useState(false);
  const [msg, setMsg] = useState("");

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      setSkip(posts.length);
    }
  };

  const throttleScrollHandler = useMemo(
    () => throttle(handleScroll, 300),
    [posts]
  );

  useEffect(() => {
    document.addEventListener("scroll", throttleScrollHandler);
    return function cleanup() {
      document.removeEventListener("scroll", throttleScrollHandler);
      throttleScrollHandler?.cancel();
    };
  });

  useEffect(() => {
    let controller = new AbortController();
    async function refreshPosts() {
      try {
        const res = await axios.get(`/api/posts?skip=0&limit=${posts.length}`, {
          signal: controller.signal,
        });
        const { data } = res;
        setPosts(data.data);
        console.log("posts refreshed");
        controller = null;
      } catch (error) {}
    }
    const id = setInterval(refreshPosts, TIME_REFRESH_POSTS);
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, [posts]);

  useEffect(() => {
    let controller = new AbortController();
    const refreshProfiles = async () => {
      try {
        const res = await axios.get(`/api/profiles`, {
          signal: controller.signal,
        });
        const { data } = res;
        setProfilesCli(data.data);
        controller = null;
      } catch (error) {}
    };
    const id = setInterval(refreshProfiles, TIME_PROFILES_UPDATE); // refresh profiles
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, [profilesCli]);

  useEffect(() => {
    let controller = new AbortController();
    let timeOutId;
    if (skip > 0) {
      (async () => {
        try {
          setBottomLoad(true);
          const res = await axios.get(
            `/api/posts?skip=${skip}&limit=${POSTS_LIMIT}`,
            { signal: controller.signal }
          );
          const { data } = res;
          setPosts([...posts, ...data.data]);
          controller = null;
          if (data.data.length == 0) {
            setMsg("No more posts to diplay");
            timeOutId = setTimeout(() => {
              setMsg("");
            }, 1500);
          }
          setBottomLoad(false);
        } catch (error) {
          setBottomLoad(false);
        }
      })();
    }
    return () => {
      controller?.abort();
      clearTimeout(timeOutId);
    };
  }, [skip]);

  return (
    <div className="container">
      <Head>
        <title>SocialNet Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <CircularProgress />
          </div>
        ) : (
          (session || !session) && (
            <>
              <div className={styles.profilesAside}>
                <ProfilesNav profiles={profilesCli} />
              </div>

              <div className={styles.postsContainer} id="postsContainer">
                <PostComp setPosts={setPosts} posts={posts} />
                <PostsNav posts={posts} setPosts={setPosts} />
                <div className={styles.bottomLoadDiv}>
                  {bottomLoad && <CircularProgress />}
                </div>
                {msg.length > 0 && (
                  <p style={{ textAlign: "center", fontWeight: "600" }}>
                    {msg}
                  </p>
                )}
              </div>

              <div className={styles.futurAside}></div>
            </>
          )
        )}
        {!session && session && !loading && (
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
    pro = [GUEST_USER],
    posts_profile = [];

  const session = await getSession(context);
  /*if (!session) {
   return {
      redirect: { destination: "/auth/signin" },
    };
  }*/

  await dbConnect();
  if (session) pro = await Profile.find({ user: session.user.userId });

  /* if (pro && pro[0].createdAt === pro[0].updatedAt) {
    return {
      redirect: { destination: "/auth/new-user" },
    };
  }*/
  if (session && (!pro || pro.length <= 0)) {
    return {
      redirect: { destination: "/auth/new-user" },
    };
  }
  //console.log(pro);

  //console.log(session);

  try {
    profiles = await Profile.find({ user: { $ne: session?.user.userId } }).sort(
      {
        updatedAt: -1,
      }
    );
  } catch (error) {}

  try {
    const result = await Post.find({}, undefined, {
      limit: Number(POSTS_LIMIT),
    })
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
