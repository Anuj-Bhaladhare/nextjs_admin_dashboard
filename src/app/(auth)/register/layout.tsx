import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create account | Smart Gate Monitoring",
  description: "Create an account for Smart Gate Monitoring.",
};

interface RegisterLayoutProps {
  children: ReactNode
}

const RegisterLayout = ({ children }: RegisterLayoutProps) => {
  return (
    <div> { children } </div>
  );
}

export default RegisterLayout;
