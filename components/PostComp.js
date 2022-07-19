import PostForm from "./Forms/PostForm";
import { useSession } from "next-auth/react";
import styles from "../styles/Post.module.css";

export default function PostComp(props) {
  const { data: session, status } = useSession();

  const postForm = {
    text: "",
    postImg: "",
  };
  return (
    <div className={styles.postContainer}>
      <PostForm
        formId="new-post-form"
        postForm={postForm}
        relaodHomePage={props.relaodHomePage}
        setPosts={props.setPosts}
        posts={props.posts}
      />
    </div>
  );
}
