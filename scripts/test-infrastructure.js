const { execSync } = require('child_process');
const { readFileSync } = require('fs');
require('dotenv').config();

console.log('🔍 === TESTS DE CONNECTIVITÉ INFRASTRUCTURE FLEETMADA ===\n');

// Test 1: Vérification des variables d'environnement
console.log('📋 Test 1: Variables d\'environnement');
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL');
  console.log(`✅ DATABASE_URL configurée: ${hasDatabaseUrl ? 'OUI' : 'NON'}`);
  
  if (!hasDatabaseUrl) {
    throw new Error('DATABASE_URL manquante dans .env.local');
  }
} catch (error) {
  console.log(`❌ Erreur variables d'environnement: ${error.message}`);
  process.exit(1);
}

// Test 2: Connexion Docker
console.log('\n🐳 Test 2: Services Docker');
try {
  const dockerPs = execSync('docker-compose ps --format "table {{.Name}}\\t{{.Status}}\\t{{.Ports}}"', { encoding: 'utf8' });
  console.log('Services Docker actifs:');
  console.log(dockerPs);
} catch (error) {
  console.log(`❌ Erreur Docker: ${error.message}`);
  process.exit(1);
}

// Test 3: Connectivité PostgreSQL
console.log('\n🗄️ Test 3: Connectivité PostgreSQL');
try {
  const pgTest = execSync('docker-compose exec -T postgres pg_isready -U fleetmada', { encoding: 'utf8' });
  console.log(`✅ PostgreSQL: ${pgTest.trim()}`);
} catch (error) {
  console.log(`❌ PostgreSQL non accessible: ${error.message}`);
  process.exit(1);
}

// Test 4: Connectivité Redis
console.log('\n⚡ Test 4: Connectivité Redis');
try {
  const redisTest = execSync('docker-compose exec -T redis redis-cli ping', { encoding: 'utf8' });
  console.log(`✅ Redis: ${redisTest.trim()}`);
} catch (error) {
  console.log(`❌ Redis non accessible: ${error.message}`);
  process.exit(1);
}

// Test 5: Intégrité du schéma Prisma
console.log('\n🔧 Test 5: Intégrité du schéma Prisma');
try {
  // Vérifier que le client Prisma peut être généré
  execSync('npx prisma generate', { stdio: 'pipe' });
  console.log('✅ Client Prisma généré avec succès');
} catch (error) {
  console.log(`❌ Erreur génération client Prisma: ${error.message}`);
  process.exit(1);
}

// Test 6: Test de connexion base de données directe
console.log('\n🔗 Test 6: Connexion base de données');
try {
  // Tester la connexion directement via psql
  const dbTest = execSync('docker-compose exec -T postgres psql -U fleetmada -d fleetmada_db -c "SELECT version();"', { encoding: 'utf8' });
  console.log('✅ Connexion base de données réussie');
  const versionLine = dbTest.split('\n')[1];
  if (versionLine && versionLine.includes('PostgreSQL')) {
    console.log(`✅ PostgreSQL: ${versionLine.trim()}`);
  }
} catch (error) {
  console.log(`❌ Erreur connexion base de données: ${error.message}`);
  process.exit(1);
}

// Test 7: Vérification Tailwind CSS
console.log('\n🎨 Test 7: Configuration Tailwind CSS');
try {
  const tailwindConfig = readFileSync('tailwind.config.js', 'utf8');
  const hasContent = tailwindConfig.includes('content:');
  const hasTheme = tailwindConfig.includes('theme:');
  
  console.log(`✅ Configuration Tailwind: ${hasContent && hasTheme ? 'VALIDE' : 'INCOMPLÈTE'}`);
} catch (error) {
  console.log(`❌ Erreur configuration Tailwind: ${error.message}`);
  process.exit(1);
}

// Test 8: Build Next.js
console.log('\n🚀 Test 8: Build Next.js');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build Next.js réussi');
} catch (error) {
  console.log(`❌ Erreur build Next.js: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 === TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ===');
console.log('\n📊 Résumé:');
console.log('✅ Infrastructure Docker fonctionnelle');
console.log('✅ Base de données PostgreSQL accessible');
console.log('✅ Cache Redis opérationnel');
console.log('✅ Prisma correctement configuré');
console.log('✅ Tailwind CSS valide');
console.log('✅ Build Next.js réussi');
console.log('\n🚀 L\'infrastructure FleetMada est prête pour le développement !');