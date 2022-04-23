import ProfileCard from "../components/ProfileCard";

export default function ProfileNav(props) {
  const profiles = props.profiles;
  return (
    <>
      {profiles.map((p, index) => (
        <ProfileCard key={p._id} profile={p} scroll={index} onStatus={true} />
      ))}
    </>
  );
}
