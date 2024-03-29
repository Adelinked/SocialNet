import styles from "../styles/Comments.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

import { CircularProgress, TextField } from "@mui/material";
import ProfileCard from "./ProfileCard";
import CommentForm from "../components/Forms/CommentForm";
import ComReactions from "../components/ComReactions";
import { displayDate } from "../lib/displayDate";
import { useAppContext } from "../context";
import { TIME_REFRESH_COMMENTS } from "../variables";

export default function CommentsPost(props) {
  const { globalState } = useAppContext();
  const profileGlobal = globalState;

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);
  const postId = props.post._id;

  let comments = [];

  useEffect(() => {
    let controller = new AbortController();
    const getComments = async () => {
      try {
        const res = await axios.get(`/api/posts/comments?postId=${postId}`, {
          signal: controller.signal,
        });
        const isYours = false;
        if (res.data.data.length > 0) {
          comments = res.data.data;
        }
        if (comments.length > 0) {
          comments = comments.map((r, index) => {
            isYours = false;
            if (props.userProfile._id === r.profile._id) {
              isYours = true;
            }
            return { ...r, isYours: isYours };
          });
        }
        setData(comments);
        controller = null;

        setLoading(false);
      } catch (error) {}
    };
    getComments();
    return () => {
      controller?.abort();
    };
  }, [show]);

  useEffect(() => {
    let controller = new AbortController();
    const getComments = async () => {
      try {
        const res = await axios.get(`/api/posts/comments?postId=${postId}`, {
          signal: controller.signal,
        });
        const isYours = false;
        if (res.data.data.length > 0) {
          comments = res.data.data;
        }
        if (comments.length > 0) {
          comments = comments.map((r, index) => {
            isYours = false;
            if (props.userProfile._id === r.profile._id) {
              isYours = true;
            }
            return { ...r, isYours: isYours };
          });
        }
        setData(comments);
        controller = null;

        setLoading(false);
      } catch (error) {}
    };
    const id = setInterval(getComments, TIME_REFRESH_COMMENTS);
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, [data]);

  const handleShow = () => {
    //setLoading(true);
    setShow(!show);
    // getComments();
  };

  return (
    <>
      {!loading && (
        <>
          <span className={styles.show} onClick={handleShow}>
            {!show ? data.length + " comments" : "Close"}
          </span>
          {show && (
            <div className={styles.commentsDiv}>
              <span className={styles.closeBtn}>
                <span
                  className={styles.closeLetter}
                  onClick={() => {
                    setShow(false);
                  }}
                  title="close"
                >
                  X
                </span>
              </span>
              <CommentForm
                formId="new-comment-form"
                commentForm={{
                  text: "",
                }}
                post={postId}
                setLoadingComPage={setLoading}
                oldData={data}
                setData={setData}
              />
              <div>
                {data.length > 0 ? (
                  data.map((c, index) => (
                    <div key={c._id}>
                      <div className={styles.profileCom}>
                        <ProfileCard profile={c.profile} avatarOnly={true} />
                        {c.isYours ? (
                          <CommentForm
                            formId="edit-comment-form"
                            commentForm={{
                              text: c.text ?? "",
                              updatedAt:
                                (c.updatedAt === c.createdAt
                                  ? "Posted "
                                  : "Edited ") + displayDate(c.updatedAt),
                            }}
                            id={c._id}
                            forNewComment={false}
                            setLoadingComPage={setLoading}
                            oldData={data}
                            setData={setData}
                          />
                        ) : (
                          <TextField
                            key={index}
                            label={
                              (c.updatedAt === c.createdAt
                                ? "Posted "
                                : "Edited ") + displayDate(c.updatedAt)
                            }
                            multiline
                            value={c.text}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{ width: "100%" }}
                            variant="filled"
                          />
                        )}
                      </div>
                      <div className={styles.ComReactions}>
                        <ComReactions
                          comId={c._id}
                          userProfile={profileGlobal}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <p style={{ paddingLeft: "5px" }}>No comments to display</p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {loading && (
        <>
          <CircularProgress
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </>
      )}
    </>
  );
}
