"use client";

import { createSandboxClient } from "../../../lib/sandbox";

if (typeof window !== "undefined" && !window.__ppgSandbox) window.__ppgSandbox = createSandboxClient();

import TagsPage from "../../account/tags/page";

export default function SandboxTags() {
  return <TagsPage />;
}
