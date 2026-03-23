import { AccountShell } from "@/components/dashboard/AccountShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}