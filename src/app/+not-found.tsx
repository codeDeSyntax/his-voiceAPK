
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  return <View style={styles.container}><Text>This page could not be found.</Text><Link href="/sermons">Open sermon library</Link></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 } });
