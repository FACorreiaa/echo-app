import { Pressable } from "react-native";
import { GetProps, styled, Text, XStack, YStack } from "tamagui";

const ItemFrame = styled(XStack, {
  paddingVertical: 14,
  paddingHorizontal: 16,
  alignItems: "center",
  gap: 14,
  backgroundColor: "transparent",
  borderRadius: 12,
  pressStyle: {
    backgroundColor: "$listItemBackground",
  },
});

const ContentStack = styled(YStack, {
  flex: 1,
  gap: 2,
});

const TitleText = styled(Text, {
  color: "$color",
  fontSize: 16,
  fontFamily: "$body",
});

const SubtitleText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

const RightText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

export type ListItemProps = Omit<GetProps<typeof ItemFrame>, "left" | "right"> & {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode | string;
  onPress?: () => void;
};

export const ListItem = ({ title, subtitle, left, right, onPress, ...props }: ListItemProps) => {
  const content = (
    <ItemFrame {...props}>
      {left}
      <ContentStack>
        <TitleText>{title}</TitleText>
        {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
      </ContentStack>
      {typeof right === "string" ? <RightText>{right}</RightText> : right}
    </ItemFrame>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
};
