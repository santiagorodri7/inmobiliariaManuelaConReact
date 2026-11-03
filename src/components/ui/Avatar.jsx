import { userInitials } from "../../utils/users.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function Avatar({ profile, src = "", size = "md" }) {
  const { t } = useI18n();
  const image = src || profile?.avatar || "";
  const name = profile?.nombre || profile?.email || t("common.user");
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
