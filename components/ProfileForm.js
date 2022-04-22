import styles from "../styles/Profile.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Box,
  TextField,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAppContext } from "../context";

const ProfileForm = ({ formId, profileForm, forNewProfile = true }) => {
  const contentType = "application/json";
  const router = useRouter();
  const [formValues, setFormValues] = useState(profileForm);
  const [nameFree, setNameFree] = useState(true);
  useEffect(() => {
    formValidate();
  }, [formValues, nameFree]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUp, setFileUp] = useState(false);
  const [uploadedImg, setUploadedImg] = useState();
  const initName = profileForm.displayName;
  const { globalState, setGlobalState } = useAppContext();

  const handleChange = (e) => {
    const target = e.target;

    const value = target.value;
    const name = target.name;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const handleChgName = async (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (value.toLowerCase() !== initName.toLowerCase() && value.length > 5) {
      let name = "";
      try {
        const res = await axios.get(`/api/profiles?diplayName=${value}`);
        name = res.data.data[0].displayName;

        if (name) {
          setNameFree(false);
        }
      } catch (error) {
        setNameFree(true);
      }
    }
  };
  /* The PUT method edits an existing entry in the mongodb database. */
  const updateData = async (formValues) => {
    const id = formValues._id;

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(formValues),
      });

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        //throw new Error(res.status);
        toast.error("Error updating the profile");
      } else {
        toast.success("Profile updated with success!");
        const { data } = await res.json();
        setGlobalState(data);
        setLoading(true);
        router.push("/");
      }
    } catch (error) {}
  };

  /* The POST method adds a new entry in the mongodb database. */
  const insertData = async (formValues) => {
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(formValues),
      });
      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        toast.error("Something went wrong!");
      } else {
        toast.success("Profile added with success");
        setLoading(true);

        const { data } = await res.json();
        setGlobalState(data);
        router.push("/");
      }

      /* */
    } catch (error) {
      if (error.response.data.msg.includes("dup key")) {
        setNameFree(false);
      }
    }
  };
  const formValidate = () => {
    let err = [];
    if (formValues.displayName.length < 5)
      err[0] = "Name should contain at least 5 caracacters";
    if (formValues.displayName.length > 30)
      err[0] = "Name shouldn't contain more than 30 caracacters";
    if (!nameFree) err[0] = "Name already taken!";
    if (Number(formValues.age) < 16) err[1] = "Age should be greater than 16";
    if (Number(formValues.age) > 120) err[1] = "Age maximum is 120 years";
    if (formValues.someAbout.length < 20)
      err[2] = "Should contain more than 20 characters";
    if (formValues.someAbout.length > 200)
      err[2] = "You Shouldn't exceed 200 characters ";
    if (formValues.imgUrl.length == 0) err[3] = "Upload a photo please";

    setErrors(err);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    formValidate();
    if (errors.length === 0) {
      forNewProfile ? insertData(formValues) : updateData(formValues);
    }
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
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    const form = event.currentTarget.form;
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
    setFormValues({ ...formValues, imgUrl: data.secure_url });
    setLoading(false);
    setFileUp(false);
  };
  return (
    <div>
      {formId === "add-profile-form" ? (
        <>
          <h2 className={styles.title}>Profile Infos</h2>
        </>
      ) : (
        <h1 className={styles.title}>Update Profile{profileForm.first_name}</h1>
      )}

      {!loading && (
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "80%" },
          }}
          noValidate
          autoComplete="off"
          id={formId}
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <TextField
            variant="standard"
            id="displayName"
            name="displayName"
            value={formValues.displayName}
            onChange={handleChgName}
            required={formValues.displayName.length == 0}
            label="Displayed Name:"
            helperText={errors[0]}
            error={errors[0] && errors[0].length > 0}
          />
          <TextField
            variant="standard"
            label="Age (years):"
            name="age"
            type="number"
            value={formValues.age}
            onChange={handleChange}
            helperText={errors[1]}
            error={errors[1] && errors[1].length > 0}
          />
          <div className={styles.uploadAvatar}>
            <Avatar
              alt=""
              src={formValues.imgUrl}
              sx={{ width: "200px", height: "200px" }}
            />

            <TextField
              variant="standard"
              name="file"
              type="file"
              onChange={handleFileChg}
              helperText={errors[3]}
              error={errors[3]?.length > 0}
            />
          </div>
          {fileUp && (
            <div className={styles.uploaDiv}>
              <Avatar
                alt=""
                src={uploadedImg}
                sx={{ width: "200px", height: "200px" }}
              />
              <Button
                className={styles.uploadButton}
                id="Upload"
                name="upload"
                disabled={fileUp.length === false}
                size="small"
                variant="contained"
                sx={{ fontWeight: "200", width: "10" }}
                onClick={handleUpload}
              >
                Upload
              </Button>
            </div>
          )}

          <TextField
            multiline
            maxRows={4}
            label="Tell people something about you:"
            name="someAbout"
            type="text"
            value={formValues.someAbout}
            onChange={handleChange}
            helperText={errors[2]}
            error={errors[2] && errors[2].length > 0}
          />
          <Button
            className={styles.button}
            type="submit"
            id="submit"
            name="submit"
            disabled={errors.length > 0}
            size="large"
            variant="contained"
            sx={{ fontWeight: "700" }}
          >
            Save
          </Button>
        </Box>
      )}
      {loading && (
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};
export default ProfileForm;
