import PostView from "./PostView";
import ProfileCard from "./ProfileCard";
import styles from "../styles/Post.module.css";

export default function PostsNav(props) {
  return (
    <>
      {props.postsOnly && (
        <div className={styles.profilePosts}>
          {props.posts.length > 0 ? (
            <p style={{ margin: 0 }}>Posed By</p>
          ) : (
            <p style={{ margin: 0 }}>Nothing posted by:</p>
          )}
          <ProfileCard
            profile={props.selectedProf}
            scroll={0}
            onStatus={true}
          />
        </div>
      )}
      {}
      {props.posts.map((p, index) => (
        <div className={styles.profilePost} key={String(p._id)}>
          {!props.postsOnly && (
            <ProfileCard
              key={"Pro" + String(p._id)}
              profile={p}
              scroll={3 * index}
            />
          )}
          <PostView
            key={"Post" + String(p._id)}
            post={p}
            setPosts={props.setPosts}
            posts={props.posts}
          />
        </div>
      ))}
    </>
  );
}
