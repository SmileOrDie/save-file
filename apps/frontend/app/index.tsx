import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

type ApiState = 'checking' | 'reachable' | 'unreachable';

export default function HomeScreen() {
  const [apiState, setApiState] = useState<ApiState>('checking');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetch(`${API_URL}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable');
        return response.json();
      })
      .then(() => { if (active) setApiState('reachable'); })
      .catch(() => { if (active) setApiState('unreachable'); });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const statusText = apiState === 'checking'
    ? 'Vérification de l’API…'
    : apiState === 'reachable'
      ? 'API joignable — authentification non configurée'
      : 'API indisponible — vérifie son URL et son état';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SMARTTIFOLI · COFFRE-FORT PRIVÉ</Text>
          <Text accessibilityRole="header" style={styles.title}>Save</Text>
          <Text style={styles.subtitle}>Documents et archives WhatsApp, réunis dans un espace privé.</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>État du service</Text>
          <Text accessibilityLiveRegion="polite" style={styles.status}>{statusText}</Text>
          <Text style={styles.note}>Cette version est un socle technique. Aucun dépôt de fichier ni accès aux archives n’est encore activé.</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.tile}><Text style={styles.tileTitle}>Documents</Text><Text style={styles.tileBody}>Dépôt sécurisé à venir</Text></View>
          <View style={styles.tile}><Text style={styles.tileTitle}>WhatsApp</Text><Text style={styles.tileBody}>Import des exports à venir</Text></View>
          <View style={styles.tile}><Text style={styles.tileTitle}>Accès</Text><Text style={styles.tileBody}>Comptes et permissions à configurer</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f8' },
  container: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 24, gap: 24 },
  header: { paddingTop: 28, gap: 12 },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, color: '#536273', fontWeight: '700' },
  title: { fontSize: 44, lineHeight: 50, fontWeight: '800', color: '#17212f' },
  subtitle: { fontSize: 17, lineHeight: 25, color: '#536273', maxWidth: 620 },
  statusCard: { padding: 20, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e0e6ec', gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#17212f' },
  status: { fontSize: 15, color: '#245a46' },
  note: { fontSize: 13, lineHeight: 20, color: '#667586' },
  grid: { gap: 12 },
  tile: { padding: 18, borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e6ec', gap: 6 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#17212f' },
  tileBody: { fontSize: 14, color: '#667586' },
});
