"use client";

import Link from "next/link";
import { useChromeMessages } from "@/components/locale/LocaleProvider";
import { siteData } from "@/lib/siteData";

export function Footer() {
  const messages = useChromeMessages();

  return (
    <footer className="footer">
      <div className="container footerTop">
        <div className="footerIntro">
          <h3>{siteData.company.nameMn}</h3>
          <p>{messages.footer.intro}</p>
          <div className="footerContactList">
            <a href={`tel:${siteData.company.phone}`}>{siteData.company.phone}</a>
            <a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a>
            <a href={siteData.contacts.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>

        <div className="footerColumns">
          {messages.footer.groups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container footerBottom">
        <span>
          © {new Date().getFullYear()} {siteData.company.nameMn}. {messages.footer.rights}
        </span>
        <span>{siteData.payment.methods.join(" • ")}</span>
      </div>
    </footer>
  );
}
