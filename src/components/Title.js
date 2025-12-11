import { StyleSheet } from 'react-native';
import { Title as PaperTitle, useTheme } from 'react-native-paper';

export default function Title({ children, variant = 'medium', style, ...props }) {
  const { colors } = useTheme();
  const variantStyle = styles[variant] || styles.medium;
  return (
    <PaperTitle style={[{ color: colors?.text || '#000' }, variantStyle, style]} {...props}>
      {children}
    </PaperTitle>
  );
}

const styles = StyleSheet.create({
  large: { fontSize: 28, marginVertical: 12, padding: 6 },
  medium: { fontSize: 20, marginVertical: 8 },
  small: { fontSize: 16, marginVertical: 6 },
});
