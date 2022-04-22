import Head from "next/head";
import Header from "../../components/Header";
import styles from "../../styles/Home.module.css";
import { useSession, getSession } from "next-auth/react";
import dbConnect from "../../lib/dbConnect";
import Profile from "../../models/profile";
import Post from "../../models/Post";
import ProfilesNav from "../../components/ProfilesNav";
import PostsNav from "../../components/PostsNav";
import { CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const postsLimit = 5;

export default function UserPosts({ profiles, profile_posts, selectedProf }) {
  const { data: session, status } = useSession();

  const [posts, setPosts] = useState(profile_posts);
  const [profilesCli, setProfilesCli] = useState(profiles);
  const [selectedProfCli, setSelectedProfCli] = useState(selectedProf);
  const loading = status === "loading";
  const [skip, setSkip] = useState(0);
  const [bottomLoad, setBottomLoad] = useState(false);
  const [msg, setMsg] = useState("");
  const relaodHomePage = () => {
    refreshPosts();
    refreshProfiles();
    refreshSelecProfile();
  };

  useEffect(() => {
    setPosts(profile_posts);
    setSkip(0);
  }, [selectedProf.displayName]);

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    return function cleanup() {
      document.removeEventListener("scroll", handleScroll);
    };
  });
  useEffect(() => {
    const id = setInterval(relaodHomePage, 15000);
    return () => clearInterval(id);
  }, [posts]);

  async function refreshPosts() {
    try {
      const res = await axios.get(
        `/api/posts?skip=0&limit=${posts.length}&name=${selectedProf.displayName}`
      );
      const { data } = res;
      setPosts(data.data);
    } catch (error) {}
  }
  async function refreshProfiles() {
    try {
      const res = await axios.get(`/api/profiles`);
      const { data } = res;
      setProfilesCli(data.data);
    } catch (error) {}
  }

  async function refreshSelecProfile() {
    try {
      const res = await axios.get(`/api/profiles/${selectedProf._id}`);
      const { data } = res;
      setSelectedProfCli(data.data);
    } catch (error) {}
  }

  useEffect(() => {
    async function getPosts() {
      try {
        setBottomLoad(true);
        const res = await axios.get(
          `/api/posts?skip=${skip}&limit=${postsLimit}&name=${selectedProf.displayName}`
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
    if (skip >= postsLimit) {
      getPosts();
    }
  }, [skip]);
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target.documentElement;
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
        {!session && (
          <>
            <p className={styles.title}>Please Sign in</p>
          </>
        )}
      </main>
      <footer className="footer"></footer>
    </div>
  );
}

export async function getServerSideProps(context) {
  let profiles,
    pro,
    selectedProf = [],
    profile_posts = [];
  const name = context.query.name;

  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: "/auth/signin" },
    };
  }

  dbConnect();

  try {
    pro = await Profile.find({ user: session.user.userId });
  } catch (error) {}
  if (!pro || pro.length == 0) {
    return {
      redirect: { destination: "/auth/new-user" },
    };
  }

  try {
    profiles = await Profile.find({ user: { $ne: session.user.userId } }).sort({
      displayName: -1,
    });
  } catch (error) {}

  selectedProf = await Profile.find({ displayName: name });
  const idSelected = String(selectedProf[0]._id);

  const posts = await Post.find(
    {
      profile: selectedProf[0]._id,
    },
    undefined,
    {
      limit: postsLimit,
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
