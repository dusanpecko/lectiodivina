// Test file to verify roadmap translations completeness
import { roadmapTranslations } from '../src/app/components/roadmapTranslations';

const languages = ['sk', 'cz', 'en', 'es'];

console.log('🧪 Testing Roadmap Translations Completeness\n');

let allTestsPassed = true;

// Test 1: All languages exist
console.log('Test 1: Checking all languages exist...');
languages.forEach(lang => {
  if (roadmapTranslations[lang]) {
    console.log(`  ✅ ${lang.toUpperCase()} translations found`);
  } else {
    console.log(`  ❌ ${lang.toUpperCase()} translations MISSING`);
    allTestsPassed = false;
  }
});

// Test 2: All keys exist in all languages
console.log('\nTest 2: Checking all translation keys...');
const requiredKeys = ['badge', 'title', 'subtitle', 'description', 'milestones'];
const requiredMilestoneKeys = ['start', 'branding', 'website', 'flutter', 'expansion', 'portuguese'];
const requiredMilestoneProps = ['date', 'title', 'description'];

languages.forEach(lang => {
  console.log(`\n  ${lang.toUpperCase()}:`);
  const trans = roadmapTranslations[lang];
  
  // Check main keys
  requiredKeys.forEach(key => {
    if (key in trans) {
      console.log(`    ✅ ${key}`);
    } else {
      console.log(`    ❌ ${key} MISSING`);
      allTestsPassed = false;
    }
  });
  
  // Check milestone keys
  if (trans.milestones) {
    requiredMilestoneKeys.forEach(milestone => {
      if (milestone in trans.milestones) {
        console.log(`    ✅ milestones.${milestone}`);
        
        // Check milestone properties
        requiredMilestoneProps.forEach(prop => {
          if (prop in trans.milestones[milestone]) {
            // Property exists
          } else {
            console.log(`      ❌ milestones.${milestone}.${prop} MISSING`);
            allTestsPassed = false;
          }
        });
      } else {
        console.log(`    ❌ milestones.${milestone} MISSING`);
        allTestsPassed = false;
      }
    });
  }
});

// Test 3: Check for empty strings
console.log('\nTest 3: Checking for empty values...');
languages.forEach(lang => {
  const trans = roadmapTranslations[lang];
  let hasEmpty = false;
  
  if (!trans.badge || !trans.title || !trans.subtitle || !trans.description) {
    console.log(`  ❌ ${lang.toUpperCase()} has empty main fields`);
    hasEmpty = true;
    allTestsPassed = false;
  }
  
  requiredMilestoneKeys.forEach(key => {
    const milestone = trans.milestones[key];
    if (!milestone.date || !milestone.title || !milestone.description) {
      console.log(`  ❌ ${lang.toUpperCase()} has empty values in milestone: ${key}`);
      hasEmpty = true;
      allTestsPassed = false;
    }
  });
  
  if (!hasEmpty) {
    console.log(`  ✅ ${lang.toUpperCase()} has no empty values`);
  }
});

// Test 4: Check text length consistency (warning only)
console.log('\nTest 4: Checking text length consistency (warnings only)...');
const lengths = {};

languages.forEach(lang => {
  const trans = roadmapTranslations[lang];
  lengths[lang] = {
    badge: trans.badge.length,
    title: trans.title.length,
    subtitle: trans.subtitle.length,
    description: trans.description.length,
  };
});

// Compare lengths
const avgBadge = Object.values(lengths).reduce((sum, l) => sum + l.badge, 0) / languages.length;
const avgTitle = Object.values(lengths).reduce((sum, l) => sum + l.title, 0) / languages.length;
const avgSubtitle = Object.values(lengths).reduce((sum, l) => sum + l.subtitle, 0) / languages.length;
const avgDesc = Object.values(lengths).reduce((sum, l) => sum + l.description, 0) / languages.length;

languages.forEach(lang => {
  const l = lengths[lang];
  console.log(`  ${lang.toUpperCase()}:`);
  console.log(`    Badge: ${l.badge} chars (avg: ${avgBadge.toFixed(0)})`);
  console.log(`    Title: ${l.title} chars (avg: ${avgTitle.toFixed(0)})`);
  console.log(`    Subtitle: ${l.subtitle} chars (avg: ${avgSubtitle.toFixed(0)})`);
  console.log(`    Description: ${l.description} chars (avg: ${avgDesc.toFixed(0)})`);
  
  // Warn if significantly longer
  if (l.badge > avgBadge * 1.5) {
    console.log(`    ⚠️  Badge is significantly longer than average`);
  }
  if (l.description > avgDesc * 1.5) {
    console.log(`    ⚠️  Description is significantly longer than average`);
  }
});

// Final result
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED! Translations are complete and valid.');
} else {
  console.log('❌ SOME TESTS FAILED! Please review the output above.');
}
console.log('='.repeat(60) + '\n');

export default allTestsPassed;
