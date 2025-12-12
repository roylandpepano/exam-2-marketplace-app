import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
   // This route is deprecated in favor of the dialog-based flow.
   redirect("/");
}
