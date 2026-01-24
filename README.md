<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Configuration des Clés API

### Google Maps (Géolocalisation & Cartes)

Pour utiliser les fonctionnalités de géolocalisation et de gestion des sites opérationnels, vous devez configurer vos clés API Google Maps :

1.  **Créer un projet** sur la [Google Cloud Console](https://console.cloud.google.com/).
2.  **Activer les APIs** suivantes :
    *   `Maps JavaScript API` (Affichage des cartes)
    *   `Geocoding API` (Conversion adresses <-> coordonnées)
    *   `Places API` (Recherche d'adresses)
3.  **Générer une Clé API** dans la section "Identifiants".
4.  **Ajouter les clés** dans votre fichier `.env.local` :

```env
# Clé utilisée par le serveur (Backend)
GOOGLE_MAPS_API_KEY=votre_cle_api

# Clé exposée au client (Frontend)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_api
```

*Note : Google offre 200 $ de crédit mensuel gratuit, ce qui couvre largement les besoins standards de l'application.*

## Installation et Lancement

**Prérequis :** Node.js (v18+)

1. **Installer les dépendances :**
   ```bash
   npm install
   ```
2. **Configurer l'environnement :**
   Copiez le fichier `.env.example` vers `.env.local` et renseignez vos clés (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, etc.).
3. **Lancer l'application :**
   ```bash
   npm run dev
   ```

---
View your app in AI Studio: https://ai.studio/apps/drive/1f8or45gym-ceIGT8xnla8g8AQYiGUUxB
