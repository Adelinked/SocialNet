import { FaGithubSquare, FaEnvelope } from "react-icons/fa";
export default function Footer() {
  return (
    <p
      className="footerCompParag"
      style={{ fontWeight: "600", textAlign: "center" }}
    >
      Designed and coded by Adelinked{" "}
      <a
        style={{ fontSize: "22px", margin: "0 5px" }}
        href="https://github.com/Adelinked"
        title="Git hub"
        target="_blank"
      >
        <FaGithubSquare />
      </a>
      <a
        style={{ fontSize: "22px", marginRight: "5px" }}
        href="mailto:adel.adelinked@gmail.com"
        title="Send an email"
        target="_blank"
      >
        <FaEnvelope />
      </a>
    </p>
  );
}
