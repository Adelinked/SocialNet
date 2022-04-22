import { TextField, Avatar } from "@mui/material";
import styles from "../styles/Post.module.css";
import { useAppContext } from "../context";
import { useState } from "react";
import FormPost from "../components/FormPost";
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

  const handleReactClick = (value) => {
    const postId = props.post._id;
    try {
      const reaction = axios.post(`/api/posts/reactions`, {
        post: postId,
        type: value,
      });
    } catch (error) {
      console.log(error.data.msg);
    }
  };

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
            <img
              alt=""
              src={post.postImg}
              style={{ width: "100%", objectFit: "fill" }}
            ></img>
          )}
        </>
      ) : (
        <FormPost
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
