import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, UserPlus } from "lucide-react";

interface User {
  _id: string;
  email: string;
  username?: string;
  credits: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  // Update user credits mutation
  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/credits`, { credits });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User credits updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setNewCredits("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user credits",
        variant: "destructive",
      });
    },
  });

  const handleEditCredits = (user: User) => {
    setSelectedUser(user);
    setNewCredits(user.credits);
    setIsDialogOpen(true);
  };

  const handleUpdateCredits = () => {
    if (!selectedUser) return;
    
    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of credits",
        variant: "destructive",
      });
      return;
    }

    updateCreditsMutation.mutate({ userId: selectedUser._id, credits });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-100 dark:bg-blue-900/20 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-blue-50 dark:bg-blue-900/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          User Management
        </h2>
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50 dark:bg-blue-900/20">
              <TableHead className="text-blue-900 dark:text-blue-100">Email</TableHead>
              <TableHead className="text-blue-900 dark:text-blue-100">Username</TableHead>
              <TableHead className="text-blue-900 dark:text-blue-100">Credits</TableHead>
              <TableHead className="text-blue-900 dark:text-blue-100">Status</TableHead>
              <TableHead className="text-blue-900 dark:text-blue-100">Joined</TableHead>
              <TableHead className="text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                <TableCell className="font-medium text-blue-900 dark:text-blue-100">
                  {user.email}
                </TableCell>
                <TableCell className="text-blue-700 dark:text-blue-300">
                  {user.username || "—"}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                    {user.credits}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    user.isEmailVerified 
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" 
                      : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                  }`}>
                    {user.isEmailVerified ? "Verified" : "Unverified"}
                  </span>
                </TableCell>
                <TableCell className="text-blue-700 dark:text-blue-300">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCredits(user)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Credits
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-blue-100">
              Update User Credits
            </DialogTitle>
            <DialogDescription className="text-blue-600 dark:text-blue-400">
              Change the credit balance for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right text-blue-900 dark:text-blue-100">
                Credits
              </Label>
              <Input
                id="credits"
                type="number"
                min="0"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                className="col-span-3 border-blue-200 dark:border-blue-700"
                placeholder="Enter number of credits"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateCredits}
              disabled={updateCreditsMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {updateCreditsMutation.isPending ? "Updating..." : "Update Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}