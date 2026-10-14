const navy = "#152238";
const link = { fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: navy, textDecoration: "none", whiteSpace: "nowrap" };

export const NAV_LINKS = [
  { href: "/airlines", label: "Airlines" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-14 py-5 flex-wrap gap-3" style={{ borderBottom: "1px solid #D9E1E8", background: "#fff" }}>
      <a href="/" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: navy, textDecoration: "none" }}>PetPassGo</a>
      <div className="flex items-center gap-5 flex-wrap">
        {NAV_LINKS.map((l) => <a key={l.href} href={l.href} style={link}>{l.label}</a>)}
        <a href="/login" style={link}>Log in</a>
        <a href="/assessment" className="rounded-full px-4 py-2" style={{ ...link, background: navy, color: "#EAF0F6" }}>Free assessment</a>
      </div>
    </nav>
  );
}
