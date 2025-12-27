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
  fontFamily: "Outfit_500Medium",
});

const SubtitleText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "Outfit_400Regular",
});

const RightText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "Outfit_400Regular",
});

export type ListItemProps = GetProps<typeof ItemFrame> & {
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
