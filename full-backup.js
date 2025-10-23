#!/usr/bin/env node

/* eslint-disable */

/**
 * Kompletný backup script pre všetky dôležité tabuľky z Supabase
 * 
 * Použitie:
 * node full-backup.js
 * 
 * Tento script zálohuje:
 * - lectio_sources (hlavné lectio dáta)
 * - locales (jazyky)
 * - translations (preklady Biblie)  
 * - books (biblické knihy)
 * - bible_verses (biblické verše)
 * - users (používatelia)
 * - a ďalšie...
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfigurácia
const BACKUP_DIR = './backup';

// Zoznam tabuliek na zálohovanie
const TABLES_TO_BACKUP = [
  'lectio_sources',
  'locales', 
  'translations',
  'books',
  'bible_verses',
  'users',
  'articles',
  'calendar_events',
  'daily_quotes',
  'programs',
  'rosary_mysteries',
  'beta_feedback',
  'error_reports'
];

// Načítanie environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chyba: Nenašli sa potrebné environment variables.');
  console.error('Skontrolujte .env.local súbor a uistite sa, že obsahuje:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Vytvorenie Supabase klienta
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility funkcie
const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5);
};

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Vytvorený backup priečinok: ${BACKUP_DIR}`);
  }
};

const formatFileSize = (bytes) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Backup jednej tabuľky
const backupTable = async (tableName) => {
  try {
    console.log(`📥 Zálohování ${tableName}...`);
    
    // Načítanie dát
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.warn(`⚠️  Chyba pri načítaní ${tableName}: ${error.message}`);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`   ℹ️  Tabuľka ${tableName} je prázdna`);
      return { tableName, count: 0, size: 0 };
    }
    
    console.log(`   ✅ Načítaných ${data.length} záznamov z ${tableName}`);
    
    // Príprava dát pre backup
    const backupData = {
      metadata: {
        table: tableName,
        backup_date: new Date().toISOString(),
        total_records: data.length,
        version: '1.0'
      },
      data: data
    };
    
    return { tableName, data: backupData, count: data.length };
    
  } catch (error) {
    console.warn(`⚠️  Chyba pri zálohovaní ${tableName}:`, error.message);
    return null;
  }
};

// Hlavná backup funkcia
const fullBackup = async () => {
  console.log('🚀 Spúšťam kompletný backup databázy...\n');
  
  try {
    ensureBackupDir();
    
    console.log('📡 Pripájam sa na Supabase...');
    
    // Test pripojenia
    const { error: testError } = await supabase
      .from('lectio_sources')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      throw new Error(`Chyba pri pripojení na databázu: ${testError.message}`);
    }
    
    console.log('✅ Pripojenie úspešné\n');
    
    // Timestamp pre všetky súbory
    const timestamp = formatTimestamp();
    const backupResults = [];
    const allTablesData = {};
    
    // Backup každej tabuľky
    for (const tableName of TABLES_TO_BACKUP) {
      const result = await backupTable(tableName);
      if (result) {
        backupResults.push(result);
        if (result.data) {
          allTablesData[tableName] = result.data;
        }
      }
    }
    
    if (backupResults.length === 0) {
      console.log('⚠️  Žiadne dáta na zálohovanie');
      return;
    }
    
    // Uloženie individuálnych JSON súborov
    console.log('\n💾 Ukladám individuálne zálohy...');
    let totalSize = 0;
    
    for (const result of backupResults) {
      if (result.data) {
        const fileName = `${result.tableName}_${timestamp}.json`;
        const filePath = path.join(BACKUP_DIR, fileName);
        fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2), 'utf8');
        const fileSize = fs.statSync(filePath).size;
        totalSize += fileSize;
        console.log(`   ✅ ${fileName} (${result.count} záznamov, ${formatFileSize(fileSize)})`);
      }
    }
    
    // Uloženie kompletného backup súboru
    console.log('\n📦 Ukladám kompletný backup...');
    const fullBackupData = {
      metadata: {
        backup_date: new Date().toISOString(),
        backup_type: 'full_database',
        total_tables: backupResults.length,
        total_records: backupResults.reduce((sum, r) => sum + r.count, 0),
        supabase_url: supabaseUrl,
        version: '1.0'
      },
      tables: allTablesData
    };
    
    const fullBackupPath = path.join(BACKUP_DIR, `full_backup_${timestamp}.json`);
    fs.writeFileSync(fullBackupPath, JSON.stringify(fullBackupData, null, 2), 'utf8');
    const fullBackupSize = fs.statSync(fullBackupPath).size;
    totalSize += fullBackupSize;
    
    console.log(`✅ Kompletný backup: full_backup_${timestamp}.json (${formatFileSize(fullBackupSize)})`);
    
    // Vytvorenie README súboru
    const readmePath = path.join(BACKUP_DIR, `backup_info_${timestamp}.md`);
    let readmeContent = `# Database Backup - ${new Date().toISOString()}\n\n`;
    readmeContent += `## Súhrn\n\n`;
    readmeContent += `- **Dátum zálohy:** ${new Date().toLocaleString('sk-SK')}\n`;
    readmeContent += `- **Počet tabuliek:** ${backupResults.length}\n`;
    readmeContent += `- **Celkový počet záznamov:** ${backupResults.reduce((sum, r) => sum + r.count, 0).toLocaleString()}\n`;
    readmeContent += `- **Celková veľkosť:** ${formatFileSize(totalSize)}\n\n`;
    
    readmeContent += `## Zálohované tabuľky\n\n`;
    readmeContent += `| Tabuľka | Počet záznamov | Súbor |\n`;
    readmeContent += `|---------|----------------|-------|\n`;
    
    for (const result of backupResults) {
      const fileName = `${result.tableName}_${timestamp}.json`;
      readmeContent += `| ${result.tableName} | ${result.count.toLocaleString()} | ${fileName} |\n`;
    }
    
    readmeContent += `\n## Obnovenie dát\n\n`;
    readmeContent += `Na obnovenie dát použite súbory JSON a importujte ich späť do Supabase.\n`;
    readmeContent += `Každý súbor obsahuje metadáta a pole \`data\` s všetkými záznamami.\n\n`;
    readmeContent += `### Príklad obnovenia v JavaScript:\n`;
    readmeContent += `\`\`\`javascript\n`;
    readmeContent += `const backupData = JSON.parse(fs.readFileSync('lectio_sources_${timestamp}.json', 'utf8'));\n`;
    readmeContent += `const { data, error } = await supabase\n`;
    readmeContent += `  .from('lectio_sources')\n`;
    readmeContent += `  .insert(backupData.data);\n`;
    readmeContent += `\`\`\`\n`;
    
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    
    // Finálne štatistiky
    console.log('\n📊 Backup dokončený!');
    console.log('═══════════════════════════════════════');
    console.log(`📁 Backup priečinok: ${BACKUP_DIR}`);
    console.log(`📋 Zálohované tabuľky: ${backupResults.length}`);
    console.log(`📄 Celkový počet záznamov: ${backupResults.reduce((sum, r) => sum + r.count, 0).toLocaleString()}`);
    console.log(`💾 Celková veľkosť: ${formatFileSize(totalSize)}`);
    console.log(`📝 Dokumentácia: backup_info_${timestamp}.md`);
    console.log('═══════════════════════════════════════');
    
    console.log('\n🎉 Všetky dáta boli úspešne zálohované!');
    
  } catch (error) {
    console.error('\n❌ Chyba pri vytváraní backup:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
};

// Spustenie scriptu
if (require.main === module) {
  fullBackup();
}

module.exports = { fullBackup };