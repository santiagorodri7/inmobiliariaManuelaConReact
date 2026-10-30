import { userInitials } from "../../utils/users.js";

export default function Avatar({ profile, src = "", size = "md" }) {
  const image = src || profile?.avatar || "";
  const name = profile?.nombre || profile?.email || "Usuario";
  return (
    <span className={`avatar avatar--${size}`} aria-label={name}>
      {image ? (
        <img src={image} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">{userInitials(profile)}</span>
      )}
    </span>
  );
}
