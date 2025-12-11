"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Search, Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");

   useEffect(() => {
      loadUsers();
   }, [search]);

   const loadUsers = async () => {
      try {
         const data = await api.getUsers({ search, per_page: 50 });
         setUsers(data.users);
      } catch (error: any) {
         toast.error(error.message || "Failed to load users");
      } finally {
         setLoading(false);
      }
   };

   const toggleAdmin = async (id: number) => {
      try {
         await api.toggleUserAdmin(id);
         toast.success("Admin status updated");
         loadUsers();
      } catch (error: any) {
         toast.error(error.message || "Failed to update admin status");
      }
   };

   const toggleActive = async (id: number) => {
      try {
         await api.toggleUserActive(id);
         toast.success("User status updated");
         loadUsers();
      } catch (error: any) {
         toast.error(error.message || "Failed to update user status");
      }
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div>
               <h1 className="text-3xl font-bold">Users</h1>
               <p className="text-muted-foreground">Manage user accounts</p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>User List</CardTitle>
                  <CardDescription>All registered users</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="mb-4">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Search users..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="pl-8"
                        />
                     </div>
                  </div>

                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Email</TableHead>
                           <TableHead>Username</TableHead>
                           <TableHead>Name</TableHead>
                           <TableHead>Orders</TableHead>
                           <TableHead>Role</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Joined</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {loading ? (
                           <TableRow>
                              <TableCell colSpan={8}>Loading...</TableCell>
                           </TableRow>
                        ) : users.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                 No users
                              </TableCell>
                           </TableRow>
                        ) : (
                           users.map((user) => (
                              <TableRow key={user.id}>
                                 <TableCell className="font-medium">
                                    {user.email}
                                 </TableCell>
                                 <TableCell>{user.username}</TableCell>
                                 <TableCell>
                                    {user.first_name} {user.last_name}
                                 </TableCell>
                                 <TableCell>{user.order_count || 0}</TableCell>
                                 <TableCell>
                                    <span
                                       className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                          user.is_admin
                                             ? "bg-purple-50 text-purple-700"
                                             : "bg-gray-50 text-gray-700"
                                       }`}
                                    >
                                       {user.is_admin ? "Admin" : "User"}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    <span
                                       className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                          user.is_active
                                             ? "bg-green-50 text-green-700"
                                             : "bg-red-50 text-red-700"
                                       }`}
                                    >
                                       {user.is_active ? "Active" : "Inactive"}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    {new Date(
                                       user.created_at
                                    ).toLocaleDateString()}
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleAdmin(user.id)}
                                          title={
                                             user.is_admin
                                                ? "Remove admin"
                                                : "Make admin"
                                          }
                                       >
                                          {user.is_admin ? (
                                             <ShieldOff className="h-4 w-4" />
                                          ) : (
                                             <Shield className="h-4 w-4" />
                                          )}
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleActive(user.id)}
                                          title={
                                             user.is_active
                                                ? "Deactivate"
                                                : "Activate"
                                          }
                                       >
                                          {user.is_active ? (
                                             <UserX className="h-4 w-4" />
                                          ) : (
                                             <UserCheck className="h-4 w-4" />
                                          )}
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
         </div>
      </AdminLayout>
   );
}
