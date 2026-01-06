// 🧹 SCRIPT DE NETTOYAGE DU LOCALSTORAGE
// Exécutez ce script dans la console du navigateur (F12)
// pour réinitialiser complètement les données du store

console.log('🧹 Nettoyage du localStorage Maturis...');

// Supprimer les anciennes données
localStorage.removeItem('maturis-storage');

console.log('✅ localStorage nettoyé !');
console.log('🔄 Rafraîchissez la page (F5) pour recharger avec les nouvelles données.');

// Optionnel : Recharger automatiquement
// setTimeout(() => location.reload(), 1000);
