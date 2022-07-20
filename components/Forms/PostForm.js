import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context";
import { toast } from "react-toastify";
import { displayDate } from "../../lib/displayDate";
import React from "react";

import AlertDialog from "../AlertDialog";

import { TextField, Button, CircularProgress } from "@mui/material";
import styles from "../../styles/Post.module.css";

import "font-awesome/css/font-awesome.min.css";

const PostForm = ({ formId, forNewPost = true, postForm, setPosts, posts }) => {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const contentType = "application/json";

  const { globalState } = useAppContext();
  const profile = globalState;
  const [domId, setDomId] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [edited, setEdited] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [formValues, setFormValues] = useState(postForm);
  const [fileUp, setFileUp] = useState(false);
  const [uploadedImg, setUploadedImg] = useState();
  const hiddenFileInput = useRef(null);
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
    if (
      domId !== e.target.id &&
      e.target.id != "submit" &&
      e.target.id != "upload" &&
      e.target.id != "uploadIcon"
    ) {
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
  const id = formValues.id;

  const handleRemoveClick = async (e) => {
    handleClickOpen();
  };

  const removeData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
      });

      if (!res.ok) {
        //throw new Error(res.status);
        toast.error("Unable to delete the post!");
      } else {
        const { data } = await res.json();
        toast.success("Post deleted!");
        setPosts(posts.filter((p) => p._id != id));

        handleClose();
        //relaodHomePage();
      }
    } catch (error) {}
  };

  /* The PUT method edits an existing entry in the mongodb database. */
  const updateData = async (formValues) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(formValues),
      });
      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        toast.error("Unable to edit the post!");
      }
      const { data } = await res.json();

      const updatedAt = "Edited " + displayDate(data.updatedAt);
      setFormValues({ ...formValues, updatedAt: updatedAt });
      const { displayName, imgUrl, age, someAbout } = profile;
      const updatedPost = {
        ...data,
        displayName: displayName,
        imgUrl: imgUrl,
        age: age,
        someAbout: someAbout,
      };
      // console.log(posts.map((p) => (data._id === p._id ? data : p)));
      setPosts(posts.map((p) => (updatedPost._id === p._id ? updatedPost : p)));
      toast.success("Post edited!");
    } catch (error) {}
  };

  /* The POST method adds a new entry in the mongodb database. */
  const insertData = async (formValues) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(formValues),
      });
      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        //throw new Error(res.status);
        if (res.status == 401) {
          toast.error("Only authenticated users can add posts!");
        } else {
          toast.error("Unable to add the post!");
        }
      } else {
        const { data } = await res.json();

        const { displayName, imgUrl, age, someAbout } = profile;
        const newPost = {
          ...data,
          displayName: displayName,
          imgUrl: imgUrl,
          age: age,
          someAbout: someAbout,
        };
        toast.success("Post added!");
        setPosts([newPost, ...posts]);
      }
    } catch (error) {}
  };
  const formValidate = () => {
    let err = [];
    if (!formValues.postImg && !formValues.text) err[0] = "Post empty!";
    if (formValues.text.length > 300)
      err[0] = "Post shouldn't exceed 300 caracacters";
    setErrors(err);
  };
  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    formValidate();
    if (errors.length === 0) {
      forNewPost ? insertData(formValues) : updateData(formValues);
      if (forNewPost) {
        setFormValues(postForm);
      }

      setClicked(false);
      setEdited(false);
      setLoading(false);
      setFileUp(false);
    } else {
      errors.map((e) => toast.error(e));
    }
  };
  const handleCancelClick = () => {
    setFormValues(postForm);
    setClicked(false);
    setEdited(false);
    setUploadedImg(undefined);
    setFileUp(false);
  };
  const handleFocus = (e) => {
    setClicked(true);
    setDomId(e.target.id);
  };

  const handleFileChg = (changeEvent) => {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setUploadedImg(onLoadEvent.target.result);
    };
    reader.readAsDataURL(changeEvent.target.files[0]);
    if (changeEvent.target.files[0]) {
      setFileUp(true);
    }
    handleUpload(changeEvent);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    const form = event.target.form;
    const fileInput = Array.from(form.elements).find(
      ({ name }) => name === "file"
    );

    const formData = new FormData();

    for (const file of fileInput.files) {
      formData.append("file", file);
      setLoading(true);
    }
    formData.append("upload_preset", "SocialNet-uploads");

    const data = await fetch(
      "https://api.cloudinary.com/v1_1/ddxyi8ira/image/upload",
      {
        method: "POST",
        body: formData,
      }
    ).then((r) => r.json());
    setFormValues({ ...formValues, postImg: data.secure_url });

    setEdited(true);

    setLoading(false);
  };

  const clickFileOpen = (e) => {
    hiddenFileInput.current.click();
  };
  return (
    <>
      <AlertDialog
        open={open}
        setOpen={setOpen}
        removeData={removeData}
        title="Remove Post"
        msg="Are you sure you want to delete this post?"
      />
      {!loading && (
        <div className={styles.postFormCont}>
          <form
            id={formId}
            className={forNewPost || clicked ? styles.postForm : undefined}
            onSubmit={handleSubmit}
          >
            <div
              className={
                forNewPost
                  ? styles.postFormAdd
                  : clicked
                  ? styles.postFormAdd
                  : styles.postFormEdit
              }
            >
              <TextField
                className={forNewPost || clicked ? styles.postEdit : undefined}
                multiline
                label={
                  !formValues.text.value && forNewPost
                    ? `What's in your mind, ${profile.displayName}?`
                    : formValues.updatedAt + (clicked ? "" : " (click to edit)")
                }
                name="text"
                type="text"
                value={formValues.text ?? ""}
                onChange={handleChange}
                onFocus={handleFocus}
                helperText={
                  forNewPost
                    ? errors[0] !== "Post empty!"
                      ? errors[0]
                      : ""
                    : errors[0]
                }
                error={
                  forNewPost
                    ? errors[0] !== "Post empty!"
                      ? errors[0]?.length > 0
                      : false
                    : errors[0]?.length > 0
                }
                sx={{ width: "100%" }}
                variant="filled"
              />

              {(forNewPost || (!forNewPost && clicked)) && (
                <>
                  {!fileUp && (
                    <i
                      id="uploadIcon"
                      className="fa fa-file-image-o"
                      style={{
                        fontSize: 40,
                        color: "#1565C0",
                        margin: "0",
                        marginLeft: "10px",
                      }}
                      onClick={clickFileOpen}
                    ></i>
                  )}
                  <input
                    id="upload"
                    name="file"
                    type="file"
                    ref={hiddenFileInput}
                    style={{ display: "none" }}
                    onChange={handleFileChg}
                  />
                </>
              )}
            </div>
            <div className={styles.buttonsDiv}>
              {errors.length <= 0 && (forNewPost || edited || fileUp) && (
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
                  {forNewPost ? "Post" : "Edit"}
                </Button>
              )}
              {(edited || fileUp) && (
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
              {!forNewPost && clicked && (
                <>
                  <Button
                    onClick={handleRemoveClick}
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
            <div>
              {(fileUp || formValues.postImg) && (
                <div className={styles.imgDiv}>
                  <img
                    alt=""
                    src={formValues.postImg ?? uploadedImg}
                    className={styles.image}
                    onFocus={handleFocus}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      )}
      {loading && (
        <div style={{ marginLeft: "48%" }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};
export default PostForm;
