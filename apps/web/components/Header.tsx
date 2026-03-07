import Link from "next/link";
import { siteData } from "@/lib/siteData";

const nav = [
  { href: "/", label: "Нүүр" },
  { href: "/about", label: "Бидний тухай" },
  { href: "/services", label: "Үйлчилгээ" },
  { href: "/tours", label: "Аяллууд" },
  { href: "/destinations", label: "Чиглэлүүд" },
  { href: "/contact", label: "Холбоо барих" }
];

export function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="brand">
          <img src={siteData.company.logo} alt="logo" />
          <span>{siteData.company.nameMn}</span>
        </Link>
        <nav className="menu">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
