import { useAuth } from "@/contexts/AuthContext";
import theme from "@/themes";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "../common";


const Header = () => {
	const { usuario } = useAuth();
	return (

		<View style={styles.header}>
			<View style={styles.greeting}>
				<Text style={styles.greetingText}>
					Olá, {usuario?.perfil?.primeiroNome}!
				</Text>
				<Text style={styles.subtitle}>
					Pronto para sua próxima aula?
				</Text>
			</View>
			<View>
				<Avatar />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		marginBottom: theme.spacing.xl,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	greeting: {
		display: 'flex',
		flexDirection: 'column',
		rowGap: theme.spacing.xs,
	},
	greetingText: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.text.primary,
		marginBottom: theme.spacing.xs,
	},
	subtitle: {
		fontSize: theme.typography.fontSize.sm,
		color: theme.colors.text.secondary,
	},
	quickActions: {
		marginBottom: theme.spacing.lg,
	},
});

export default Header;