import styles from "../styles/Reaction.module.css";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { CircularProgress } from "@mui/material";
import ReactionComp from "./ReactionComp";
import "font-awesome/css/font-awesome.min.css";

export default function ReactionsPost(props) {
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState([
    { type: "likes", count: 0, people: [] },
    { type: "dislikes", count: 0, people: [] },
    { type: "loves", count: 0, people: [] },
    { type: "laughs", count: 0, people: [] },
    { type: "crys", count: 0, people: [] },
  ]);
  const [userReaction, setUserReaction] = useState("");
  const postId = props.post._id;
  let reactions = [];
  useEffect(() => {
    const id = setInterval(getReactions, 15000);
    return () => clearInterval(id);
  }, []);

  const getReactions = async () => {
    try {
      const res = await axios.get(`/api/posts/reactions?postId=${postId}`);

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

        setCounts(
          [
            { type: "likes", count: likes, people: people_liked },
            { type: "dislikes", count: dislikes, people: people_disliked },
            { type: "loves", count: react1s, people: people_react1 },
            { type: "laughs", count: react2s, people: people_react2 },
            { type: "crys", count: react3s, people: people_react3 },
          ].sort((a, b) => b.count - a.count)
        );
      }
    } catch (error) {}
  };

  const handleClick = useCallback(
    (reaction) => {
      //setLoading(true);
      const newReaction = userReaction === reaction ? undefined : reaction;
      const userName = props.userProfile.displayName;
      const newCounts = [...counts]
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
      setCounts(newCounts);
      setUserReaction(newReaction);
      handleReactClick(reaction);
    },
    [counts]
  );

  const handleReactClick = async (value) => {
    try {
      const reaction = await axios.post(`/api/posts/reactions`, {
        post: postId,
        type: value,
      });
      setLoading(false);
    } catch (error) {}
  };
  return (
    <div className={styles.container}>
      {!loading && (
        <>
          {counts.map((r, index) => (
            <ReactionComp
              key={postId + index}
              count={r.count}
              type={r.type}
              people={r.people}
              userReaction={userReaction}
              handleClick={handleClick}
            />
          ))}
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
    </div>
  );
}
