"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!token) return;
    const nextUsers = await browserApiFetch<User[]>("/admin/users", {
      headers: authHeaders(token)
    });
    setUsers(nextUsers);
  };

  useEffect(() => {
    void loadUsers();
  }, [token]);

  const updateUser = async (id: number, role: string, status: string) => {
    if (!token) return;
    try {
      await browserApiFetch(`/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role, status })
      });
      setMessage("User шинэчлэгдлээ.");
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "User шинэчлэхэд алдаа гарлаа.");
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>Users</h1></div>
      {message ? <p className="inlineMessage success">{message}</p> : null}
      <section className="panel stackMd">
        {users.map((user) => (
          <article key={user.id} className="listRow alignStart">
            <div>
              <Link href={`/admin/users/${user.id}`}><strong>{user.fullName}</strong></Link>
              <p className="meta">{user.email}</p>
            </div>
            <div className="rowActions stretchControls">
              <select defaultValue={user.role} onChange={(event) => void updateUser(user.id, event.target.value, user.status)}>
                <option value="customer">customer</option>
                <option value="super_admin">super_admin</option>
                <option value="booking_manager">booking_manager</option>
                <option value="finance">finance</option>
                <option value="support">support</option>
              </select>
              <select defaultValue={user.status} onChange={(event) => void updateUser(user.id, user.role, event.target.value)}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="blocked">blocked</option>
              </select>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}