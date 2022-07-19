import styles from "../styles/Reaction.module.css";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import ReactionComp from "./ReactionComp";
import { TIME_REFRESH_COMMENT_REACTIONS } from "../variables";

export default function ComReactions(props) {
  const [loadingCom, setLoadingCom] = useState(false);

  const [countsReact, setCountsReact] = useState([
    { type: "likes", people: [], count: 0 },
    { type: "dislikes", people: [], count: 0 },
    { type: "loves", people: [], count: 0 },
    { type: "laughs", people: [], count: 0 },
    { type: "crys", people: [], count: 0 },
  ]);
  const [userReaction, setUserReaction] = useState("");
  const comId = props.comId;

  let reactions = [];
  useEffect(() => {
    let controller = new AbortController();
    (async () => {
      try {
        const res = await axios.get(
          `/api/posts/comments/reactions?comId=${comId}`,
          { signal: controller.signal }
        );
        if (res.data.data.length > 0) {
          reactions = res.data.data;
        }
        let likes = 0,
          dislikes = 0,
          react1s = 0,
          react2s = 0,
          react3s = 0;
        let people_liked = [];
        let people_disliked = [];
        let people_react1 = [];
        let people_react2 = [];
        let people_react3 = [];

        if (reactions.length > 0) {
          reactions.forEach((r) => {
            const person = r.profile.displayName;
            switch (r.type) {
              case "like":
                likes++;
                people_liked.push(person);
                break;
              case "dislike":
                dislikes++;
                people_disliked.push(person);
                break;
              case "love":
                react1s++;
                people_react1.push(person);
                break;
              case "laugh":
                react2s++;
                people_react2.push(person);
                break;
              case "cry":
                react3s++;
                people_react3.push(person);
                break;
            }
            if (props.userProfile._id === r.profile._id) {
              setUserReaction(r.type);
            }
          });

          setCountsReact(
            [
              { type: "likes", count: likes, people: people_liked },
              { type: "dislikes", count: dislikes, people: people_disliked },
              { type: "loves", count: react1s, people: people_react1 },
              { type: "laughs", count: react2s, people: people_react2 },
              { type: "crys", count: react3s, people: people_react3 },
            ].sort((a, b) => b.count - a.count)
          );
          controller = null;
        }
      } catch (error) {}
    })();
    return () => controller?.abort();
  }, []);

  useEffect(() => {
    let controller = new AbortController();
    const getComReactions = async () => {
      try {
        const res = await axios.get(
          `/api/posts/comments/reactions?comId=${comId}`,
          { signal: controller.signal }
        );
        if (res.data.data.length > 0) {
          reactions = res.data.data;
        }
        let likes = 0,
          dislikes = 0,
          react1s = 0,
          react2s = 0,
          react3s = 0;
        let people_liked = [];
        let people_disliked = [];
        let people_react1 = [];
        let people_react2 = [];
        let people_react3 = [];

        if (reactions.length > 0) {
          reactions.forEach((r) => {
            const person = r.profile.displayName;
            switch (r.type) {
              case "like":
                likes++;
                people_liked.push(person);
                break;
              case "dislike":
                dislikes++;
                people_disliked.push(person);
                break;
              case "love":
                react1s++;
                people_react1.push(person);
                break;
              case "laugh":
                react2s++;
                people_react2.push(person);
                break;
              case "cry":
                react3s++;
                people_react3.push(person);
                break;
            }
            if (props.userProfile._id === r.profile._id) {
              setUserReaction(r.type);
            }
          });

          setCountsReact(
            [
              { type: "likes", count: likes, people: people_liked },
              { type: "dislikes", count: dislikes, people: people_disliked },
              { type: "loves", count: react1s, people: people_react1 },
              { type: "laughs", count: react2s, people: people_react2 },
              { type: "crys", count: react3s, people: people_react3 },
            ].sort((a, b) => b.count - a.count)
          );
          controller = null;
        }
      } catch (error) {}
    };
    const id = setInterval(getComReactions, TIME_REFRESH_COMMENT_REACTIONS);
    return () => {
      controller?.abort();
      clearInterval(id);
    };
  }, [countsReact]);

  const handleClick = useCallback(
    (reaction) => {
      //setLoading(true);
      const newReaction = userReaction === reaction ? undefined : reaction;
      const userName = props.userProfile.displayName;
      const newCounts = [...countsReact]
        .map((r) => {
          const oldType = userReaction + "s";
          const newType = newReaction + "s";
          const count = r.count;
          const type = r.type;
          const people = r.people;
          if (type === oldType) {
            const index = people.indexOf(userName);
            const newPeople =
              index == -1
                ? [...people]
                : [
                    ...people.slice(0, index),
                    people.slice(index + 1, people.length),
                  ];
            return {
              ...r,
              count: count == 0 ? 0 : count - 1,
              people: newPeople,
            };
          } else if (type === newType) {
            const newPeople = [...people, userName];
            return { ...r, count: count + 1, people: newPeople };
          } else return { ...r };
        })
        .sort((a, b) => b.count - a.count);
      setCountsReact(newCounts);

      handleReactClick(reaction);

      setUserReaction(newReaction);
    },
    [countsReact]
  );

  const handleReactClick = async (value) => {
    try {
      const reaction = await axios.post(`/api/posts/comments/reactions`, {
        comment: comId,
        type: value,
      });
    } catch (error) {
      if (error?.response?.status == 401) {
        toast.error("Only logged profiles can react to comments");
      }
    }
  };
  return (
    <div className={styles.container}>
      {!loadingCom && (
        <>
          {countsReact.map((r, index) => (
            <ReactionComp
              key={comId + r.type}
              count={r.count}
              type={r.type}
              people={r.people}
              userReaction={userReaction}
              handleClick={handleClick}
              passKey={comId + r.type}
            />
          ))}
        </>
      )}
      {loadingCom && (
        <>
          <CircularProgress
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </>
      )}
    </div>
  );
}
