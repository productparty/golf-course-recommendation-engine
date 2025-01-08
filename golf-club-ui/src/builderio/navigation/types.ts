export interface ButtonProps {
  icon: string;
  label: string;
  variant: "primary" | "secondary";
}

export interface NavigationLinkProps {
  label: string;
  isActive?: boolean;
}
