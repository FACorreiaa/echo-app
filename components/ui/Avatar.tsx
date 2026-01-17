import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
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
  fontFamily: "$heading",
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

// Generate a consistent color from a string with futuristic OS theme
const stringToColor = (str: string): string => {
  const colors = [
    "#00d9ff", // neon cyan
    "#b47aff", // neon purple
    "#2da6fa", // electric blue
    "#8b5cf6", // purple
    "#1e88e5", // blue
    "#00a3cc", // cyan
    "#d896ff", // light purple
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

export const Avatar = React.memo(({ name, imageUrl, size = "md", ...props }: AvatarProps) => {
  const bgColor = useMemo(() => stringToColor(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  // If image URL is provided, use optimized expo-image with caching
  if (imageUrl) {
    return (
      <AvatarFrame size={size} {...props}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          cachePolicy="memory-disk"
          priority="normal"
          contentFit="cover"
          transition={200}
          placeholder={null}
        />
      </AvatarFrame>
    );
  }

  // Fallback to initials with generated color
  return (
    <AvatarFrame size={size} backgroundColor={bgColor as any} {...props}>
      <InitialsText size={size}>{initials}</InitialsText>
    </AvatarFrame>
  );
});
