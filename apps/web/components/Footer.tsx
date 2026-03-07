import Link from "next/link";
import { siteData } from "@/lib/siteData";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div>
          <h4>{siteData.company.nameMn}</h4>
          <p>Монгол орны байгаль, түүх, соёлыг аюулгүй, мэргэжлийн түвшинд танилцуулна.</p>
        </div>
        <div>
          <h4>Холбоо барих</h4>
          <ul>
            <li><a href={`tel:${siteData.company.phone}`}>{siteData.company.phone}</a></li>
            <li><a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a></li>
            <li><a href={siteData.contacts.facebook} target="_blank">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4>Төлбөр</h4>
          <ul>{siteData.payment.methods.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      </div>
      <div className="container copy">© {new Date().getFullYear()} {siteData.company.name}. Бүх эрх хуулиар хамгаалагдсан.</div>
    </footer>
  );
}
