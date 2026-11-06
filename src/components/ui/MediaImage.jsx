import { useState } from "react";

export default function MediaImage({ src, alt = "", className = "", ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`media-placeholder media-image-fallback${className ? ` ${className}` : ""}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || undefined}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
