import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/Home.module.css";
import { useSession, getSession } from "next-auth/react";
import dbConnect from "../../lib/dbConnect";
import Profile from "../../models/profile";
import Post from "../../models/Post";
import ProfilesNav from "../../components/ProfilesNav";
import PostsNav from "../../components/PostsNav";
import { CircularProgress } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import throttle from "lodash.throttle";

import {
  TIME_PROFILES_UPDATE,
  POSTS_LIMIT,
  TIME_REFRESH_POSTS,
} from "../../variables";

export default function UserPosts({ profiles, profile_posts, selectedProf }) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState(profile_posts);
  const [profilesCli, setProfilesCli] = useState(profiles);
  const [selectedProfCli, setSelectedProfCli] = useState(selectedProf);
  const loading = status === "loading";
  const [skip, setSkip] = useState(0);
  const [bottomLoad, setBottomLoad] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setPosts(profile_posts);
    setSelectedProfCli(selectedProf);
    setSkip(0);
  }, [selectedProf]);

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
        const res = await axios.get(
          `/api/posts?skip=0&limit=${posts.length}&name=${selectedProf.displayName}`,
          {
            signal: controller.signal,
          }
        );
        const { data } = res;
        setPosts(data.data);
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
    const refreshProfiles = async () => {
      try {
        const res = await axios.get(`/api/profiles/${selectedProf._id}`, {
          signal: controller.signal,
        });
        const { data } = res;
        setSelectedProfCli(data.data);
        controller = null;
      } catch (error) {}
    };
    const id = setInterval(refreshProfiles, TIME_PROFILES_UPDATE); // refresh profiles
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, [selectedProfCli]);

  useEffect(() => {
    let controller = new AbortController();
    let timeOutId;
    if (skip > 0) {
      (async () => {
        try {
          setBottomLoad(true);
          const res = await axios.get(
            `/api/posts?skip=${skip}&limit=${POSTS_LIMIT}&name=${selectedProf.displayName}`,
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
    <div className="container" style={{ backgroundColor: "var(--color-bgd2)" }}>
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
        {(session || !session) && (
          <>
            <div className={styles.profilesAside}>
              <ProfilesNav profiles={profilesCli} />
            </div>

            <div className={styles.postsContainer} id="postsContainer">
              <PostsNav
                posts={posts}
                selectedProf={selectedProfCli}
                setPosts={setPosts}
                postsOnly={true}
              />
              {bottomLoad && <CircularProgress style={{ margin: "0 50%" }} />}
              {msg.length > 0 && (
                <p style={{ textAlign: "center", fontWeight: "600" }}>{msg}</p>
              )}
            </div>
            <div className={styles.futurAside}></div>
          </>
        )}
        {!session && session && (
          <>
            <p className={styles.title}>Please Sign in</p>
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
  let profiles,
    pro = [{ displayName: "Guest", img: "/default-profile.png.png" }],
    selectedProf = [],
    profile_posts = [];
  const name = context.query.name;

  const session = await getSession(context);
  /*if (!session) {
    return {
      redirect: { destination: "/auth/signin" },
    };
  }*/

  await dbConnect();

  if (session) {
    try {
      pro = await Profile.find({ user: session.user.userId });
    } catch (error) {}
    if (!pro || pro.length == 0) {
      return {
        redirect: { destination: "/auth/new-user" },
      };
    }
  }

  try {
    profiles = await Profile.find({ user: { $ne: session?.user.userId } }).sort(
      {
        displayName: -1,
      }
    );
  } catch (error) {}

  selectedProf = await Profile.find({ displayName: String(name) });
  if (!selectedProf || selectedProf.length <= 0)
    return {
      redirect: { destination: "/" },
    };

  const posts = await Post.find(
    {
      profile: selectedProf[0]._id,
    },
    undefined,
    {
      limit: POSTS_LIMIT,
    }
  ).sort({ updatedAt: -1 });
  return {
    props: {
      profiles: JSON.parse(JSON.stringify(profiles)),
      profile: JSON.parse(JSON.stringify(pro[0])),
      profile_posts: JSON.parse(JSON.stringify(posts)),
      selectedProf: JSON.parse(JSON.stringify(selectedProf[0])),
    },
  };
}
