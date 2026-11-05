import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

const HomePage = async () => {

  const session = await getCurrentUser();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");

}

export default HomePage;
