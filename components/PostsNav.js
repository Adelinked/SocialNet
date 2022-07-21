import PostView from "./PostView";
import ProfileCard from "./ProfileCard";
import styles from "../styles/Post.module.css";
import { memo } from "react";

function PostsNav(props) {
  return (
    <>
      {props.postsOnly && (
        <div className={styles.profilePosts}>
          {props.posts.length > 0 ? (
            <p style={{ margin: 0 }}>All Posts made By</p>
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
        <div className={styles.profilePost} key={p._id}>
          {!props.postsOnly && <ProfileCard profile={p} scroll={3 * index} />}
          <PostView post={p} setPosts={props.setPosts} posts={props.posts} />
        </div>
      ))}
    </>
  );
}

export default memo(PostsNav);
