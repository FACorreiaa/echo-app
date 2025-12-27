import { GetProps, styled, Text, XStack } from "tamagui";

const AvatarFrame = styled(XStack, {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 1000,
  overflow: "hidden",
  variants: {
    size: {
      sm: { width: 32, height: 32 },
      md: { width: 44, height: 44 },
      lg: { width: 64, height: 64 },
      xl: { width: 96, height: 96 },
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

const InitialsText = styled(Text, {
  color: "white",
  fontFamily: "Outfit_700Bold",
  variants: {
    size: {
      sm: { fontSize: 12 },
      md: { fontSize: 16 },
      lg: { fontSize: 24 },
      xl: { fontSize: 36 },
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

// Generate a consistent color from a string
const stringToColor = (str: string): string => {
  const colors = [
    "#f97316", // orange
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#eab308", // yellow
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export type AvatarProps = GetProps<typeof AvatarFrame> & {
  name: string;
  imageUrl?: string;
};

export const Avatar = ({ name, imageUrl, size = "md", ...props }: AvatarProps) => {
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  // TODO: Add Image support when needed
  return (
    <AvatarFrame size={size} backgroundColor={bgColor} {...props}>
      <InitialsText size={size}>{initials}</InitialsText>
    </AvatarFrame>
  );
};
