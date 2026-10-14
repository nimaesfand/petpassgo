import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export const BUCKET = "pet-documents";
const SIGNED_URL_SECONDS = 60 * 60; // 1 hour

// Accepts either a storage path ("<userId>/<petId>/file.jpg") or a legacy
// full public URL (".../storage/v1/object/public/pet-documents/<path>") and
// returns the storage path.
export function toStoragePath(value) {
  if (!value) return null;
  const marker = `/object/public/${BUCKET}/`;
  const signMarker = `/object/sign/${BUCKET}/`;
  for (const m of [marker, signMarker]) {
    const i = value.indexOf(m);
    if (i !== -1) return decodeURIComponent(value.slice(i + m.length).split("?")[0]);
  }
  return value;
}

export async function getSignedUrl(value) {
  const path = toStoragePath(value);
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  return error ? null : data.signedUrl;
}

export function useSignedUrl(value) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    setUrl(null);
    if (value) getSignedUrl(value).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [value]);
  return url;
}

export function SignedImg({ value, ...props }) {
  const url = useSignedUrl(value);
  if (!url) return <div {...props} style={{ ...(props.style || {}), background: "#EAF0F6" }} />;
  return <img src={url} {...props} />;
}
