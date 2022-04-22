import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../context";
import { toast } from "react-toastify";
import { displayDate } from "../lib/displayDate";
import AlertDialog from "./AlertDialog";

import {
  Box,
  TextField,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import styles from "../styles/Comments.module.css";

const FormComment = ({
  formId,
  forNewComment = true,
  commentForm,
  id,
  post,
  setLoadingComPage,
}) => {
  const contentType = "application/json";
  const router = useRouter();

  const { globalState } = useAppContext();
  const profile = globalState;
  const [domId, setDomId] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [edited, setEdited] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [open, setOpen] = useState(false);

  const [formValues, setFormValues] = useState(commentForm);
  useEffect(() => {
    formValidate();
  }, [formValues]);

  useEffect(() => {
    if (domId) {
      document.addEventListener("click", handleClickOut);
      return function cleanup() {
        document.removeEventListener("click", handleClickOut);
      };
    }
  });
  const handleClickOut = (e) => {
    if (domId !== e.target.id && e.target.id != "submit") {
      handleCancelClick();
    }
  };

  const handleChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    setDomId(target.id);
    setEdited(true);
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const removeData = async () => {
    setLoadingComPage(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/comments/${id}`, {
        method: "DELETE",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
      });

      if (!res.ok) {
        throw new Error(res.status);
      } else {
        const { data } = await res.json();
        setFormValues(data);
        toast.success("Comment deleted!");

        setClicked(false);
        setEdited(false);
        setLoading(false);
      }
    } catch (error) {}
  };

  /* The PUT method edits an existing entry in the mongodb database. */
  const updateData = async (formValues) => {
    try {
      const res = await fetch(`/api/posts/comments/${id}`, {
        method: "PUT",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(formValues),
      });
      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status);
      }
      const { data } = await res.json();
      const updatedAt = "Edited " + displayDate(data.updatedAt);
      setFormValues({ ...data, updatedAt: updatedAt });
    } catch (error) {}
  };

  /* The POST method adds a new entry in the mongodb database. */
  const insertData = async (formValues) => {
    try {
      const res = await fetch("/api/posts/comments", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify({ ...formValues, post: post }),
      });
      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status);
      }
    } catch (error) {}
  };
  const formValidate = () => {
    let err = [];
    if (formValues.text.length <= 0) err[0] = "Comment empty!";
    if (formValues.text.length > 100)
      err[0] = "Comment shouldn't exceed 100 caracacters";
    setErrors(err);
  };
  const handleSubmit = (e) => {
    setLoadingComPage(true);
    setLoading(true);
    e.preventDefault();
    formValidate();
    if (errors.length === 0) {
      forNewComment ? insertData(formValues) : updateData(formValues);
      forNewComment
        ? toast.success("Comment added!")
        : toast.success("Comment updated!");

      setClicked(false);
      setEdited(false);
      setLoading(false);
    } else {
      errors.map((e) => toast.error(e));
    }
  };
  const handleCancelClick = () => {
    setFormValues(commentForm);
    setClicked(false);
    setEdited(false);
  };
  const handleFocus = (e) => {
    setClicked(true);
    setDomId(e.target.id);
  };
  return (
    <>
      <AlertDialog
        open={open}
        setOpen={setOpen}
        removeData={removeData}
        title="Remove comment"
        msg="Are you sure you want to delete this comment?"
      />

      {!loading && (
        <>
          <form
            id={formId}
            className={(forNewComment || clicked) && styles.commentForm}
            onSubmit={handleSubmit}
            style={{ width: "100%" }}
          >
            <TextField
              className={(forNewComment || clicked) && styles.commentEdit}
              multiline
              maxRows={10}
              rows={2}
              label={
                !formValues.text.value && forNewComment
                  ? `Want to comment this post, ${profile.displayName}?`
                  : formValues.updatedAt + (clicked ? "" : " (click to edit)")
              }
              name="text"
              type="text"
              value={formValues.text ?? ""}
              onChange={handleChange}
              onFocus={handleFocus}
              helperText={
                forNewComment
                  ? errors[0] !== "Comment empty!"
                    ? errors[0]
                    : ""
                  : errors[0]
              }
              error={
                forNewComment
                  ? errors[0] !== "Comment empty!"
                    ? errors[0]
                    : ""
                  : errors[0]
              }
              sx={{ width: "100%", margin: 0 }}
              variant="filled"
            />
            <div>
              {errors.length <= 0 && (forNewComment || edited) && (
                <Button
                  className={styles.button}
                  type="submit"
                  id="submit"
                  name="post"
                  disabled={errors.length > 0}
                  size="large"
                  variant="contained"
                  sx={{ fontWeight: "500", height: "20px" }}
                >
                  {forNewComment ? "Post" : "Edit"}
                </Button>
              )}
              {edited && (
                <Button
                  onClick={handleCancelClick}
                  className={styles.button}
                  id="cancel"
                  name="cancel"
                  size="large"
                  variant="contained"
                  sx={{ fontWeight: "500", height: "20px", marginLeft: "5px" }}
                >
                  Cancel
                </Button>
              )}
              {!forNewComment && clicked && (
                <>
                  <Button
                    onClick={() => {
                      setOpen(true);
                    }}
                    className={styles.button}
                    id="remove"
                    name="remove"
                    size="large"
                    variant="contained"
                    sx={{
                      fontWeight: "500",
                      height: "20px",
                      width: " 80px",
                      backgroundColor: "rgb(238, 18, 11)",
                      marginLeft: "5px",
                      "&:hover": {
                        backgroundColor: "rgb(238, 18, 11)",
                      },
                    }}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </form>
        </>
      )}
      {loading && <div>...loading</div>}
    </>
  );
};
export default FormComment;
