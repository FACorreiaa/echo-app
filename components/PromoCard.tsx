import { LinearGradient } from "expo-linear-gradient";
import { Image, ImageSourcePropType, Pressable, StyleSheet } from "react-native";
import { GetProps, styled, Text, XStack, YStack } from "tamagui";

const CardFrame = styled(XStack, {
  borderRadius: 20,
  overflow: "hidden",
  minHeight: 120,
  backgroundColor: "$cardBackground",
  borderWidth: 1,
  borderColor: "$borderColor",
  pressStyle: {
    opacity: 0.9,
    scale: 0.98,
  },
});

const ContentStack = styled(YStack, {
  flex: 1,
  padding: 20,
  gap: 6,
  justifyContent: "center",
});

const TitleText = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
});

const SubtitleText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
  lineHeight: 20,
});

const ImageContainer = styled(YStack, {
  width: 100,
  justifyContent: "center",
  alignItems: "center",
});

export type PromoCardProps = GetProps<typeof CardFrame> & {
  title: string;
  subtitle?: string;
  imageSource?: ImageSourcePropType;
  imageElement?: React.ReactNode;
  onPress?: () => void;
  gradient?: boolean;
  gradientColors?: [string, string];
};

export const PromoCard = ({
  title,
  subtitle,
  imageSource,
  imageElement,
  onPress,
  gradient = false,
  gradientColors = ["#2da6fa", "#6366f1"],
  ...props
}: PromoCardProps) => {
  const content = (
    <CardFrame {...props}>
      {gradient && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <ContentStack>
        <TitleText>{title}</TitleText>
        {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
      </ContentStack>
      {(imageSource || imageElement) && (
        <ImageContainer>
          {imageElement ? (
            imageElement
          ) : imageSource ? (
            <Image source={imageSource} style={{ width: 80, height: 80, resizeMode: "contain" }} />
          ) : null}
        </ImageContainer>
      )}
    </CardFrame>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
};
