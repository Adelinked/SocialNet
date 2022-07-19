import { TextField, Avatar } from "@mui/material";
import styles from "../styles/Post.module.css";
import { useAppContext } from "../context";
import { useState } from "react";
import PostForm from "./Forms/PostForm";
import ReactionsPost from "../components/ReactionsPost";
import CommentsPost from "../components/CommentsPost";

import axios from "axios";
import { displayDate } from "../lib/displayDate";

export default function PostView(props) {
  const post = props.post;

  const { globalState } = useAppContext();
  const profileGlobal = globalState;
  const displayName = props.post.displayName;

  const [isYours, setIsYours] = useState(
    profileGlobal.displayName === displayName
  );

  const prefix = post.updatedAt === post.createdAt ? "Posted " : "Edited ";
  const dateLabel = prefix + displayDate(post.updatedAt);

  return (
    <div className={styles.postView}>
      {!isYours ? (
        <>
          <TextField
            label={dateLabel}
            multiline
            value={post.text}
            InputProps={{
              readOnly: true,
            }}
            sx={{ width: "100%" }}
            variant="filled"
          />
          {post.postImg && (
            <div className={styles.imgDiv}>
              <img alt="" src={post.postImg} className={styles.image}></img>
            </div>
          )}
        </>
      ) : (
        <PostForm
          formId="edit-post-form"
          postForm={{
            text: post.text ?? "",
            postImg: post.postImg ?? "",
            updatedAt: dateLabel,
            id: props.post._id,
          }}
          forNewPost={false}
          relaodHomePage={props.relaodHomePage}
          setPosts={props.setPosts}
          posts={props.posts}
        />
      )}

      <div className={styles.reactComments}>
        <ReactionsPost post={post} userProfile={profileGlobal} />
        <CommentsPost post={post} userProfile={profileGlobal} />
      </div>
    </div>
  );
}
