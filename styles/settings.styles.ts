import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    profileSection: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        margin: 12,
        borderRadius: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    userInfo: {
        alignItems: "center",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
    signInButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signInText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    statsSection: {
        backgroundColor: "#fff",
        margin: 12,
        padding: 16,
        borderRadius: 12,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4CAF50",
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    menuSection: {
        backgroundColor: "#fff",
        margin: 12,
        borderRadius: 12,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    menuText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 12,
    },
});