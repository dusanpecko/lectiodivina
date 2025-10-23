#!/usr/bin/env node

/* eslint-disable */

/**
 * Backup script pre tabuľku lectio_sources z Supabase
 * 
 * Použitie:
 * node backup-lectio-sources.js
 * 
 * Tento script:
 * 1. Pripojí sa na Supabase databázu
 * 2. Načíta všetky záznamy z tabuľky lectio_sources
 * 3. Uloží ich vo viacerých formátoch (JSON, CSV)
 * 4. Vytvorí backup súbory s timestamp
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfigurácia
const BACKUP_DIR = './backup';
const TABLE_NAME = 'lectio_sources';

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
    .slice(0, -5); // odstráni .000Z
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

// Konverzia na CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape hodnoty obsahujúce čiarky alebo úvodzovky
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Hlavná backup funkcia
const backupLectioSources = async () => {
  console.log('🚀 Spúšťam backup tabuľky lectio_sources...\n');
  
  try {
    ensureBackupDir();
    
    console.log('📡 Pripájam sa na Supabase...');
    
    // Test pripojenia a počítanie záznamov
    const { data: testData, error: testError, count: totalCount } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      throw new Error(`Chyba pri pripojení na databázu: ${testError.message}`);
    }
    
    console.log(`✅ Pripojenie úspešné. Našiel som ${totalCount || 0} záznamov v tabuľke ${TABLE_NAME}`);
    
    if (!totalCount || totalCount === 0) {
      console.log('⚠️  Tabuľka je prázdna. Backup sa ukončuje.');
      return;
    }
    
    console.log('\n📥 Načítavam všetky záznamy...');
    
    // Načítanie všetkých dát
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw new Error(`Chyba pri načítaní dát: ${error.message}`);
    }
    
    console.log(`✅ Načítaných ${data.length} záznamov`);
    
    // Príprava timestamp a názvov súborov
    const timestamp = formatTimestamp();
    const baseFileName = `${TABLE_NAME}_backup_${timestamp}`;
    
    // Uloženie JSON backup
    console.log('\n💾 Ukladám JSON backup...');
    const jsonBackup = {
      metadata: {
        table: TABLE_NAME,
        backup_date: new Date().toISOString(),
        total_records: data.length,
        supabase_url: supabaseUrl,
        version: '1.0'
      },
      data: data
    };
    
    const jsonPath = path.join(BACKUP_DIR, `${baseFileName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonBackup, null, 2), 'utf8');
    const jsonSize = fs.statSync(jsonPath).size;
    console.log(`✅ JSON backup uložený: ${jsonPath} (${formatFileSize(jsonSize)})`);
    
    // Uloženie CSV backup
    console.log('\n📊 Ukladám CSV backup...');
    const csvContent = convertToCSV(data);
    const csvPath = path.join(BACKUP_DIR, `${baseFileName}.csv`);
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    const csvSize = fs.statSync(csvPath).size;
    console.log(`✅ CSV backup uložený: ${csvPath} (${formatFileSize(csvSize)})`);
    
    // Uloženie SQL INSERT script
    console.log('\n🗄️  Ukladám SQL backup...');
    const sqlPath = path.join(BACKUP_DIR, `${baseFileName}.sql`);
    let sqlContent = `-- Backup tabuľky ${TABLE_NAME}\n`;
    sqlContent += `-- Vytvorený: ${new Date().toISOString()}\n`;
    sqlContent += `-- Počet záznamov: ${data.length}\n\n`;
    
    sqlContent += `-- Vymazanie existujúcich dát (POZOR!)\n`;
    sqlContent += `-- DELETE FROM ${TABLE_NAME};\n\n`;
    
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      sqlContent += `INSERT INTO ${TABLE_NAME} (${columns.join(', ')}) VALUES\n`;
      
      const values = data.map((row, index) => {
        const rowValues = columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return 'NULL';
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
          return value;
        });
        const isLast = index === data.length - 1;
        return `  (${rowValues.join(', ')})${isLast ? ';' : ','}`;
      });
      
      sqlContent += values.join('\n');
    }
    
    fs.writeFileSync(sqlPath, sqlContent, 'utf8');
    const sqlSize = fs.statSync(sqlPath).size;
    console.log(`✅ SQL backup uložený: ${sqlPath} (${formatFileSize(sqlSize)})`);
    
    // Štatistiky
    console.log('\n📊 Štatistiky backup:');
    console.log(`   • Tabuľka: ${TABLE_NAME}`);
    console.log(`   • Počet záznamov: ${data.length}`);
    console.log(`   • JSON súbor: ${formatFileSize(jsonSize)}`);
    console.log(`   • CSV súbor: ${formatFileSize(csvSize)}`);
    console.log(`   • SQL súbor: ${formatFileSize(sqlSize)}`);
    console.log(`   • Celková veľkosť: ${formatFileSize(jsonSize + csvSize + sqlSize)}`);
    
    // Info o stĺpcoch
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`   • Počet stĺpcov: ${columns.length}`);
      console.log(`   • Stĺpce: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
    }
    
    console.log('\n🎉 Backup úspešne dokončený!');
    console.log(`📁 Súbory uložené v priečinku: ${BACKUP_DIR}`);
    
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
  backupLectioSources();
}

module.exports = { backupLectioSources };