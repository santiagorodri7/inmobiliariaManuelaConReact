import { useEffect } from "react";
import { siteMeta } from "../config/site.js";

const setMeta = (selector, attribute, content) => {
  if (!content) return;
  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement("meta");
    const [attributeName, attributeValue] = selector
      .replace(/^meta\[|\]$/g, "")
      .split("=");
    meta.setAttribute(attributeName, attributeValue.replace(/["']/g, ""));
    document.head.appendChild(meta);
  }
  meta.setAttribute(attribute, content);
};

const absoluteAssetUrl = (value) => {
  if (!value) return "";
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
};

export const usePageTitle = (title, description = "", image = "") => {
  useEffect(() => {
    const pageTitle = title ? `${title} | Manuela Bermúdez` : siteMeta.title;
    const pageDescription = description || siteMeta.description;
    const pageImage = absoluteAssetUrl(image || siteMeta.image);
    document.title = pageTitle;

    setMeta('meta[name="description"]', "content", pageDescription);
    setMeta('meta[property="og:title"]', "content", pageTitle);
    setMeta('meta[property="og:description"]', "content", pageDescription);
    setMeta('meta[property="og:image"]', "content", pageImage);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", pageTitle);
    setMeta('meta[name="twitter:description"]', "content", pageDescription);
    setMeta('meta[name="twitter:image"]', "content", pageImage);
  }, [title, description, image]);
};
