/* ==============================================
   STORAGE - Versión con Firebase Firestore
   Esta versión comparte los reclamos entre todos
   los vecinos en tiempo real.
   Requiere:
   1. Crear un proyecto gratis en firebase.google.com
   2. Crear una base Firestore en modo "test"
   3. Copiar la config a firebase-config.js
   ============================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDocs,
  onSnapshot, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION = "reclamos";

window.afiStorage = {
  async loadAll() {
    const reclamos = {};
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      snap.forEach(docSnap => {
        const data = docSnap.data();
        reclamos[data.id] = data;
      });
    } catch (e) {
      console.error('Error cargando reclamos:', e);
    }
    return reclamos;
  },

  async save(reclamo) {
    try {
      await setDoc(doc(db, COLLECTION, reclamo.id), reclamo);
    } catch (e) {
      console.error('Error guardando reclamo:', e);
    }
  },

  async loadMyVotes() {
    // Los votos propios se guardan en localStorage (son personales)
    try {
      const raw = localStorage.getItem('afi-my-votes');
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) {}
    return new Set();
  },

  async saveMyVotes(votesSet) {
    try {
      localStorage.setItem('afi-my-votes', JSON.stringify(Array.from(votesSet)));
    } catch (e) {
      console.error('Error guardando votos:', e);
    }
  },

  // Escucha cambios en tiempo real (los reclamos de otros vecinos aparecen solos)
  subscribeToChanges(callback) {
    try {
      onSnapshot(collection(db, COLLECTION), (snap) => {
        const reclamos = {};
        snap.forEach(docSnap => {
          const data = docSnap.data();
          reclamos[data.id] = data;
        });
        callback(reclamos);
      });
    } catch (e) {
      console.error('Error en suscripción:', e);
    }
  }
};
