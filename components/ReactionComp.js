import styles from "../styles/Reaction.module.css";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faGrinHearts,
  faFaceLaugh,
  faFaceSadCry,
} from "@fortawesome/free-solid-svg-icons";

export default function ReactionComp(props) {
  const count = props.count;
  const type = props.type;
  const userReaction = props.userReaction + "s";
  const people = props.people;

  const [mouseOver, setMouseOver] = useState(false);

  const handleMouseOver = (e) => {
    setMouseOver(true);
  };
  const handleMouseLeave = (e) => {
    setTimeout(() => setMouseOver(false), 100);
  };
  return (
    <div className={styles.reaction}>
      <FontAwesomeIcon
        className={styles.reactIcon}
        title={type.slice(0, -1)}
        icon={typeIcon(type)}
        style={{
          fontSize: 20,
          color:
            count === 0
              ? "silver"
              : userReaction !== type
              ? "#1565C0"
              : "rgb(238, 18, 11)",
          margin: "2px 3px",
        }}
        onClick={() => {
          props.handleClick(type.slice(0, -1));
        }}
      />
      {count > 0 && (
        <span
          className={styles.reactionCount}
          onMouseLeave={handleMouseLeave}
          onMouseOver={handleMouseOver}
        >
          +{count}
        </span>
      )}
      {mouseOver && (
        <div className={styles.peopleReacted}>
          {people && people.length > 0 && (
            <>
              {people.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const typeIcon = (type) => {
  switch (type) {
    case "likes":
      return faThumbsUp;
    case "dislikes":
      return faThumbsDown;
    case "loves":
      return faGrinHearts;
    case "laughs":
      return faFaceLaugh;
    case "crys":
      return faFaceSadCry;
    default:
      return faGrinHearts;
  }
};
